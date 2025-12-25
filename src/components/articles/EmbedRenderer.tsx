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

function getEmbedUrl(embed: Embed): string {
  const { type, url } = embed;
  
  switch (type) {
    case "google-sheets":
      // Convert Google Sheets URL to embed format
      if (url.includes("/edit")) {
        return url.replace("/edit", "/pubhtml?widget=true&headers=false");
      }
      if (url.includes("/pub")) {
        return url;
      }
      return `${url}?widget=true&headers=false`;
    
    case "youtube":
      // Convert YouTube URL to embed format
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
      // For Twitter/X embeds, we'd typically use their widget JS
      return url;
    
    default:
      return url;
  }
}

function SingleEmbed({ embed }: { embed: Embed }) {
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