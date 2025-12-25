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
import { Loader2, Sparkles, Copy, Check, PenTool, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type AssistAction = 
  | "generate-outline"
  | "expand-section"
  | "simplify"
  | "make-technical"
  | "generate-excerpt"
  | "improve-writing"
  | "write-article"
  | "deep-research";

interface StructuredArticle {
  title: string;
  excerpt: string;
  content: string;
  simple_content: string;
  technical_content: string;
}

interface AIWritingAssistantProps {
  currentContent: string;
  onInsertContent: (content: string) => void;
  onInsertStructuredArticle?: (article: StructuredArticle) => void;
}

export function AIWritingAssistant({ currentContent, onInsertContent, onInsertStructuredArticle }: AIWritingAssistantProps) {
  const [action, setAction] = useState<AssistAction>("write-article");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [structuredResult, setStructuredResult] = useState<StructuredArticle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const actionLabels: Record<AssistAction, { label: string; description: string; icon?: React.ReactNode }> = {
    "write-article": {
      label: "✍️ Write Article",
      description: "Generate a complete article from a topic or prompt",
      icon: <PenTool className="h-4 w-4" />,
    },
    "deep-research": {
      label: "🔍 Deep Research",
      description: "Research the web and write a well-sourced article",
      icon: <Globe className="h-4 w-4" />,
    },
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
    // For article writing actions, prompt is required
    if (action === "write-article" || action === "deep-research") {
      if (!prompt.trim()) {
        toast({
          title: "Topic required",
          description: "Please enter a topic or prompt for the article",
          variant: "destructive",
        });
        return;
      }
    } else if (!prompt.trim() && action !== "simplify" && action !== "make-technical" && action !== "generate-excerpt" && action !== "improve-writing") {
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
    setStructuredResult(null);

    try {
      const response = await supabase.functions.invoke("article-ai-assist", {
        body: { action, content: inputText },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setResult(response.data.result);
      
      // Check for structured article data
      if (response.data.structured) {
        setStructuredResult(response.data.structured);
      }
      
      toast({
        title: action === "deep-research" ? "Research complete" : "Content generated",
        description: action === "deep-research" 
          ? "Article generated with web research" 
          : "AI has generated your content",
      });
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

  const handleInsertStructured = () => {
    if (structuredResult && onInsertStructuredArticle) {
      onInsertStructuredArticle(structuredResult);
      toast({
        title: "Article inserted",
        description: "Title, excerpt, and all content versions have been added to the form",
      });
    }
  };

  const getPlaceholder = () => {
    switch (action) {
      case "write-article":
        return "Enter the topic, headline, or detailed prompt for your article...\n\nExample: \"The impact of GPT-5 on software development workflows\"";
      case "deep-research":
        return "Enter the topic to research and write about...\n\nExample: \"Latest developments in multimodal AI models 2024\"";
      case "generate-outline":
        return "Enter a topic or idea for the article...";
      case "expand-section":
        return "Enter the section or topic to expand...";
      default:
        return "Leave empty to use current article content, or paste specific text...";
    }
  };

  const getButtonLabel = () => {
    if (isLoading) {
      return action === "deep-research" ? "Researching..." : "Generating...";
    }
    switch (action) {
      case "write-article":
        return "Write Article";
      case "deep-research":
        return "Research & Write";
      default:
        return "Generate";
    }
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
              <SelectItem value="write-article" className="font-medium">
                ✍️ Write Article
              </SelectItem>
              <SelectItem value="deep-research" className="font-medium">
                🔍 Deep Research
              </SelectItem>
              <SelectItem value="generate-outline">Generate Outline</SelectItem>
              <SelectItem value="expand-section">Expand Section</SelectItem>
              <SelectItem value="simplify">Simplify Content</SelectItem>
              <SelectItem value="make-technical">Make Technical</SelectItem>
              <SelectItem value="generate-excerpt">Generate Excerpt</SelectItem>
              <SelectItem value="improve-writing">Improve Writing</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {actionLabels[action].description}
          </p>
        </div>

        <Textarea
          placeholder={getPlaceholder()}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={action === "write-article" || action === "deep-research" ? 6 : 4}
          className={action === "deep-research" ? "border-primary/50" : ""}
        />

        <Button 
          onClick={handleGenerate} 
          disabled={isLoading}
          className="w-full"
          variant={action === "deep-research" ? "default" : "default"}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {getButtonLabel()}
            </>
          ) : (
            <>
              {action === "deep-research" ? (
                <Globe className="mr-2 h-4 w-4" />
              ) : action === "write-article" ? (
                <PenTool className="mr-2 h-4 w-4" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {getButtonLabel()}
            </>
          )}
        </Button>

        {action === "deep-research" && (
          <p className="text-xs text-muted-foreground text-center">
            Uses Jina Reader to scrape web sources, plus Wikipedia, Hacker News &amp; arXiv
          </p>
        )}

        {result && (
          <div className="space-y-2">
            {structuredResult ? (
              <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Title</p>
                  <p className="text-sm font-semibold">{structuredResult.title}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Excerpt</p>
                  <p className="text-sm">{structuredResult.excerpt}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Main Content Preview</p>
                  <div 
                    className="text-sm prose prose-sm max-h-32 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: structuredResult.content.substring(0, 500) + "..." }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  + Simple version ({structuredResult.simple_content.length} chars) 
                  + Technical version ({structuredResult.technical_content.length} chars)
                </p>
              </div>
            ) : (
              <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-sans">
                  {result}
                </pre>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              {structuredResult && onInsertStructuredArticle ? (
                <Button size="sm" onClick={handleInsertStructured}>
                  Insert All Fields
                </Button>
              ) : (
                <Button size="sm" onClick={handleInsert}>
                  Insert into Editor
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
