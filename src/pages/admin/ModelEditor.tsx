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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AIModelAssistant } from "@/components/admin/AIModelAssistant";

interface ModelForm {
  name: string;
  version: string;
  provider: string;
  category: string;
  description: string;
  release_date: string;
  parameters: string;
  context_window: string;
  pricing: string;
  benchmarks: string;
}

const initialForm: ModelForm = {
  name: "",
  version: "",
  provider: "",
  category: "LLM",
  description: "",
  release_date: new Date().toISOString().split("T")[0],
  parameters: "",
  context_window: "",
  pricing: "",
  benchmarks: "{}",
};

export default function ModelEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [form, setForm] = useState<ModelForm>(initialForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchModel();
    }
  }, [id]);

  const fetchModel = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("ai_models")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Failed to load model",
        variant: "destructive",
      });
      navigate("/admin/models");
    } else {
      setForm({
        name: data.name,
        version: data.version,
        provider: data.provider,
        category: data.category,
        description: data.description,
        release_date: data.release_date,
        parameters: data.parameters || "",
        context_window: data.context_window || "",
        pricing: data.pricing || "",
        benchmarks: JSON.stringify(data.benchmarks || {}, null, 2),
      });
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.version || !form.provider || !form.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    let benchmarks = {};
    try {
      benchmarks = JSON.parse(form.benchmarks || "{}");
    } catch {
      toast({
        title: "Validation Error",
        description: "Invalid JSON in benchmarks field",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    const modelData = {
      name: form.name,
      version: form.version,
      provider: form.provider,
      category: form.category,
      description: form.description,
      release_date: form.release_date,
      parameters: form.parameters || null,
      context_window: form.context_window || null,
      pricing: form.pricing || null,
      benchmarks,
    };

    let error;

    if (isEditing) {
      const result = await supabase
        .from("ai_models")
        .update(modelData)
        .eq("id", id);
      error = result.error;
    } else {
      const result = await supabase.from("ai_models").insert(modelData);
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
        description: `Model ${isEditing ? "updated" : "created"} successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["models"] });
      navigate("/admin/models");
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
          {isEditing ? "Edit Model" : "Add Model"} | Admin | Cognitive Ledger
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
                onClick={() => navigate("/admin/models")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="headline-primary">
                {isEditing ? "Edit Model" : "Add Model"}
              </h1>
            </div>
            <Button type="submit" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Model"}
            </Button>
          </div>

          {/* AI Model Assistant - only show for new models */}
          {!isEditing && (
            <AIModelAssistant
              onModelFound={(modelData) => {
                setForm({
                  name: modelData.name,
                  version: modelData.version,
                  provider: modelData.provider,
                  category: modelData.category,
                  description: modelData.description,
                  release_date: modelData.release_date,
                  parameters: modelData.parameters,
                  context_window: modelData.context_window,
                  pricing: modelData.pricing,
                  benchmarks: JSON.stringify(modelData.benchmarks || {}, null, 2),
                });
              }}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="GPT-4"
                  />
                </div>

                <div>
                  <Label htmlFor="version">Version *</Label>
                  <Input
                    id="version"
                    value={form.version}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, version: e.target.value }))
                    }
                    placeholder="4.0"
                  />
                </div>

                <div>
                  <Label htmlFor="provider">Provider *</Label>
                  <Input
                    id="provider"
                    value={form.provider}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, provider: e.target.value }))
                    }
                    placeholder="OpenAI"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    placeholder="LLM"
                  />
                </div>

                <div>
                  <Label htmlFor="release_date">Release Date</Label>
                  <Input
                    id="release_date"
                    type="date"
                    value={form.release_date}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, release_date: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder="Brief description of the model"
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Technical Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="parameters">Parameters</Label>
                  <Input
                    id="parameters"
                    value={form.parameters}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, parameters: e.target.value }))
                    }
                    placeholder="175B"
                  />
                </div>

                <div>
                  <Label htmlFor="context_window">Context Window</Label>
                  <Input
                    id="context_window"
                    value={form.context_window}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        context_window: e.target.value,
                      }))
                    }
                    placeholder="128K tokens"
                  />
                </div>

                <div>
                  <Label htmlFor="pricing">Pricing</Label>
                  <Input
                    id="pricing"
                    value={form.pricing}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, pricing: e.target.value }))
                    }
                    placeholder="$0.03/1K tokens"
                  />
                </div>

                <div>
                  <Label htmlFor="benchmarks">Benchmarks (JSON)</Label>
                  <Textarea
                    id="benchmarks"
                    value={form.benchmarks}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, benchmarks: e.target.value }))
                    }
                    placeholder='{"mmlu": 86.4, "humaneval": 67.0}'
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </AdminLayout>
    </>
  );
}
