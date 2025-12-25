-- Add embeds column to articles table for storing charts, Google Sheets, videos, etc.
ALTER TABLE public.articles ADD COLUMN embeds jsonb DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.articles.embeds IS 'JSON array of embed objects with type, url, title, and position';