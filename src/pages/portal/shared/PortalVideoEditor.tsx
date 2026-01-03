import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
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
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Upload, Loader2, Video, Link as LinkIcon } from "lucide-react";

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

interface PortalVideoEditorProps {
  role: "admin" | "editor";
  baseUrl: string;
}

export default function PortalVideoEditor({ role, baseUrl }: PortalVideoEditorProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id) && id !== "new";

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
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [videoSourceType, setVideoSourceType] = useState<VideoSourceType>('upload');
  const [externalUrl, setExternalUrl] = useState('');

  useEffect(() => {
    if (article) {
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
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload video");
    } finally {
      setUploading(false);
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

  const handleExternalUrlSubmit = () => {
    if (!externalUrl) {
      toast.error("Please enter a video URL");
      return;
    }

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

    const embeds = formData.captions.length > 0 
      ? [{ type: 'captions', tracks: formData.captions }]
      : null;

    const articleData = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: `<p>${formData.excerpt}</p>`,
      video_url: formData.video_url,
      image_url: formData.thumbnail_url || null,
      category: "video" as const,
      author: user?.email?.split("@")[0] || "Editorial Team",
      reading_time: 1,
      is_breaking: false,
      is_featured: false,
      business_impact: "medium" as const,
      technical_impact: "medium" as const,
      ethical_risk: "low" as const,
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
      navigate(`${baseUrl}/videos`);
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save video article");
    }
  };

  if (isEditing && isLoading) {
    return (
      <PortalLayout requiredRole={role}>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout requiredRole={role}>
      <Helmet>
        <title>{isEditing ? "Edit Video" : "New Video"} | Portal</title>
      </Helmet>
      <form onSubmit={handleSubmit} className="max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button type="button" variant="ghost" size="sm" onClick={() => navigate(`${baseUrl}/videos`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">{isEditing ? "Edit Video" : "New Video Article"}</h1>
          </div>
          <Button type="submit" disabled={createArticle.isPending || updateArticle.isPending}>
            {(createArticle.isPending || updateArticle.isPending) && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {isEditing ? "Update Video" : "Publish Video"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={formData.title} onChange={handleTitleChange} placeholder="Video title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input id="slug" value={formData.slug} onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))} placeholder="video-slug" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Description *</Label>
              <Textarea id="excerpt" value={formData.excerpt} onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))} placeholder="Brief description of the video..." rows={4} required />
            </div>

            <div className="space-y-2">
              <Label>Video Source *</Label>
              <Tabs value={videoSourceType} onValueChange={(v) => setVideoSourceType(v as VideoSourceType)}>
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="upload"><Upload className="w-4 h-4 mr-1" />Upload</TabsTrigger>
                  <TabsTrigger value="youtube"><Video className="w-4 h-4 mr-1" />YouTube</TabsTrigger>
                  <TabsTrigger value="vimeo"><Video className="w-4 h-4 mr-1" />Vimeo</TabsTrigger>
                  <TabsTrigger value="url"><LinkIcon className="w-4 h-4 mr-1" />URL</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Uploading video...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">Click or drag to upload (max 100MB)</p>
                        <Input type="file" accept="video/*" onChange={handleVideoUpload} className="max-w-xs mx-auto" />
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="youtube" className="mt-4 space-y-2">
                  <Input placeholder="https://youtube.com/watch?v=..." value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} />
                  <Button type="button" onClick={handleExternalUrlSubmit}>Add YouTube Video</Button>
                </TabsContent>

                <TabsContent value="vimeo" className="mt-4 space-y-2">
                  <Input placeholder="https://vimeo.com/..." value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} />
                  <Button type="button" onClick={handleExternalUrlSubmit}>Add Vimeo Video</Button>
                </TabsContent>

                <TabsContent value="url" className="mt-4 space-y-2">
                  <Input placeholder="https://..." value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} />
                  <Button type="button" onClick={handleExternalUrlSubmit}>Add Video URL</Button>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                {formData.thumbnail_url ? (
                  <div className="relative">
                    <img src={formData.thumbnail_url} alt="Thumbnail" className="max-h-32 mx-auto rounded" />
                    <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => setFormData(prev => ({ ...prev, thumbnail_url: "" }))}>
                      Remove
                    </Button>
                  </div>
                ) : uploadingThumbnail ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  <Input type="file" accept="image/*" onChange={handleThumbnailUpload} className="max-w-xs mx-auto" />
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Video Preview</Label>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                {showPreview && formData.video_url ? (
                  <VideoPlayer src={formData.video_url} title={formData.title} poster={formData.thumbnail_url} />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Video className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </PortalLayout>
  );
}
