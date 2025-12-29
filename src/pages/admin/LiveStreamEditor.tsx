import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Save, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LiveStreamEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = id && id !== "new";
  const [copied, setCopied] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stream_url: "",
    thumbnail_url: "",
    scheduled_at: new Date().toISOString().slice(0, 16),
    is_premium: false,
    is_live: false,
    stream_key: "",
    playback_url: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const { data: stream, isLoading } = useQuery({
    queryKey: ["stream", id],
    queryFn: async () => {
      if (!isEditing) return null;
      const { data, error } = await supabase
        .from("live_streams")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
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
        stream_key: stream.stream_key || "",
        playback_url: stream.playback_url || "",
      });
    }
  }, [stream]);

  const generateStreamKey = () => {
    const key = `live_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    setFormData({ ...formData, stream_key: key });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      title: formData.title,
      description: formData.description,
      stream_url: formData.stream_url,
      thumbnail_url: formData.thumbnail_url,
      scheduled_at: new Date(formData.scheduled_at).toISOString(),
      is_premium: formData.is_premium,
      is_live: formData.is_live,
      stream_key: formData.stream_key,
      playback_url: formData.playback_url,
    };

    try {
      if (isEditing) {
        const { error } = await supabase
          .from("live_streams")
          .update(payload)
          .eq("id", id);
        if (error) throw error;
        toast({ title: "Stream updated successfully" });
      } else {
        const { data: newStream, error } = await supabase
          .from("live_streams")
          .insert([payload])
          .select()
          .single();
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
            toast({ 
              title: "Stream scheduled successfully",
              description: "Subscribers have been notified via email"
            });
          } catch (notifyError) {
            console.error("Failed to send notification:", notifyError);
            toast({ title: "Stream scheduled successfully" });
          }
        }
      }
      queryClient.invalidateQueries({ queryKey: ["admin-streams"] });
      navigate("/admin/streams");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEditing ? "Edit Stream" : "New Stream"} | Admin | Cognitive Ledger</title>
      </Helmet>
      <AdminLayout>
        <div className="max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/streams")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="headline-primary">{isEditing ? "Edit Stream" : "New Stream"}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Scheduled Date & Time</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                required
              />
            </div>

            <ImageUploader
              value={formData.thumbnail_url}
              onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
              label="Upload Thumbnail"
              bucket="stream-thumbnails"
            />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Stream Setup</CardTitle>
                <CardDescription>
                  Use these settings to stream directly to your custom video player instead of YouTube
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stream_key">Stream Key</Label>
                  <div className="flex gap-2">
                    <Input
                      id="stream_key"
                      value={formData.stream_key}
                      onChange={(e) => setFormData({ ...formData, stream_key: e.target.value })}
                      placeholder="Generate or enter a stream key"
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={generateStreamKey}>
                      Generate
                    </Button>
                    {formData.stream_key && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(formData.stream_key, 'stream_key')}
                      >
                        {copied === 'stream_key' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use this key in your streaming software (OBS, etc.)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="playback_url">HLS Playback URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="playback_url"
                      value={formData.playback_url}
                      onChange={(e) => setFormData({ ...formData, playback_url: e.target.value })}
                      placeholder="https://your-stream-server.com/live/stream.m3u8"
                      className="flex-1"
                    />
                    {formData.playback_url && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => copyToClipboard(formData.playback_url, 'playback_url')}
                      >
                        {copied === 'playback_url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    The HLS URL for the custom video player (e.g., from your media server)
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="stream_url">YouTube/External Stream URL (Fallback)</Label>
              <Input
                id="stream_url"
                type="url"
                value={formData.stream_url}
                onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
                placeholder="https://youtube.com/live/..."
              />
              <p className="text-xs text-muted-foreground">
                Only used if no HLS playback URL is set
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="premium"
                checked={formData.is_premium}
                onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })}
              />
              <Label htmlFor="premium">Premium content (subscribers only)</Label>
            </div>

            {isEditing && (
              <div className="flex items-center gap-3">
                <Switch
                  id="is_live"
                  checked={formData.is_live}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_live: checked })}
                />
                <Label htmlFor="is_live">Currently Live</Label>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "Update Stream" : "Schedule Stream"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/admin/streams")}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </>
  );
}
