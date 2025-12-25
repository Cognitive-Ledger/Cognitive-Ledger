import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, AlertTriangle, TrendingUp, Cpu } from "lucide-react";
import { parseContentWithEmbeds, SingleEmbed, getUnplacedEmbeds } from "@/components/articles/EmbedRenderer";
import type { Embed } from "@/components/articles/EmbedRenderer";
import type { Database } from "@/integrations/supabase/types";

type ImpactLevel = Database["public"]["Enums"]["impact_level"];

interface ArticlePreviewProps {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  image_url?: string;
  reading_time: number;
  is_breaking: boolean;
  is_featured: boolean;
  business_impact: ImpactLevel;
  technical_impact: ImpactLevel;
  ethical_risk: ImpactLevel;
  embeds: Embed[];
}

function ImpactBadge({ level, label }: { level: ImpactLevel; label: string }) {
  const colors = {
    low: "bg-green-500/20 text-green-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    high: "bg-red-500/20 text-red-400",
  };

  return (
    <Badge className={colors[level]} variant="secondary">
      {label}: {level}
    </Badge>
  );
}

export function ArticlePreview({
  title,
  excerpt,
  content,
  author,
  category,
  image_url,
  reading_time,
  is_breaking,
  is_featured,
  business_impact,
  technical_impact,
  ethical_risk,
  embeds,
}: ArticlePreviewProps) {
  const contentParts = parseContentWithEmbeds(content, embeds);
  const unplacedEmbeds = getUnplacedEmbeds(content, embeds);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="outline" className="capitalize">
            {category}
          </Badge>
          {is_breaking && <Badge className="bg-red-500">Breaking</Badge>}
          {is_featured && <Badge className="bg-primary">Featured</Badge>}
        </div>
        <CardTitle className="text-2xl">{title || "Untitled Article"}</CardTitle>
        <p className="text-muted-foreground mt-2">{excerpt || "No excerpt provided"}</p>
        
        <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
          <span>By {author || "Unknown Author"}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {reading_time} min read
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Impact Assessment */}
        <div className="flex gap-2 flex-wrap">
          <ImpactBadge level={business_impact} label="Business" />
          <ImpactBadge level={technical_impact} label="Technical" />
          <ImpactBadge level={ethical_risk} label="Ethical Risk" />
        </div>

        {/* Featured Image */}
        {image_url && (
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={image_url}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Article Content with Inline Embeds */}
        <div className="prose prose-invert max-w-none">
          {contentParts.map((part, index) => (
            part.type === "text" ? (
              <div 
                key={index} 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: part.content }}
              />
            ) : (
              <SingleEmbed key={index} embed={part.embed} />
            )
          ))}
          
          {/* Unplaced Embeds at the End */}
          {unplacedEmbeds.length > 0 && (
            <div className="mt-8 border-t border-border pt-6">
              <h3 className="text-lg font-semibold mb-4">Related Media</h3>
              {unplacedEmbeds.map((embed) => (
                <SingleEmbed key={embed.id} embed={embed} />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
