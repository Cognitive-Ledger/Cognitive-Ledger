import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Send, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { Database } from "@/integrations/supabase/types";

type ArticleCategory = Database["public"]["Enums"]["article_category"];

const categories: { value: ArticleCategory; label: string }[] = [
  { value: "breaking", label: "Breaking News" },
  { value: "research", label: "Research" },
  { value: "companies", label: "Companies" },
  { value: "policy", label: "Policy" },
  { value: "models", label: "Models" },
  { value: "opinion", label: "Opinion" },
  { value: "explainers", label: "Explainers" },
];

export default function ContributorSubmit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ArticleCategory>("research");
  const [imageUrl, setImageUrl] = useState("");

  // Fetch article if editing
  const { data: existingArticle, isLoading: loadingArticle } = useQuery({
    queryKey: ["article", editId],
    queryFn: async () => {
      if (!editId) return null;
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", editId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!editId,
  });

  useEffect(() => {
    if (existingArticle) {
      setTitle(existingArticle.title);
      setExcerpt(existingArticle.excerpt);
      setContent(existingArticle.content);
      setCategory(existingArticle.category);
      setImageUrl(existingArticle.image_url || "");
    }
  }, [existingArticle]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const saveMutation = useMutation({
    mutationFn: async ({ status }: { status: string }) => {
      const slug = generateSlug(title);
      const articleData = {
        title,
        excerpt,
        content,
        category,
        image_url: imageUrl || null,
        slug,
        author: user?.email || "Unknown",
        status,
        reading_time: Math.ceil(content.split(" ").length / 200),
      };

      if (editId) {
        const { error } = await supabase
          .from("articles")
          .update(articleData)
          .eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("articles").insert(articleData);
        if (error) throw error;
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["contributor-articles"] });
      queryClient.invalidateQueries({ queryKey: ["contributor-all-articles"] });
      queryClient.invalidateQueries({ queryKey: ["contributor-pending-articles"] });
      toast({
        title: status === "pending" ? "Article Submitted" : "Draft Saved",
        description:
          status === "pending"
            ? "Your article has been submitted for review."
            : "Your draft has been saved.",
      });
      navigate("/portal/contributor/submissions");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveDraft = () => {
    if (!title.trim()) {
      toast({ title: "Title required", description: "Please enter a title", variant: "destructive" });
      return;
    }
    saveMutation.mutate({ status: "draft" });
  };

  const handleSubmit = () => {
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate({ status: "pending" });
  };

  if (loadingArticle) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <Helmet>
        <title>{editId ? "Edit Article" : "Submit Article"} | Cognitive Ledger Portal</title>
      </Helmet>

      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/portal/contributor/submissions">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {editId ? "Edit Article" : "Submit New Article"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {editId ? "Update your article submission" : "Create a new article for review"}
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
              <CardDescription>Basic information about your article</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter article title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Brief summary of your article (displayed in article previews)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as ArticleCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Featured Image</Label>
                <ImageUploader value={imageUrl} onChange={setImageUrl} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content *</CardTitle>
              <CardDescription>Write your article content</CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor content={content} onChange={setContent} />
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save as Draft
            </Button>
            <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Submit for Review
            </Button>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
