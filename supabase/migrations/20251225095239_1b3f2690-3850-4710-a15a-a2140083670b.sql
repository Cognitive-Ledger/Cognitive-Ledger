-- Add video article type to article_category enum
ALTER TYPE article_category ADD VALUE IF NOT EXISTS 'video';

-- Add video_url column to articles table for video articles
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS video_url TEXT;