import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { EmbedEditor } from "@/components/admin/EmbedEditor";
import type { Embed } from "@/components/articles/EmbedRenderer";
import type { Database } from "@/integrations/supabase/types";

type ArticleCategory = Database["public"]["Enums"]["article_category"];
type ImpactLevel = Database["public"]["Enums"]["impact_level"];

const CATEGORIES = [
  "breaking",
  "research",
  "companies",
  "policy",
  "models",
  "opinion",
  "explainers",
];

const IMPACT_LEVELS = ["low", "medium", "high"];

interface ArticleForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  simple_content: string;
  technical_content: string;
  category: ArticleCategory;
  author: string;
  image_url: string;
  reading_time: number;
  is_breaking: boolean;
  is_featured: boolean;
  business_impact: ImpactLevel;
  technical_impact: ImpactLevel;
  ethical_risk: ImpactLevel;
  embeds: Embed[];
}

const initialForm: ArticleForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  simple_content: "",
  technical_content: "",
  category: "research",
  author: "",
  image_url: "",
  reading_time: 5,
  is_breaking: false,
  is_featured: false,
  business_impact: "medium",
  technical_impact: "medium",
  ethical_risk: "low",
  embeds: [],
};

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [form, setForm] = useState<ArticleForm>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Failed to load article",
        variant: "destructive",
      });
      navigate("/admin/articles");
    } else {
      setForm({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        simple_content: data.simple_content || "",
        technical_content: data.technical_content || "",
        category: data.category,
        author: data.author,
        image_url: data.image_url || "",
        reading_time: data.reading_time,
        is_breaking: data.is_breaking,
        is_featured: data.is_featured,
        business_impact: data.business_impact || "medium",
        technical_impact: data.technical_impact || "medium",
        ethical_risk: data.ethical_risk || "low",
        embeds: (data.embeds as unknown as Embed[]) || [],
      });
    }
    setIsLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: isEditing ? prev.slug : generateSlug(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title || !form.slug || !form.excerpt || !form.content || !form.author) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    const articleData = {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      simple_content: form.simple_content || null,
      technical_content: form.technical_content || null,
      category: form.category,
      author: form.author,
      image_url: form.image_url || null,
      reading_time: form.reading_time,
      is_breaking: form.is_breaking,
      is_featured: form.is_featured,
      business_impact: form.business_impact,
      technical_impact: form.technical_impact,
      ethical_risk: form.ethical_risk,
      embeds: form.embeds as unknown as Database["public"]["Tables"]["articles"]["Insert"]["embeds"],
    };

    let error;

    if (isEditing) {
      const result = await supabase
        .from("articles")
        .update(articleData)
        .eq("id", id);
      error = result.error;
    } else {
      const result = await supabase.from("articles").insert(articleData);
      error = result.error;
    }

    setIsSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Article ${isEditing ? "updated" : "created"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      navigate("/admin/articles");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {isEditing ? "Edit Article" : "New Article"} | Admin | Cognitive Ledger
        </title>
      </Helmet>
      <AdminLayout>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => navigate("/admin/articles")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="headline-primary">
                {isEditing ? "Edit Article" : "New Article"}
              </h1>
            </div>
            <Button type="submit" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Article"}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Article Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Enter article title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={form.slug}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, slug: e.target.value }))
                      }
                      placeholder="article-url-slug"
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Excerpt *</Label>
                    <Textarea
                      id="excerpt"
                      value={form.excerpt}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, excerpt: e.target.value }))
                      }
                      placeholder="Brief summary of the article"
                      rows={3}
                    />
                  </div>

                  <Tabs defaultValue="main">
                    <TabsList>
                      <TabsTrigger value="main">Main Content *</TabsTrigger>
                      <TabsTrigger value="simple">Simple Version</TabsTrigger>
                      <TabsTrigger value="technical">Technical Version</TabsTrigger>
                    </TabsList>
                    <TabsContent value="main">
                      <Textarea
                        value={form.content}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, content: e.target.value }))
                        }
                        placeholder="Main article content (supports markdown)"
                        rows={15}
                      />
                    </TabsContent>
                    <TabsContent value="simple">
                      <Textarea
                        value={form.simple_content}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            simple_content: e.target.value,
                          }))
                        }
                        placeholder="Simplified version for non-technical readers"
                        rows={15}
                      />
                    </TabsContent>
                    <TabsContent value="technical">
                      <Textarea
                        value={form.technical_content}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            technical_content: e.target.value,
                          }))
                        }
                        placeholder="Technical deep-dive for expert readers"
                        rows={15}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Embeds Section */}
              <EmbedEditor
                embeds={form.embeds}
                onChange={(embeds) => setForm((prev) => ({ ...prev, embeds }))}
              />
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={form.category}
                      onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, category: value as ArticleCategory }))
                    }
                  >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="author">Author *</Label>
                    <Input
                      id="author"
                      value={form.author}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, author: e.target.value }))
                      }
                      placeholder="Author name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      value={form.image_url}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, image_url: e.target.value }))
                      }
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="reading_time">Reading Time (minutes)</Label>
                    <Input
                      id="reading_time"
                      type="number"
                      min={1}
                      value={form.reading_time}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          reading_time: parseInt(e.target.value) || 5,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_featured">Featured</Label>
                    <Switch
                      id="is_featured"
                      checked={form.is_featured}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({ ...prev, is_featured: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_breaking">Breaking News</Label>
                    <Switch
                      id="is_breaking"
                      checked={form.is_breaking}
                      onCheckedChange={(checked) =>
                        setForm((prev) => ({ ...prev, is_breaking: checked }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Impact Assessment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Business Impact</Label>
                    <Select
                      value={form.business_impact}
                      onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, business_impact: value as ImpactLevel }))
                    }
                  >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMPACT_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Technical Impact</Label>
                    <Select
                      value={form.technical_impact}
                      onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, technical_impact: value as ImpactLevel }))
                    }
                  >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMPACT_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Ethical Risk</Label>
                    <Select
                      value={form.ethical_risk}
                      onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, ethical_risk: value as ImpactLevel }))
                    }
                  >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IMPACT_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </AdminLayout>
    </>
  );
}
