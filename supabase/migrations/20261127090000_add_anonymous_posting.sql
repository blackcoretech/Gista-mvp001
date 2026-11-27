-- Anonymous posting for existing Gista posts table. Existing post rows and columns remain intact.
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS is_anonymous boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS anonymous_alias text,
  ADD COLUMN IF NOT EXISTS anonymous_avatar_color text;

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.anonymous_post_rate_limits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_post_at timestamptz NOT NULL
);
REVOKE ALL ON private.anonymous_post_rate_limits FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.prepare_anonymous_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_aliases text[] := ARRAY[
    'Anonymous Lion','Anonymous Eagle','Anonymous PH Boy',
    'Anonymous Queen','Anonymous Gist Lord','Anonymous Night Owl',
    'Anonymous Stranger'
  ];
  v_colors text[] := ARRAY['#7B2FFF','#FF2FB3','#00C2FF','#FFB800','#00E676'];
  v_last timestamptz;
BEGIN
  IF NEW.is_anonymous IS DISTINCT FROM true THEN
    NEW.anonymous_alias := NULL;
    NEW.anonymous_avatar_color := NULL;
    RETURN NEW;
  END IF;

  IF NEW.content_type = 'voice' THEN
    RAISE EXCEPTION 'Anonymous voice posts are coming soon. Please post as yourself.';
  END IF;

  IF coalesce(NEW.body, '') ~* '(https?://|www\.)'
     OR coalesce(NEW.body, '') ~* '(\+234|0[789][01][0-9]{8})' THEN
    RAISE EXCEPTION 'Anonymous posts cannot contain links or phone numbers.';
  END IF;

  INSERT INTO private.anonymous_post_rate_limits(user_id,last_post_at)
  VALUES (NEW.author_id, now())
  ON CONFLICT (user_id) DO UPDATE
    SET last_post_at = EXCLUDED.last_post_at
    WHERE private.anonymous_post_rate_limits.last_post_at <= now() - interval '2 minutes'
  RETURNING last_post_at INTO v_last;

  IF v_last IS NULL THEN
    RAISE EXCEPTION 'Please wait 2 minutes between anonymous posts.';
  END IF;

  NEW.anonymous_alias := v_aliases[1 + floor(random() * array_length(v_aliases,1))::int]
    || ' ' || (100 + floor(random() * 900)::int)::text;
  NEW.anonymous_avatar_color := v_colors[1 + floor(random() * array_length(v_colors,1))::int];
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.prepare_anonymous_post() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS prepare_anonymous_post_before_insert ON public.posts;
CREATE TRIGGER prepare_anonymous_post_before_insert
BEFORE INSERT ON public.posts
FOR EACH ROW EXECUTE FUNCTION private.prepare_anonymous_post();

-- Existing author/admin update policy remains unchanged. Add admin delete without
-- weakening the existing owner-only delete policy.
DROP POLICY IF EXISTS "anonymous posts are hidden from direct reads" ON public.posts;
CREATE POLICY "anonymous posts are hidden from direct reads"
ON public.posts AS RESTRICTIVE FOR SELECT TO authenticated
USING (NOT is_anonymous OR author_id = (SELECT auth.uid()) OR (SELECT private.is_gista_admin()));

DROP POLICY IF EXISTS "admins can delete any post" ON public.posts;
CREATE POLICY "admins can delete any post"
ON public.posts FOR DELETE TO authenticated
USING ((SELECT private.is_gista_admin()));

-- The view is visible only to authenticated admins. It is security-invoker so
-- the existing posts RLS remains in force as a second access-control layer.
DROP VIEW IF EXISTS public.admin_posts;
CREATE VIEW public.admin_posts
WITH (security_invoker = true)
AS
SELECT p.*
FROM public.posts p
WHERE (SELECT private.is_gista_admin());

REVOKE ALL ON public.admin_posts FROM PUBLIC, anon;
GRANT SELECT ON public.admin_posts TO authenticated;

