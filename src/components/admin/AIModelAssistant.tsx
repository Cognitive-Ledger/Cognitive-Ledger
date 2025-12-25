import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ModelData {
  name: string;
  version: string;
  provider: string;
  category: string;
  description: string;
  release_date: string;
  parameters: string;
  context_window: string;
  pricing: string;
  benchmarks: Record<string, number>;
}

interface AIModelAssistantProps {
  onModelFound: (model: ModelData) => void;
}

export function AIModelAssistant({ onModelFound }: AIModelAssistantProps) {
  const [query, setQuery] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const { toast } = useToast();

  const handleResearch = async () => {
    if (!query.trim()) {
      toast({
        title: "Enter a model name",
        description: "Please enter an AI model name to research",
        variant: "destructive",
      });
      return;
    }

    setIsResearching(true);

    try {
      const { data, error } = await supabase.functions.invoke("article-ai-assist", {
        body: {
          action: "research-model",
          content: query.trim(),
        },
      });

      if (error) throw error;

      if (data?.structured) {
        const modelData: ModelData = {
          name: data.structured.name || query,
          version: data.structured.version || "1.0",
          provider: data.structured.provider || "Unknown",
          category: data.structured.category || "LLM",
          description: data.structured.description || "",
          release_date: data.structured.release_date || new Date().toISOString().split("T")[0],
          parameters: data.structured.parameters || "",
          context_window: data.structured.context_window || "",
          pricing: data.structured.pricing || "",
          benchmarks: data.structured.benchmarks || {},
        };

        onModelFound(modelData);
        toast({
          title: "Model research complete",
          description: `Found information for ${modelData.name}`,
        });
      } else {
        toast({
          title: "Research incomplete",
          description: "Could not extract structured model data. Try with a more specific model name.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Model research error:", error);
      toast({
        title: "Research failed",
        description: error instanceof Error ? error.message : "Failed to research model",
        variant: "destructive",
      });
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Model Research
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Enter an AI model name and let AI research and auto-fill all the details.
        </p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., GPT-4o, Claude 3.5 Sonnet, Gemini Pro"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleResearch()}
            disabled={isResearching}
          />
          <Button 
            onClick={handleResearch} 
            disabled={isResearching || !query.trim()}
            className="shrink-0"
          >
            {isResearching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Research
              </>
            )}
          </Button>
        </div>
        {isResearching && (
          <div className="text-sm text-muted-foreground animate-pulse">
            Searching multiple sources and extracting model information...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
