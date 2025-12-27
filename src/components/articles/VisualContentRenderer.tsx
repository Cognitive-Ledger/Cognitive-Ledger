import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, Image as ImageIcon, BarChart3, GitBranch } from "lucide-react";

interface VisualContentProps {
  type: "chart" | "graph" | "diagram" | "image";
  description: string;
  data?: any;
}

// Color palette for charts
const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "#8884d8", "#82ca9d", "#ffc658"];

// Generate mock data based on description
function generateChartData(description: string): any[] {
  const lowerDesc = description.toLowerCase();
  
  // Try to extract meaningful patterns from description
  if (lowerDesc.includes("performance") || lowerDesc.includes("benchmark")) {
    return [
      { name: "GPT-4", value: 86, fullMark: 100 },
      { name: "Claude 3", value: 83, fullMark: 100 },
      { name: "Gemini", value: 81, fullMark: 100 },
      { name: "Llama 3", value: 78, fullMark: 100 },
      { name: "Mistral", value: 74, fullMark: 100 },
    ];
  }
  
  if (lowerDesc.includes("growth") || lowerDesc.includes("trend") || lowerDesc.includes("over time")) {
    return [
      { name: "2020", value: 15, growth: 10 },
      { name: "2021", value: 28, growth: 18 },
      { name: "2022", value: 45, growth: 35 },
      { name: "2023", value: 72, growth: 58 },
      { name: "2024", value: 95, growth: 82 },
      { name: "2025", value: 120, growth: 100 },
    ];
  }
  
  if (lowerDesc.includes("market") || lowerDesc.includes("share") || lowerDesc.includes("distribution")) {
    return [
      { name: "OpenAI", value: 35 },
      { name: "Google", value: 25 },
      { name: "Microsoft", value: 18 },
      { name: "Anthropic", value: 12 },
      { name: "Others", value: 10 },
    ];
  }
  
  if (lowerDesc.includes("comparison") || lowerDesc.includes("versus") || lowerDesc.includes("vs")) {
    return [
      { name: "Speed", modelA: 85, modelB: 78 },
      { name: "Accuracy", modelA: 92, modelB: 88 },
      { name: "Cost", modelA: 60, modelB: 75 },
      { name: "Context", modelA: 90, modelB: 85 },
      { name: "Safety", modelA: 88, modelB: 92 },
    ];
  }
  
  // Default data
  return [
    { name: "Category A", value: 40 },
    { name: "Category B", value: 30 },
    { name: "Category C", value: 20 },
    { name: "Category D", value: 10 },
  ];
}

function generateDiagramSteps(description: string): string[] {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes("training") || lowerDesc.includes("pipeline")) {
    return [
      "Data Collection & Preprocessing",
      "Tokenization & Embedding",
      "Pre-training on Large Corpus",
      "Fine-tuning on Task Data",
      "RLHF Alignment",
      "Evaluation & Deployment"
    ];
  }
  
  if (lowerDesc.includes("architecture") || lowerDesc.includes("transformer")) {
    return [
      "Input Embedding Layer",
      "Multi-Head Self-Attention",
      "Feed-Forward Network",
      "Layer Normalization",
      "Output Projection",
      "Softmax & Generation"
    ];
  }
  
  if (lowerDesc.includes("inference") || lowerDesc.includes("process")) {
    return [
      "User Input",
      "Tokenization",
      "Model Processing",
      "Token Generation",
      "Response Assembly",
      "Output Delivery"
    ];
  }
  
  return [
    "Step 1: Input",
    "Step 2: Processing",
    "Step 3: Analysis",
    "Step 4: Output"
  ];
}

export function ChartRenderer({ description }: { description: string }) {
  const data = generateChartData(description);
  const lowerDesc = description.toLowerCase();
  
  // Determine chart type based on description
  const isPie = lowerDesc.includes("share") || lowerDesc.includes("distribution") || lowerDesc.includes("breakdown");
  const isLine = lowerDesc.includes("trend") || lowerDesc.includes("over time") || lowerDesc.includes("growth");
  const isComparison = lowerDesc.includes("comparison") || lowerDesc.includes("versus") || lowerDesc.includes("vs");
  
  return (
    <Card className="my-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          {description}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            {isPie ? (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            ) : isLine ? (
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            ) : isComparison ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Bar dataKey="modelA" fill="hsl(var(--primary))" name="Model A" />
                <Bar dataKey="modelB" fill="hsl(var(--accent))" name="Model B" />
              </BarChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function DiagramRenderer({ description }: { description: string }) {
  const steps = generateDiagramSteps(description);
  
  return (
    <Card className="my-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary" />
          {description}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-center gap-2 py-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm mb-2">
                  {index + 1}
                </div>
                <div className="text-center px-2 max-w-[120px]">
                  <span className="text-xs text-body-text">{step}</span>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="w-8 h-0.5 bg-primary/30 mx-1 mt-[-24px]" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ImagePlaceholder({ description }: { description: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Generate a relevant Unsplash image based on keywords
    const keywords = description.toLowerCase();
    let query = "artificial+intelligence";
    
    if (keywords.includes("robot")) query = "robot+technology";
    else if (keywords.includes("chip") || keywords.includes("hardware")) query = "computer+chip";
    else if (keywords.includes("data")) query = "data+visualization";
    else if (keywords.includes("brain") || keywords.includes("neural")) query = "brain+neural";
    else if (keywords.includes("healthcare") || keywords.includes("medical")) query = "healthcare+technology";
    else if (keywords.includes("car") || keywords.includes("autonomous")) query = "autonomous+car";
    else if (keywords.includes("office") || keywords.includes("workplace")) query = "technology+workplace";
    
    // Use a random seed based on description for consistency
    const seed = description.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const url = `https://images.unsplash.com/photo-${1485827404703 + (seed % 1000000)}-89b55fcc595e?w=800&h=400&fit=crop`;
    
    // Fallback to a known AI-related image
    const fallbackUrl = `https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop`;
    
    setImageUrl(fallbackUrl);
    setIsLoading(false);
  }, [description]);
  
  if (isLoading) {
    return <Skeleton className="my-6 h-64 w-full" />;
  }
  
  return (
    <Card className="my-6 overflow-hidden">
      <div className="relative">
        <img 
          src={imageUrl || ""} 
          alt={description}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white text-sm flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function VisualContentRenderer({ type, description }: VisualContentProps) {
  switch (type) {
    case "chart":
    case "graph":
      return <ChartRenderer description={description} />;
    case "diagram":
      return <DiagramRenderer description={description} />;
    case "image":
      return <ImagePlaceholder description={description} />;
    default:
      return null;
  }
}

// Parse content and extract visual placeholders
export function parseVisualPlaceholders(content: string): Array<{ type: "text"; content: string } | { type: "visual"; visualType: "chart" | "graph" | "diagram" | "image"; description: string }> {
  const parts: Array<{ type: "text"; content: string } | { type: "visual"; visualType: "chart" | "graph" | "diagram" | "image"; description: string }> = [];
  
  // Match [CHART: description], [GRAPH: description], [DIAGRAM: description], [IMAGE: description]
  const regex = /\[(CHART|GRAPH|DIAGRAM|IMAGE):\s*([^\]]+)\]/gi;
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    // Add text before the placeholder
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: content.slice(lastIndex, match.index) });
    }
    
    // Add the visual placeholder
    const visualType = match[1].toLowerCase() as "chart" | "graph" | "diagram" | "image";
    parts.push({
      type: "visual",
      visualType,
      description: match[2].trim()
    });
    
    lastIndex = regex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({ type: "text", content: content.slice(lastIndex) });
  }
  
  return parts;
}