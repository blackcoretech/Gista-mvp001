-- Refresh the complete eligible Home pool in a new order; never sample a
-- smaller random subset that makes eligible Posts disappear between refreshes.
-- Discover refresh callers request the full 50-Post pool. Ordering is shuffled
-- per refresh seed, while membership remains the same for that eligible pool.
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
  SELECT f.id, f.body, f.content_type, f.media_url, f.category, f.status,
         f.created_at, f.author_id, f.voice_duration_seconds, f.display_name,
         f.username, f.avatar_url, f.likes, f.responses, f.shares, f.saves,
         f.liked, f.saved
  FROM public.get_fast_home_feed(p_tab, 50, 0) AS f
  ORDER BY md5(f.id::text || ':' || COALESCE(p_refresh_seed, 0)::text),
           f.created_at DESC, f.id DESC
  LIMIT greatest(1, least(coalesce(p_limit, 12), 50))
  OFFSET greatest(coalesce(p_offset, 0), 0);
$function$;

GRANT EXECUTE ON FUNCTION public.get_fast_home_feed_refresh(text, integer, integer, bigint) TO authenticated;
