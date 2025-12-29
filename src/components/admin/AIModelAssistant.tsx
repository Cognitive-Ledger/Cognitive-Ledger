import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Search, CheckCircle2, AlertCircle, Globe, Database, Cpu } from "lucide-react";
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

type ResearchStage = 'idle' | 'searching' | 'scraping' | 'analyzing' | 'complete' | 'error';

const STAGE_INFO: Record<ResearchStage, { label: string; icon: typeof Search; progress: number }> = {
  idle: { label: 'Ready', icon: Search, progress: 0 },
  searching: { label: 'Searching sources...', icon: Globe, progress: 25 },
  scraping: { label: 'Gathering data...', icon: Database, progress: 50 },
  analyzing: { label: 'Analyzing with AI...', icon: Cpu, progress: 75 },
  complete: { label: 'Complete!', icon: CheckCircle2, progress: 100 },
  error: { label: 'Error occurred', icon: AlertCircle, progress: 0 },
};

const POPULAR_MODELS = [
  "GPT-5",
  "Claude 4 Opus", 
  "Gemini 2.5 Pro",
  "Llama 4",
  "Mistral Large 2",
  "DeepSeek V3",
];

export function AIModelAssistant({ onModelFound }: AIModelAssistantProps) {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<ResearchStage>('idle');
  const [isResearching, setIsResearching] = useState(false);
  const { toast } = useToast();

  const handleResearch = async (modelName?: string) => {
    const searchQuery = modelName || query.trim();
    if (!searchQuery) {
      toast({
        title: "Enter a model name",
        description: "Please enter an AI model name to research",
        variant: "destructive",
      });
      return;
    }

    setIsResearching(true);
    setStage('searching');

    // Simulate progress stages
    const stageTimers: NodeJS.Timeout[] = [];
    stageTimers.push(setTimeout(() => setStage('scraping'), 2000));
    stageTimers.push(setTimeout(() => setStage('analyzing'), 5000));

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/article-ai-assist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          action: "research-model",
          content: searchQuery,
        }),
        signal: AbortSignal.timeout(180000), // 3 minute timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Clear stage timers
      stageTimers.forEach(clearTimeout);

      if (data?.structured) {
        setStage('complete');
        const modelData: ModelData = {
          name: data.structured.name || searchQuery,
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
          title: "Research complete",
          description: `Found detailed information for ${modelData.name}`,
        });

        // Reset after a delay
        setTimeout(() => {
          setStage('idle');
          setQuery("");
        }, 2000);
      } else {
        setStage('error');
        toast({
          title: "Research incomplete",
          description: "Could not extract structured model data. Try with a more specific model name.",
          variant: "destructive",
        });
        setTimeout(() => setStage('idle'), 3000);
      }
    } catch (error) {
      // Clear stage timers
      stageTimers.forEach(clearTimeout);
      setStage('error');
      console.error("Model research error:", error);
      toast({
        title: "Research failed",
        description: error instanceof Error ? error.message : "Failed to research model",
        variant: "destructive",
      });
      setTimeout(() => setStage('idle'), 3000);
    } finally {
      setIsResearching(false);
    }
  };

  const StageIcon = STAGE_INFO[stage].icon;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Model Research
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Enter an AI model name and let AI research all specifications, benchmarks, and details automatically.
        </p>

        {/* Popular models quick select */}
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_MODELS.map((model) => (
            <Badge
              key={model}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs"
              onClick={() => !isResearching && handleResearch(model)}
            >
              {model}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="e.g., GPT-4o, Claude 3.5 Sonnet, Gemini Pro"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleResearch()}
            disabled={isResearching}
            className="flex-1"
          />
          <Button 
            onClick={() => handleResearch()} 
            disabled={isResearching || !query.trim()}
            className="shrink-0"
          >
            {isResearching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Researching
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Research
              </>
            )}
          </Button>
        </div>

        {/* Progress indicator */}
        {stage !== 'idle' && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <StageIcon className={`h-4 w-4 ${stage === 'complete' ? 'text-green-500' : stage === 'error' ? 'text-destructive' : 'text-primary animate-pulse'}`} />
              <span className={stage === 'complete' ? 'text-green-500 font-medium' : stage === 'error' ? 'text-destructive' : 'text-muted-foreground'}>
                {STAGE_INFO[stage].label}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ease-out rounded-full ${
                  stage === 'complete' ? 'bg-green-500' : stage === 'error' ? 'bg-destructive' : 'bg-primary'
                }`}
                style={{ width: `${STAGE_INFO[stage].progress}%` }}
              />
            </div>
            {isResearching && (
              <p className="text-xs text-muted-foreground">
                Searching official docs, benchmarks, and trusted sources...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}