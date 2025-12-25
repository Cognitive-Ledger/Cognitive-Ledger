-- Add article scheduling support
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'scheduled', 'published'));

-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to article images
CREATE POLICY "Article images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'article-images');

-- Allow authenticated users with editorial access to upload images
CREATE POLICY "Editors can upload article images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'article-images' 
  AND auth.role() = 'authenticated'
  AND public.has_editorial_access(auth.uid())
);

-- Allow editors to update their uploads
CREATE POLICY "Editors can update article images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'article-images' 
  AND auth.role() = 'authenticated'
  AND public.has_editorial_access(auth.uid())
);

-- Allow editors to delete images
CREATE POLICY "Editors can delete article images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'article-images' 
  AND auth.role() = 'authenticated'
  AND public.has_editorial_access(auth.uid())
);