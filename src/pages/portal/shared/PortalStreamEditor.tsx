import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { ImageUploader } from "@/components/admin/ImageUploader";

interface PortalStreamEditorProps {
  role: "admin" | "editor";
  baseUrl: string;
}

export default function PortalStreamEditor({ role, baseUrl }: PortalStreamEditorProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = id && id !== "new";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stream_url: "",
    thumbnail_url: "",
    scheduled_at: new Date().toISOString().slice(0, 16),
    is_premium: false,
    is_live: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const { data: stream, isLoading } = useQuery({
    queryKey: ["stream", id],
    queryFn: async () => {
      if (!isEditing) return null;
      const { data, error } = await supabase.from("live_streams").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!isEditing,
  });

  useEffect(() => {
    if (stream) {
      setFormData({
        title: stream.title,
        description: stream.description,
        stream_url: stream.stream_url || "",
        thumbnail_url: stream.thumbnail_url || "",
        scheduled_at: new Date(stream.scheduled_at).toISOString().slice(0, 16),
        is_premium: stream.is_premium || false,
        is_live: stream.is_live || false,
      });
    }
  }, [stream]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      title: formData.title,
      description: formData.description,
      stream_url: formData.stream_url || null,
      thumbnail_url: formData.thumbnail_url || null,
      scheduled_at: new Date(formData.scheduled_at).toISOString(),
      is_premium: formData.is_premium,
      is_live: formData.is_live,
    };

    try {
      if (isEditing) {
        const { error } = await supabase.from("live_streams").update(payload).eq("id", id);
        if (error) throw error;
        toast.success("Stream updated successfully");
      } else {
        const { data: newStream, error } = await supabase.from("live_streams").insert([payload]).select().single();
        if (error) throw error;

        if (newStream) {
          try {
            await supabase.functions.invoke("send-stream-notification", {
              body: {
                streamId: newStream.id,
                streamTitle: newStream.title,
                streamDescription: newStream.description,
                scheduledAt: newStream.scheduled_at,
                notificationType: "scheduled",
              },
            });
            toast.success("Stream scheduled. Subscribers notified!");
          } catch {
            toast.success("Stream scheduled successfully");
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ["admin-streams"] });
      navigate(`${baseUrl}/streams`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PortalLayout requiredRole={role}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout requiredRole={role}>
      <Helmet>
        <title>{isEditing ? "Edit Stream" : "New Stream"} | Portal</title>
      </Helmet>
      <div className="max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(`${baseUrl}/streams`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit Stream" : "New Stream"}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_at">Scheduled Date & Time</Label>
            <Input id="scheduled_at" type="datetime-local" value={formData.scheduled_at} onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })} required />
          </div>

          <ImageUploader value={formData.thumbnail_url} onChange={(url) => setFormData({ ...formData, thumbnail_url: url })} label="Upload Thumbnail" bucket="stream-thumbnails" />

          <div className="space-y-2">
            <Label htmlFor="stream_url">YouTube Live URL</Label>
            <Input id="stream_url" type="url" value={formData.stream_url} onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })} placeholder="https://youtube.com/live/..." />
            <p className="text-xs text-muted-foreground">Paste the YouTube Live stream URL.</p>
          </div>

          <div className="flex items-center gap-3">
            <Switch id="premium" checked={formData.is_premium} onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })} />
            <Label htmlFor="premium">Premium content (subscribers only)</Label>
          </div>

          {isEditing && (
            <div className="flex items-center gap-3">
              <Switch id="is_live" checked={formData.is_live} onCheckedChange={(checked) => setFormData({ ...formData, is_live: checked })} />
              <Label htmlFor="is_live">Currently Live</Label>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Update Stream" : "Schedule Stream"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(`${baseUrl}/streams`)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
}
