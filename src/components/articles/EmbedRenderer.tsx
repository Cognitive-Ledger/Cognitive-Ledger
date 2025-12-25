import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface Embed {
  id: string;
  type: "google-sheets" | "chart" | "youtube" | "iframe" | "twitter";
  url: string;
  title?: string;
  height?: number;
}

interface EmbedRendererProps {
  embeds: Embed[];
}

interface SingleEmbedProps {
  embed: Embed;
}

function getEmbedUrl(embed: Embed): string {
  const { type, url } = embed;
  
  switch (type) {
    case "google-sheets":
      if (url.includes("/edit")) {
        return url.replace("/edit", "/pubhtml?widget=true&headers=false");
      }
      if (url.includes("/pub")) {
        return url;
      }
      return `${url}?widget=true&headers=false`;
    
    case "youtube":
      if (url.includes("youtube.com/watch?v=")) {
        const videoId = url.split("v=")[1]?.split("&")[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    
    case "twitter":
      return url;
    
    default:
      return url;
  }
}

export function SingleEmbed({ embed }: SingleEmbedProps) {
  const embedUrl = getEmbedUrl(embed);
  const height = embed.height || 400;

  if (embed.type === "twitter") {
    return (
      <Card className="my-6">
        {embed.title && (
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{embed.title}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <blockquote className="twitter-tweet">
            <a href={embed.url}>View Tweet</a>
          </blockquote>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-6 overflow-hidden">
      {embed.title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{embed.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        <iframe
          src={embedUrl}
          title={embed.title || `Embedded ${embed.type}`}
          width="100%"
          height={height}
          className="border-0"
          loading="lazy"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </CardContent>
    </Card>
  );
}

export function EmbedRenderer({ embeds }: EmbedRendererProps) {
  if (!embeds || embeds.length === 0) return null;

  return (
    <div className="embeds-container">
      {embeds.map((embed) => (
        <SingleEmbed key={embed.id} embed={embed} />
      ))}
    </div>
  );
}

// Helper to parse content and render with inline embeds
export function parseContentWithEmbeds(content: string, embeds: Embed[]): Array<{ type: "text"; content: string } | { type: "embed"; embed: Embed }> {
  const embedMap = new Map(embeds.map(e => [e.id, e]));
  const parts: Array<{ type: "text"; content: string } | { type: "embed"; embed: Embed }> = [];
  
  // Match {{embed:embed-id}}
  const regex = /\{\{embed:([^}]+)\}\}/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // Add text before the embed marker
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: content.slice(lastIndex, match.index) });
    }
    
    // Add the embed if it exists
    const embedId = match[1];
    const embed = embedMap.get(embedId);
    if (embed) {
      parts.push({ type: "embed", embed });
      embedMap.delete(embedId); // Mark as used
    }
    
    lastIndex = regex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({ type: "text", content: content.slice(lastIndex) });
  }
  
  return parts;
}

// Get embeds that weren't placed in content (to show at the end)
export function getUnplacedEmbeds(content: string, embeds: Embed[]): Embed[] {
  const placedIds = new Set<string>();
  const regex = /\{\{embed:([^}]+)\}\}/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    placedIds.add(match[1]);
  }
  
  return embeds.filter(e => !placedIds.has(e.id));
}