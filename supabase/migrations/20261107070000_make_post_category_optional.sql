-- The Create Post screen explicitly makes category optional.
-- Allow posts to be inserted with category = NULL when no category is selected.
ALTER TABLE public.posts
  ALTER COLUMN category DROP NOT NULL;
