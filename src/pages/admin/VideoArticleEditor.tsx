import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useArticle, useCreateArticle, useUpdateArticle } from "@/hooks/useArticles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { ArrowLeft, Upload, Loader2, Video, Play } from "lucide-react";

interface VideoFormData {
  title: string;
  slug: string;
  excerpt: string;
  video_url: string;
}

export default function VideoArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const { data: article, isLoading } = useArticle(id ?? "", { enabled: isEditing });
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();

  const [formData, setFormData] = useState<VideoFormData>({
    title: "",
    slug: "",
    excerpt: "",
    video_url: "",
  });

  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        video_url: article.video_url || "",
      });
      if (article.video_url) {
        setShowPreview(true);
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

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file");
      return;
    }

    // Validate file size (100MB max)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.excerpt) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.video_url) {
      toast.error("Please upload a video");
      return;
    }

    const articleData = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt,
      content: `<p>${formData.excerpt}</p>`,
      simple_content: null,
      technical_content: null,
      video_url: formData.video_url,
      image_url: null,
      category: "video",
      author: user?.email?.split("@")[0] || "Editorial Team",
      reading_time: 1,
      is_breaking: false,
      is_featured: false,
      business_impact: "medium",
      technical_impact: "medium",
      ethical_risk: "low",
      embeds: null,
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
      <form onSubmit={handleSubmit} className="max-w-4xl">
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

            {/* Video Upload */}
            <div className="space-y-2">
              <Label>Video File *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Uploading video...
                    </p>
                  </div>
                ) : formData.video_url ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <Video className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Video uploaded successfully
                    </p>
                    <label className="cursor-pointer">
                      <span className="text-primary hover:underline text-sm">
                        Replace video
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Upload video</p>
                      <p className="text-sm text-muted-foreground">
                        MP4, WebM, MOV up to 100MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </label>
                )}
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
                />
              </div>
            ) : (
              <div className="rounded-lg bg-muted aspect-video flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Upload a video to see preview</p>
                </div>
              </div>
            )}

            {formData.title && (
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-semibold mb-1">{formData.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {formData.excerpt}
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
