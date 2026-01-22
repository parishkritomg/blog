-- Add view_count to posts
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS view_count BIGINT DEFAULT 0;

-- Create site_stats table for global visitor count
CREATE TABLE IF NOT EXISTS public.site_stats (
  id INT PRIMARY KEY DEFAULT 1,
  total_visitors BIGINT DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Initialize site_stats
INSERT INTO public.site_stats (id, total_visitors)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site_stats
CREATE POLICY "Allow public read access to site_stats"
  ON public.site_stats FOR SELECT
  USING (true);

-- Function to increment post view count
CREATE OR REPLACE FUNCTION increment_view_count(post_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment site visitors
CREATE OR REPLACE FUNCTION increment_site_visitors()
RETURNS VOID AS $$
BEGIN
  UPDATE public.site_stats
  SET total_visitors = total_visitors + 1,
      updated_at = now()
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
