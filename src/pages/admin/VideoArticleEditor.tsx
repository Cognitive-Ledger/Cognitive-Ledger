import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useArticle, useCreateArticle, useUpdateArticle } from "@/hooks/useArticles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, Upload, Loader2, Video, Play, Link, FileText, Image } from "lucide-react";

interface CaptionTrack {
  src: string;
  label: string;
  language: string;
}

interface VideoFormData {
  title: string;
  slug: string;
  excerpt: string;
  video_url: string;
  thumbnail_url: string;
  captions: CaptionTrack[];
}

type VideoSourceType = 'upload' | 'youtube' | 'vimeo' | 'url';

export default function VideoArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);
  const videoInputRef = useRef<HTMLVideoElement>(null);

  const { data: article, isLoading } = useArticle(id ?? "", { enabled: isEditing });
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();

  const [formData, setFormData] = useState<VideoFormData>({
    title: "",
    slug: "",
    excerpt: "",
    video_url: "",
    thumbnail_url: "",
    captions: [],
  });

  const [uploading, setUploading] = useState(false);
  const [uploadingCaption, setUploadingCaption] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [videoSourceType, setVideoSourceType] = useState<VideoSourceType>('upload');
  const [externalUrl, setExternalUrl] = useState('');

  useEffect(() => {
    if (article) {
      // Parse embeds for captions if they exist
      let captions: CaptionTrack[] = [];
      if (article.embeds && Array.isArray(article.embeds)) {
        const embedData = article.embeds as unknown[];
        const captionEmbed = embedData.find((e: unknown) => 
          typeof e === 'object' && e !== null && (e as Record<string, unknown>).type === 'captions'
        );
        if (captionEmbed && typeof captionEmbed === 'object') {
          const captionData = captionEmbed as Record<string, unknown>;
          if (Array.isArray(captionData.tracks)) {
            captions = captionData.tracks as CaptionTrack[];
          }
        }
      }

      setFormData({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        video_url: article.video_url || "",
        thumbnail_url: article.image_url || "",
        captions,
      });
      
      if (article.video_url) {
        setShowPreview(true);
        // Detect video source type
        if (article.video_url.includes('youtube.com') || article.video_url.includes('youtu.be')) {
          setVideoSourceType('youtube');
          setExternalUrl(article.video_url);
        } else if (article.video_url.includes('vimeo.com')) {
          setVideoSourceType('vimeo');
          setExternalUrl(article.video_url);
        } else if (article.video_url.startsWith('http') && !article.video_url.includes('supabase')) {
          setVideoSourceType('url');
          setExternalUrl(article.video_url);
        }
      }
    }
  }, [article]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error("Video file must be less than 100MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("article-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("article-images")
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, video_url: publicUrl }));
      setShowPreview(true);
      toast.success("Video uploaded successfully");
      
      // Auto-generate thumbnail after upload
      setTimeout(() => generateThumbnailFromVideo(publicUrl), 500);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const handleCaptionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.vtt') && !file.name.endsWith('.srt')) {
      toast.error("Please upload a VTT or SRT caption file");
      return;
    }

    setUploadingCaption(true);
    try {
      const fileName = `${crypto.randomUUID()}.vtt`;
      const filePath = `captions/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("article-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("article-images")
        .getPublicUrl(filePath);

      const newCaption: CaptionTrack = {
        src: publicUrl,
        label: file.name.replace(/\.(vtt|srt)$/i, ''),
        language: 'en',
      };

      setFormData((prev) => ({
        ...prev,
        captions: [...prev.captions, newCaption],
      }));
      toast.success("Caption file uploaded successfully");
    } catch (error) {
      console.error("Caption upload error:", error);
      toast.error("Failed to upload caption file");
    } finally {
      setUploadingCaption(false);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploadingThumbnail(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("article-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("article-images")
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, thumbnail_url: publicUrl }));
      toast.success("Thumbnail uploaded successfully");
    } catch (error) {
      console.error("Thumbnail upload error:", error);
      toast.error("Failed to upload thumbnail");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const generateThumbnailFromVideo = useCallback(async (videoUrl: string) => {
    // For external videos, we can't generate thumbnails
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be') || videoUrl.includes('vimeo.com')) {
      return;
    }

    setGeneratingThumbnail(true);
    try {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      
      await new Promise<void>((resolve, reject) => {
        video.onloadeddata = () => resolve();
        video.onerror = () => reject(new Error('Failed to load video'));
        video.load();
      });

      // Seek to 1 second
      video.currentTime = 1;
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
      });

      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      ctx.drawImage(video, 0, 0);
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create blob'));
        }, 'image/jpeg', 0.85);
      });

      // Upload thumbnail
      const fileName = `${crypto.randomUUID()}.jpg`;
      const filePath = `thumbnails/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("article-images")
        .upload(filePath, blob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("article-images")
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, thumbnail_url: publicUrl }));
      toast.success("Thumbnail generated successfully");
    } catch (error) {
      console.error("Thumbnail generation error:", error);
      // Don't show error toast - thumbnail generation is optional
    } finally {
      setGeneratingThumbnail(false);
    }
  }, []);

  const handleExternalUrlSubmit = () => {
    if (!externalUrl) {
      toast.error("Please enter a video URL");
      return;
    }

    // Validate URL format
    try {
      new URL(externalUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setFormData((prev) => ({ ...prev, video_url: externalUrl }));
    setShowPreview(true);
    toast.success("Video URL added successfully");
  };

  const removeCaption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      captions: prev.captions.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.excerpt) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.video_url) {
      toast.error("Please add a video");
      return;
    }

    // Store captions in embeds
    const embeds = formData.captions.length > 0 
      ? [{ type: 'captions', tracks: formData.captions }]
      : null;

    const articleData = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: `<p>${formData.excerpt}</p>`,
      simple_content: null,
      technical_content: null,
      video_url: formData.video_url,
      image_url: formData.thumbnail_url || null,
      category: "video",
      author: user?.email?.split("@")[0] || "Editorial Team",
      reading_time: 1,
      is_breaking: false,
      is_featured: false,
      business_impact: "medium",
      technical_impact: "medium",
      ethical_risk: "low",
      embeds,
      status: "published",
      scheduled_for: null,
      published_at: new Date().toISOString(),
    };

    try {
      if (isEditing && id) {
        await updateArticle.mutateAsync({ id, ...articleData });
        toast.success("Video article updated");
      } else {
        await createArticle.mutateAsync(articleData);
        toast.success("Video article created");
      }
      navigate("/admin/videos");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save video article");
    }
  };

  if (isEditing && isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/videos")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="headline-primary">
              {isEditing ? "Edit Video" : "New Video Article"}
            </h1>
          </div>
          <Button
            type="submit"
            disabled={createArticle.isPending || updateArticle.isPending}
          >
            {(createArticle.isPending || updateArticle.isPending) && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {isEditing ? "Update Video" : "Publish Video"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="Video title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                placeholder="video-slug"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Description *</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                }
                placeholder="Brief description of the video..."
                rows={4}
                required
              />
            </div>

            {/* Video Source Tabs */}
            <div className="space-y-2">
              <Label>Video Source *</Label>
              <Tabs value={videoSourceType} onValueChange={(v) => setVideoSourceType(v as VideoSourceType)}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="upload">
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="youtube">
                    <Video className="w-4 h-4 mr-1" />
                    YouTube
                  </TabsTrigger>
                  <TabsTrigger value="vimeo">
                    <Video className="w-4 h-4 mr-1" />
                    Vimeo
                  </TabsTrigger>
                  <TabsTrigger value="url">
                    <Link className="w-4 h-4 mr-1" />
                    URL
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Uploading video...</p>
                      </div>
                    ) : formData.video_url && videoSourceType === 'upload' ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <Video className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-sm text-muted-foreground">Video uploaded</p>
                        <label className="cursor-pointer">
                          <span className="text-primary hover:underline text-sm">Replace video</span>
                          <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                        </label>
                      </div>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <Upload className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">Upload video</p>
                          <p className="text-sm text-muted-foreground">MP4, WebM, MOV up to 100MB</p>
                        </div>
                        <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="youtube" className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <Button type="button" onClick={handleExternalUrlSubmit}>
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste a YouTube video URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
                  </p>
                </TabsContent>

                <TabsContent value="vimeo" className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      placeholder="https://vimeo.com/..."
                    />
                    <Button type="button" onClick={handleExternalUrlSubmit}>
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste a Vimeo video URL (e.g., https://vimeo.com/123456789)
                  </p>
                </TabsContent>

                <TabsContent value="url" className="mt-4 space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      placeholder="https://example.com/video.mp4"
                    />
                    <Button type="button" onClick={handleExternalUrlSubmit}>
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste a direct link to a video file (MP4, WebM, etc.)
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <div className="flex gap-3">
                {formData.thumbnail_url ? (
                  <div className="relative w-32 h-20 rounded-md overflow-hidden bg-muted">
                    <img 
                      src={formData.thumbnail_url} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover"
                    />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      <span className="text-white text-xs">Replace</span>
                      <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                    </label>
                  </div>
                ) : (
                  <label className="w-32 h-20 rounded-md border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    {uploadingThumbnail || generatingThumbnail ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <Image className="w-5 h-5 text-muted-foreground" />
                    )}
                    <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                  </label>
                )}
                {formData.video_url && !formData.video_url.includes('youtube') && !formData.video_url.includes('vimeo') && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => generateThumbnailFromVideo(formData.video_url)}
                    disabled={generatingThumbnail}
                  >
                    {generatingThumbnail ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Image className="w-4 h-4 mr-2" />
                    )}
                    Generate from video
                  </Button>
                )}
              </div>
            </div>

            {/* Captions Upload */}
            <div className="space-y-2">
              <Label>Captions/Subtitles</Label>
              <div className="space-y-3">
                {formData.captions.map((caption, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-sm truncate">{caption.label}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCaption(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <label className="flex items-center gap-2 p-3 border border-dashed border-border rounded-md cursor-pointer hover:border-primary transition-colors">
                  {uploadingCaption ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {uploadingCaption ? "Uploading..." : "Upload VTT or SRT caption file"}
                  </span>
                  <input
                    type="file"
                    accept=".vtt,.srt"
                    onChange={handleCaptionUpload}
                    className="hidden"
                    disabled={uploadingCaption}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Video Preview</Label>
              {formData.video_url && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </Button>
              )}
            </div>

            {showPreview && formData.video_url ? (
              <div className="rounded-lg overflow-hidden bg-black aspect-video">
                <VideoPlayer
                  src={formData.video_url}
                  title={formData.title || "Video preview"}
                  poster={formData.thumbnail_url}
                  textTracks={formData.captions.map((c) => ({
                    ...c,
                    kind: 'subtitles' as const,
                  }))}
                />
              </div>
            ) : (
              <div className="rounded-lg bg-muted aspect-video flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Add a video to see preview</p>
                </div>
              </div>
            )}

            {formData.title && (
              <div className="p-4 border border-border rounded-lg">
                <div className="flex gap-3">
                  {formData.thumbnail_url && (
                    <img 
                      src={formData.thumbnail_url} 
                      alt="" 
                      className="w-24 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold mb-1 line-clamp-1">{formData.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {formData.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