-- Five reports on the same post automatically hide it using the existing
-- moderation_status field and existing admin reports workflow.
CREATE OR REPLACE FUNCTION private.hide_posts_after_five_reports()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.post_id IS NOT NULL THEN
    UPDATE public.posts
       SET moderation_status = 'removed', updated_at = now()
     WHERE id = NEW.post_id
       AND (SELECT count(*) FROM public.reports r WHERE r.post_id = NEW.post_id) >= 5;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.hide_posts_after_five_reports() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS hide_post_after_five_reports ON public.reports;
CREATE TRIGGER hide_post_after_five_reports
AFTER INSERT ON public.reports
FOR EACH ROW EXECUTE FUNCTION private.hide_posts_after_five_reports();

-- Recreate feed RPCs so anonymous rows never disclose author identity through
-- the normal public feed. Keep existing engagement fields required by Gista UI.
DROP FUNCTION IF EXISTS public.get_fast_home_feed_refresh(text, integer, integer, bigint);
DROP FUNCTION IF EXISTS public.get_fast_home_feed(text, integer, integer);

CREATE FUNCTION public.get_fast_home_feed(
  p_tab text DEFAULT 'Discover',
  p_limit integer DEFAULT 12,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid, body text, content_type text, media_url text, category text,
  status text, created_at timestamptz, author_id uuid,
  voice_duration_seconds integer, display_name text, username text,
  avatar_url text, likes bigint, responses bigint, shares bigint, saves bigint,
  liked boolean, saved boolean, is_anonymous boolean,
  anonymous_alias text, anonymous_avatar_color text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
WITH me AS (SELECT (SELECT auth.uid()) AS user_id),
candidate_posts AS (
 SELECT p.* FROM public.posts p CROSS JOIN me
 WHERE me.user_id IS NOT NULL
 AND (
   p.is_anonymous
   OR p.author_id = me.user_id
   OR EXISTS (SELECT 1 FROM public.profiles prx WHERE prx.id=p.author_id AND prx.is_private=false)
   OR EXISTS (SELECT 1 FROM public.follows fx WHERE fx.follower_id=me.user_id AND fx.following_id=p.author_id)
 )
 AND p.moderation_status = 'visible'
 AND NOT EXISTS (SELECT 1 FROM public.blocks b WHERE b.blocker_id=me.user_id AND b.blocked_id=p.author_id)
 AND NOT EXISTS (SELECT 1 FROM public.not_interested ni WHERE ni.user_id=me.user_id AND ni.post_id=p.id)
 AND (p_tab <> 'Following' OR EXISTS (SELECT 1 FROM public.follows f WHERE f.follower_id=me.user_id AND f.following_id=p.author_id))
 AND (p_tab <> 'Trending' OR p.status='trending')
),
engagement AS (
 SELECT cp.*, COALESCE(lc.count,0)::bigint AS likes, COALESCE(rc.count,0)::bigint AS responses,
 COALESCE(pec.share_count,0)::bigint AS shares, COALESCE(pec.save_count,0)::bigint AS saves
 FROM candidate_posts cp
 LEFT JOIN (SELECT l.post_id,count(*)::bigint AS count FROM public.likes l JOIN candidate_posts c ON c.id=l.post_id GROUP BY l.post_id) lc ON lc.post_id=cp.id
 LEFT JOIN (SELECT r.post_id,count(*)::bigint AS count FROM public.responses r JOIN candidate_posts c ON c.id=r.post_id GROUP BY r.post_id) rc ON rc.post_id=cp.id
 LEFT JOIN public.post_engagement_counts pec ON pec.post_id=cp.id
),
personalized AS (
 SELECT e.*, CASE WHEN p_tab='Trending' THEN 0.0 ELSE
 (CASE WHEN EXISTS (SELECT 1 FROM public.follows f WHERE f.follower_id=(SELECT user_id FROM me) AND f.following_id=e.author_id) THEN CASE WHEN p_tab='Following' THEN 18.0 ELSE 22.0 END ELSE 0.0 END)
 +(SELECT least(18.0,coalesce(sum(2.5),0.0)) FROM public.likes l JOIN public.posts lp ON lp.id=l.post_id WHERE l.user_id=(SELECT user_id FROM me) AND e.category IS NOT NULL AND lp.category=e.category)
 +(SELECT least(12.0,coalesce(sum(2.0),0.0)) FROM public.saves s JOIN public.posts sp ON sp.id=s.post_id WHERE s.user_id=(SELECT user_id FROM me) AND e.category IS NOT NULL AND sp.category=e.category)
 +(SELECT least(10.0,coalesce(sum(2.0),0.0)) FROM public.responses r JOIN public.posts rp ON rp.id=r.post_id WHERE r.author_id=(SELECT user_id FROM me) AND e.category IS NOT NULL AND rp.category=e.category)
 END AS personalization_score FROM engagement e
),
ranked AS (
 SELECT p.*, (8.0*ln(1.0+p.likes)+14.0*ln(1.0+p.responses)+10.0*ln(1.0+p.shares)+12.0*ln(1.0+p.saves)
 +CASE WHEN p.status='trending' THEN 18.0 WHEN p.status='active' THEN 8.0 WHEN p.status='growing' THEN 4.0 ELSE 0.0 END
 +CASE WHEN p_tab='Trending' THEN 0.0 ELSE p.personalization_score END) AS feed_score
 FROM personalized p
)
SELECT r.id,r.body,r.content_type,r.media_url,r.category,r.status,r.created_at,
 CASE WHEN r.is_anonymous THEN NULL ELSE r.author_id END,
 r.voice_duration_seconds,
 CASE WHEN r.is_anonymous THEN NULL ELSE pr.display_name END,
 CASE WHEN r.is_anonymous THEN NULL ELSE pr.username END,
 CASE WHEN r.is_anonymous THEN NULL ELSE pr.avatar_url END,
 r.likes,r.responses,r.shares,r.saves,
 EXISTS(SELECT 1 FROM public.likes ul WHERE ul.post_id=r.id AND ul.user_id=(SELECT user_id FROM me)) AS liked,
 EXISTS(SELECT 1 FROM public.saves us WHERE us.post_id=r.id AND us.user_id=(SELECT user_id FROM me)) AS saved,
 r.is_anonymous,r.anonymous_alias,r.anonymous_avatar_color
FROM ranked r LEFT JOIN public.profiles pr ON pr.id=r.author_id
ORDER BY r.feed_score DESC,r.created_at DESC,r.id DESC
LIMIT greatest(1,least(coalesce(p_limit,12),50)) OFFSET greatest(coalesce(p_offset,0),0);
$function$;

CREATE FUNCTION public.get_fast_home_feed_refresh(
 p_tab text DEFAULT 'Discover', p_limit integer DEFAULT 12,
 p_offset integer DEFAULT 0, p_refresh_seed bigint DEFAULT 0
)
RETURNS TABLE(
 id uuid, body text, content_type text, media_url text, category text,
 status text, created_at timestamptz, author_id uuid,
 voice_duration_seconds integer, display_name text, username text,
 avatar_url text, likes bigint, responses bigint, shares bigint, saves bigint,
 liked boolean, saved boolean, is_anonymous boolean,
 anonymous_alias text, anonymous_avatar_color text
)
LANGUAGE sql
SET search_path TO 'public'
AS $function$
 SELECT f.id,f.body,f.content_type,f.media_url,f.category,f.status,
        f.created_at,f.author_id,f.voice_duration_seconds,f.display_name,
        f.username,f.avatar_url,f.likes,f.responses,f.shares,f.saves,
        f.liked,f.saved,f.is_anonymous,f.anonymous_alias,f.anonymous_avatar_color
 FROM public.get_fast_home_feed(p_tab,50,0) AS f
 ORDER BY md5(f.id::text || ':' || COALESCE(p_refresh_seed,0)::text),
          f.created_at DESC,f.id DESC
 LIMIT greatest(1,least(coalesce(p_limit,12),50))
 OFFSET greatest(coalesce(p_offset,0),0);
$function$;

REVOKE ALL ON FUNCTION public.get_fast_home_feed(text,integer,integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_fast_home_feed_refresh(text,integer,integer,bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_fast_home_feed(text,integer,integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_fast_home_feed_refresh(text,integer,integer,bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_fast_home_feed(text,integer,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_fast_home_feed_refresh(text,integer,integer,bigint) TO service_role;
