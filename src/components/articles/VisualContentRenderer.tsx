import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, Image as ImageIcon, BarChart3, GitBranch, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VisualContentProps {
  type: "chart" | "graph" | "diagram" | "image";
  description: string;
  articleContext?: string;
}

// Color palette for charts
const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "#8884d8", "#82ca9d", "#ffc658"];

interface ChartData {
  chartType: string;
  title: string;
  data: Array<Record<string, unknown>>;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

interface DiagramData {
  title: string;
  steps: string[];
}

interface ImageData {
  url: string;
  alt: string;
}

export function ChartRenderer({ description, articleContext }: { description: string; articleContext?: string }) {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-visual", {
          body: { type: "chart", description, articleContext },
        });

        if (error) throw error;
        if (data?.data) {
          setChartData(data.data);
        }
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setError("Failed to generate chart");
        // Fallback to default data
        setChartData({
          chartType: "bar",
          title: description,
          data: [
            { name: "Category A", value: 40 },
            { name: "Category B", value: 30 },
            { name: "Category C", value: 20 },
            { name: "Category D", value: 10 },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [description, articleContext]);

  if (isLoading) {
    return (
      <Card className="my-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Generating chart...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!chartData) return null;

  const { chartType, title, data } = chartData;
  const isPie = chartType === "pie";
  const isLine = chartType === "line" || chartType === "area";
  const hasMultipleKeys = data[0] && Object.keys(data[0]).filter(k => k !== "name").length > 1;
  
  return (
    <Card className="my-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          {title || description}
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
                  {data.map((_, index) => (
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
            ) : hasMultipleKeys ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                {Object.keys(data[0]).filter(k => k !== "name").map((key, i) => (
                  <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
                ))}
              </BarChart>
            ) : (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))">
                  {data.map((_, index) => (
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

export function DiagramRenderer({ description, articleContext }: { description: string; articleContext?: string }) {
  const [diagramData, setDiagramData] = useState<DiagramData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDiagramData = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-visual", {
          body: { type: "diagram", description, articleContext },
        });

        if (error) throw error;
        if (data?.data) {
          setDiagramData(data.data);
        }
      } catch (err) {
        console.error("Error fetching diagram data:", err);
        // Fallback
        setDiagramData({
          title: description,
          steps: ["Step 1: Input", "Step 2: Processing", "Step 3: Analysis", "Step 4: Output"],
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiagramData();
  }, [description, articleContext]);

  if (isLoading) {
    return (
      <Card className="my-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Generating diagram...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!diagramData) return null;

  const { title, steps } = diagramData;
  
  return (
    <Card className="my-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-primary" />
          {title || description}
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

export function ImagePlaceholder({ description, articleContext }: { description: string; articleContext?: string }) {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-visual", {
          body: { type: "image", description, articleContext },
        });

        if (error) throw error;
        if (data?.data) {
          setImageData(data.data);
        }
      } catch (err) {
        console.error("Error fetching image:", err);
        // Fallback to Unsplash
        setImageData({
          url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
          alt: description,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [description, articleContext]);

  if (isLoading) {
    return <Skeleton className="my-6 h-64 w-full rounded-lg" />;
  }

  if (!imageData) return null;
  
  return (
    <Card className="my-6 overflow-hidden">
      <div className="relative">
        <img 
          src={imageData.url} 
          alt={imageData.alt || description}
          className="w-full h-64 object-cover"
          onError={(e) => {
            // Fallback on error
            e.currentTarget.src = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop";
          }}
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

export function VisualContentRenderer({ type, description, articleContext }: VisualContentProps) {
  switch (type) {
    case "chart":
    case "graph":
      return <ChartRenderer description={description} articleContext={articleContext} />;
    case "diagram":
      return <DiagramRenderer description={description} articleContext={articleContext} />;
    case "image":
      return <ImagePlaceholder description={description} articleContext={articleContext} />;
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
