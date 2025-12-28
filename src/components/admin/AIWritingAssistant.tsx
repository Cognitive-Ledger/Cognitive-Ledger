import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Loader2, Sparkles, Copy, Check, PenTool, Globe, Wand2, FileText, Zap, BookOpen, BarChart3, Image } from "lucide-react";
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

type ArticleTone = "professional" | "conversational" | "academic" | "engaging";
type ArticleLength = "short" | "medium" | "long" | "comprehensive";

interface StructuredArticle {
  title: string;
  excerpt: string;
  content: string;
  simple_content: string;
  technical_content: string;
}

interface ExtractedImage {
  url: string;
  source?: string;
  selected?: boolean;
}

interface AIWritingAssistantProps {
  currentContent: string;
  onInsertContent: (content: string) => void;
  onInsertStructuredArticle?: (article: StructuredArticle) => void;
  onSelectImage?: (imageUrl: string) => void;
}

export function AIWritingAssistant({ currentContent, onInsertContent, onInsertStructuredArticle, onSelectImage }: AIWritingAssistantProps) {
  const [action, setAction] = useState<AssistAction>("write-article");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [structuredResult, setStructuredResult] = useState<StructuredArticle | null>(null);
  const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Advanced options for write-article
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tone, setTone] = useState<ArticleTone>("professional");
  const [length, setLength] = useState<ArticleLength>("medium");
  const [includeDataViz, setIncludeDataViz] = useState(true);
  const [includeSources, setIncludeSources] = useState(true);
  const [includeQuotes, setIncludeQuotes] = useState(true);
  const [targetKeywords, setTargetKeywords] = useState("");
  const [creativityLevel, setCreativityLevel] = useState([50]);

  const actionLabels: Record<AssistAction, { label: string; description: string; icon: React.ReactNode }> = {
    "write-article": {
      label: "✍️ Write Article",
      description: "Generate a complete, publication-ready article with advanced options",
      icon: <PenTool className="h-4 w-4" />,
    },
    "deep-research": {
      label: "🔍 Deep Research",
      description: "Research the web and write a well-sourced article with data visualizations",
      icon: <Globe className="h-4 w-4" />,
    },
    "generate-outline": {
      label: "📋 Generate Outline",
      description: "Create a structured article outline with key sections",
      icon: <FileText className="h-4 w-4" />,
    },
    "expand-section": {
      label: "📝 Expand Section",
      description: "Expand on a topic or section with more detail",
      icon: <BookOpen className="h-4 w-4" />,
    },
    "simplify": {
      label: "✨ Simplify Content",
      description: "Rewrite content in simpler terms for general audience",
      icon: <Wand2 className="h-4 w-4" />,
    },
    "make-technical": {
      label: "⚙️ Make Technical",
      description: "Add technical depth and detail to content",
      icon: <Zap className="h-4 w-4" />,
    },
    "generate-excerpt": {
      label: "📌 Generate Excerpt",
      description: "Create a compelling summary/excerpt from content",
      icon: <Sparkles className="h-4 w-4" />,
    },
    "improve-writing": {
      label: "🎨 Improve Writing",
      description: "Enhance clarity, flow, and engagement",
      icon: <Sparkles className="h-4 w-4" />,
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
    setExtractedImages([]);

    try {
      // Build enhanced prompt for write-article with options
      let enhancedContent = inputText;
      
      if (action === "write-article" || action === "deep-research") {
        const options = {
          tone,
          length,
          includeDataViz,
          includeSources,
          includeQuotes,
          targetKeywords: targetKeywords.trim() || undefined,
          creativityLevel: creativityLevel[0],
        };
        
        enhancedContent = JSON.stringify({
          topic: inputText,
          options,
        });
      }

      const response = await supabase.functions.invoke("article-ai-assist", {
        body: { action, content: enhancedContent },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setResult(response.data.result);
      
      // Check for structured article data
      if (response.data.structured) {
        setStructuredResult(response.data.structured);
      }
      
      // Check for extracted images from deep research
      if (response.data.images && Array.isArray(response.data.images)) {
        setExtractedImages(response.data.images.map((url: string) => ({ 
          url, 
          selected: false 
        })));
      }
      
      toast({
        title: action === "deep-research" ? "Research complete" : "Content generated",
        description: action === "deep-research" 
          ? "Article generated with web research and visualizations" 
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
        return "Enter the topic for your article...\n\nExamples:\n• The impact of GPT-5 on software development\n• How AI is transforming healthcare diagnostics\n• Analysis of the latest AI regulation proposals";
      case "deep-research":
        return "Enter the topic to research...\n\nExamples:\n• Latest developments in multimodal AI models 2025\n• Comparison of open-source vs closed-source LLMs\n• AI adoption trends in enterprise software";
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
      if (action === "deep-research") return "Researching & generating visuals...";
      if (action === "write-article") return "Writing article...";
      return "Generating...";
    }
    switch (action) {
      case "write-article":
        return "Generate Article";
      case "deep-research":
        return "Research & Write";
      default:
        return "Generate";
    }
  };

  const isArticleAction = action === "write-article" || action === "deep-research";

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Writing Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action selector */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Select Action</Label>
          <Select
            value={action}
            onValueChange={(value) => setAction(value as AssistAction)}
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="write-article" className="py-3">
                <div className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Write Article</div>
                    <div className="text-xs text-muted-foreground">Full article with advanced options</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="deep-research" className="py-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <div>
                    <div className="font-medium">Deep Research</div>
                    <div className="text-xs text-muted-foreground">Web research + charts + images</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="generate-outline">📋 Generate Outline</SelectItem>
              <SelectItem value="expand-section">📝 Expand Section</SelectItem>
              <SelectItem value="simplify">✨ Simplify Content</SelectItem>
              <SelectItem value="make-technical">⚙️ Make Technical</SelectItem>
              <SelectItem value="generate-excerpt">📌 Generate Excerpt</SelectItem>
              <SelectItem value="improve-writing">🎨 Improve Writing</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1.5">
            {actionLabels[action].description}
          </p>
        </div>

        {/* Topic/Prompt input */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">
            {isArticleAction ? "Article Topic" : "Input"}
          </Label>
          <Textarea
            placeholder={getPlaceholder()}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={isArticleAction ? 5 : 4}
            className={action === "deep-research" ? "border-primary/50 focus:border-primary" : ""}
          />
        </div>

        {/* Advanced options for article writing */}
        {isArticleAction && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {showAdvanced ? "▼" : "▶"} Advanced Options
            </button>
            
            {showAdvanced && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                <div className="grid grid-cols-2 gap-4">
                  {/* Tone */}
                  <div>
                    <Label className="text-xs mb-2 block">Writing Tone</Label>
                    <Select value={tone} onValueChange={(v) => setTone(v as ArticleTone)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="conversational">Conversational</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="engaging">Engaging/Storytelling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Length */}
                  <div>
                    <Label className="text-xs mb-2 block">Article Length</Label>
                    <Select value={length} onValueChange={(v) => setLength(v as ArticleLength)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short (~500 words)</SelectItem>
                        <SelectItem value="medium">Medium (~1000 words)</SelectItem>
                        <SelectItem value="long">Long (~1500 words)</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive (~2500+ words)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Target Keywords */}
                <div>
                  <Label className="text-xs mb-2 block">Target Keywords (optional)</Label>
                  <Input
                    placeholder="e.g., AI safety, machine learning, neural networks"
                    value={targetKeywords}
                    onChange={(e) => setTargetKeywords(e.target.value)}
                  />
                </div>

                {/* Creativity slider */}
                <div>
                  <Label className="text-xs mb-2 block">
                    Creativity Level: {creativityLevel[0]}%
                  </Label>
                  <Slider
                    value={creativityLevel}
                    onValueChange={setCreativityLevel}
                    max={100}
                    step={10}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Factual</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Toggle options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm">Include data visualizations</Label>
                    </div>
                    <Switch checked={includeDataViz} onCheckedChange={setIncludeDataViz} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm">Include source citations</Label>
                    </div>
                    <Switch checked={includeSources} onCheckedChange={setIncludeSources} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm">Include expert quotes</Label>
                    </div>
                    <Switch checked={includeQuotes} onCheckedChange={setIncludeQuotes} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generate button */}
        <Button 
          onClick={handleGenerate} 
          disabled={isLoading}
          className="w-full h-11"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {getButtonLabel()}
            </>
          ) : (
            <>
              {actionLabels[action].icon}
              <span className="ml-2">{getButtonLabel()}</span>
            </>
          )}
        </Button>

        {action === "deep-research" && (
          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>🌐 Searches multiple engines • 📊 Generates charts & diagrams • 🖼️ Suggests images</p>
          </div>
        )}

        {/* Extracted Images from Deep Research */}
        {extractedImages.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Image className="h-4 w-4" />
                Source Images ({extractedImages.length})
              </Label>
              <span className="text-xs text-muted-foreground">Click to select as featured image</span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
              {extractedImages.map((img, index) => (
                <div 
                  key={index}
                  className={`relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all hover:border-primary ${
                    img.selected ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                  onClick={() => {
                    if (onSelectImage) {
                      onSelectImage(img.url);
                      setExtractedImages(prev => prev.map((i, idx) => ({
                        ...i,
                        selected: idx === index
                      })));
                      toast({
                        title: "Image selected",
                        description: "Image set as featured image",
                      });
                    }
                  }}
                >
                  <img 
                    src={img.url} 
                    alt={`Source ${index + 1}`}
                    className="w-full h-20 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  {img.selected && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Generated Content</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <Check className="mr-1 h-3 w-3" />
                  ) : (
                    <Copy className="mr-1 h-3 w-3" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
            
            {structuredResult ? (
              <div className="bg-muted rounded-lg p-4 max-h-[500px] overflow-y-auto space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">Title</p>
                  <p className="text-lg font-serif font-medium">{structuredResult.title}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">Excerpt</p>
                  <p className="text-sm text-muted-foreground italic">{structuredResult.excerpt}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide">Main Content Preview</p>
                  <div 
                    className="text-sm prose prose-sm dark:prose-invert max-h-48 overflow-y-auto border rounded p-3 bg-background"
                    dangerouslySetInnerHTML={{ __html: structuredResult.content.substring(0, 800) + "..." }}
                  />
                </div>
                
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>✓ Simple version ({Math.round(structuredResult.simple_content.length / 100) * 100}+ chars)</span>
                  <span>✓ Technical version ({Math.round(structuredResult.technical_content.length / 100) * 100}+ chars)</span>
                </div>
                
                <Button onClick={handleInsertStructured} className="w-full">
                  Insert All Fields into Editor
                </Button>
              </div>
            ) : (
              <div className="bg-muted rounded-lg p-4 max-h-[400px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-sans">
                  {result}
                </pre>
                <Button size="sm" className="mt-3" onClick={handleInsert}>
                  Insert into Editor
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
