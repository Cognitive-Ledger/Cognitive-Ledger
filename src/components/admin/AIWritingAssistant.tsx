import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type AssistAction = 
  | "generate-outline"
  | "expand-section"
  | "simplify"
  | "make-technical"
  | "generate-excerpt"
  | "improve-writing";

interface AIWritingAssistantProps {
  currentContent: string;
  onInsertContent: (content: string) => void;
}

export function AIWritingAssistant({ currentContent, onInsertContent }: AIWritingAssistantProps) {
  const [action, setAction] = useState<AssistAction>("generate-outline");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const actionLabels: Record<AssistAction, { label: string; description: string }> = {
    "generate-outline": {
      label: "Generate Outline",
      description: "Create an article outline from a topic or idea",
    },
    "expand-section": {
      label: "Expand Section",
      description: "Expand on a topic or section with more detail",
    },
    "simplify": {
      label: "Simplify Content",
      description: "Rewrite content in simpler terms for general audience",
    },
    "make-technical": {
      label: "Make Technical",
      description: "Add technical depth and detail to content",
    },
    "generate-excerpt": {
      label: "Generate Excerpt",
      description: "Create a compelling summary/excerpt from content",
    },
    "improve-writing": {
      label: "Improve Writing",
      description: "Enhance clarity, flow, and engagement",
    },
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && action !== "simplify" && action !== "make-technical" && action !== "generate-excerpt" && action !== "improve-writing") {
      toast({
        title: "Input required",
        description: "Please enter a topic or content to work with",
        variant: "destructive",
      });
      return;
    }

    const inputText = prompt.trim() || currentContent;
    if (!inputText) {
      toast({
        title: "No content",
        description: "Please provide content or enter a topic",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult("");

    try {
      const response = await supabase.functions.invoke("article-ai-assist", {
        body: { action, content: inputText },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setResult(response.data.result);
    } catch (error) {
      console.error("AI assist error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    });
  };

  const handleInsert = () => {
    onInsertContent(result);
    toast({
      title: "Inserted",
      description: "Content added to the editor",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Writing Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Select
            value={action}
            onValueChange={(value) => setAction(value as AssistAction)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(actionLabels).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {actionLabels[action].description}
          </p>
        </div>

        <Textarea
          placeholder={
            action === "generate-outline"
              ? "Enter a topic or idea for the article..."
              : action === "expand-section"
              ? "Enter the section or topic to expand..."
              : "Leave empty to use current article content, or paste specific text..."
          }
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
        />

        <Button 
          onClick={handleGenerate} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-2">
            <div className="bg-muted rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-sans">
                {result}
              </pre>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button size="sm" onClick={handleInsert}>
                Insert into Editor
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
