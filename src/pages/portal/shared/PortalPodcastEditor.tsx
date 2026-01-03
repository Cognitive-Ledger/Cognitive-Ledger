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
import { AudioUploader } from "@/components/admin/AudioUploader";

interface PortalPodcastEditorProps {
  role: "admin" | "editor";
  baseUrl: string;
}

export default function PortalPodcastEditor({ role, baseUrl }: PortalPodcastEditorProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = id && id !== "new";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    audio_url: "",
    image_url: "",
    duration_seconds: 0,
    season_number: 1,
    episode_number: 1,
    is_premium: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  const { data: podcast, isLoading } = useQuery({
    queryKey: ["podcast", id],
    queryFn: async () => {
      if (!isEditing) return null;
      const { data, error } = await supabase.from("podcasts").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!isEditing,
  });

  useEffect(() => {
    if (podcast) {
      setFormData({
        title: podcast.title,
        description: podcast.description,
        audio_url: podcast.audio_url,
        image_url: podcast.image_url || "",
        duration_seconds: podcast.duration_seconds,
        season_number: podcast.season_number || 1,
        episode_number: podcast.episode_number || 1,
        is_premium: podcast.is_premium || false,
      });
    }
  }, [podcast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (isEditing) {
        const { error } = await supabase.from("podcasts").update(formData).eq("id", id);
        if (error) throw error;
        toast.success("Podcast updated successfully");
      } else {
        const { error } = await supabase.from("podcasts").insert([formData]);
        if (error) throw error;
        toast.success("Podcast created successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-podcasts"] });
      navigate(`${baseUrl}/podcasts`);
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
        <title>{isEditing ? "Edit Podcast" : "New Podcast"} | Portal</title>
      </Helmet>
      <div className="max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(`${baseUrl}/podcasts`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{isEditing ? "Edit Podcast" : "New Podcast"}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="season">Season</Label>
              <Input id="season" type="number" min="1" value={formData.season_number} onChange={(e) => setFormData({ ...formData, season_number: parseInt(e.target.value) || 1 })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="episode">Episode</Label>
              <Input id="episode" type="number" min="1" value={formData.episode_number} onChange={(e) => setFormData({ ...formData, episode_number: parseInt(e.target.value) || 1 })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          </div>

          <AudioUploader value={formData.audio_url} onChange={(url) => setFormData({ ...formData, audio_url: url })} label="Upload Audio" />

          <ImageUploader value={formData.image_url} onChange={(url) => setFormData({ ...formData, image_url: url })} label="Upload Cover Image" bucket="podcast-covers" />

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (seconds)</Label>
            <Input id="duration" type="number" min="0" value={formData.duration_seconds} onChange={(e) => setFormData({ ...formData, duration_seconds: parseInt(e.target.value) || 0 })} />
            <p className="text-xs text-muted-foreground">
              {Math.floor(formData.duration_seconds / 60)} minutes {formData.duration_seconds % 60} seconds
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Switch id="premium" checked={formData.is_premium} onCheckedChange={(checked) => setFormData({ ...formData, is_premium: checked })} />
            <Label htmlFor="premium">Premium content (subscribers only)</Label>
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Update Podcast" : "Create Podcast"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate(`${baseUrl}/podcasts`)}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </PortalLayout>
  );
}
