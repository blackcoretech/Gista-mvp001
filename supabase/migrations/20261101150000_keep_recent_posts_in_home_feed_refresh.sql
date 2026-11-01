-- Keep the newest three eligible Posts in every refreshed Home feed.
-- The previous refresh wrapper randomly selected 12 from the top 50 ranked
-- Posts. That made a newly published Post appear on one refresh and disappear
-- on the next, even though the row remained saved in public.posts.
CREATE OR REPLACE FUNCTION public.get_fast_home_feed_refresh(
  p_tab text DEFAULT 'Discover'::text,
  p_limit integer DEFAULT 12,
  p_offset integer DEFAULT 0,
  p_refresh_seed bigint DEFAULT 0
)
RETURNS TABLE(
  id uuid, body text, content_type text, media_url text, category text, status text,
  created_at timestamptz, author_id uuid, voice_duration_seconds integer,
  display_name text, username text, avatar_url text, likes bigint, responses bigint,
  shares bigint, saves bigint, liked boolean, saved boolean
)
LANGUAGE sql
SET search_path TO 'public'
AS $function$
  WITH feed AS MATERIALIZED (
    SELECT *
    FROM public.get_fast_home_feed(p_tab, 50, 0)
  ),
  newest AS (
    SELECT f.id
    FROM feed f
    ORDER BY f.created_at DESC, f.id DESC
    LIMIT 3
  )
  SELECT f.id, f.body, f.content_type, f.media_url, f.category, f.status,
         f.created_at, f.author_id, f.voice_duration_seconds, f.display_name,
         f.username, f.avatar_url, f.likes, f.responses, f.shares, f.saves,
         f.liked, f.saved
  FROM feed f
  LEFT JOIN newest n ON n.id = f.id
  ORDER BY
    (n.id IS NOT NULL) DESC,
    CASE WHEN n.id IS NOT NULL THEN f.created_at END DESC,
    CASE WHEN n.id IS NULL
      THEN md5(f.id::text || ':' || COALESCE(p_refresh_seed, 0)::text)
    END,
    f.created_at DESC,
    f.id DESC
  LIMIT greatest(1, least(coalesce(p_limit, 12), 50))
  OFFSET greatest(coalesce(p_offset, 0), 0);
$function$;

GRANT EXECUTE ON FUNCTION public.get_fast_home_feed_refresh(text, integer, integer, bigint) TO authenticated;
