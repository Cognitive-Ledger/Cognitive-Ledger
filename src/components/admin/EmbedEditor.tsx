import { useState } from "react";
import { Plus, Trash2, GripVertical, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Embed } from "@/components/articles/EmbedRenderer";

interface EmbedEditorProps {
  embeds: Embed[];
  onChange: (embeds: Embed[]) => void;
}

const EMBED_TYPES = [
  { value: "google-sheets", label: "Google Sheets" },
  { value: "chart", label: "Chart (iframe)" },
  { value: "youtube", label: "YouTube Video" },
  { value: "iframe", label: "Generic iframe" },
  { value: "twitter", label: "Twitter/X Post" },
] as const;

function generateId() {
  return `embed-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function EmbedEditor({ embeds, onChange }: EmbedEditorProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const addEmbed = () => {
    const newEmbed: Embed = {
      id: generateId(),
      type: "google-sheets",
      url: "",
      title: "",
      height: 400,
    };
    onChange([...embeds, newEmbed]);
    setExpanded(newEmbed.id);
  };

  const updateEmbed = (id: string, updates: Partial<Embed>) => {
    onChange(
      embeds.map((embed) =>
        embed.id === id ? { ...embed, ...updates } : embed
      )
    );
  };

  const removeEmbed = (id: string) => {
    onChange(embeds.filter((embed) => embed.id !== id));
  };

  const moveEmbed = (index: number, direction: "up" | "down") => {
    const newEmbeds = [...embeds];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newEmbeds.length) return;
    [newEmbeds[index], newEmbeds[newIndex]] = [newEmbeds[newIndex], newEmbeds[index]];
    onChange(newEmbeds);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Embedded Content</CardTitle>
        <Button type="button" variant="outline" size="sm" onClick={addEmbed}>
          <Plus className="h-4 w-4 mr-1" />
          Add Embed
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {embeds.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No embeds added. Add charts, Google Sheets, videos, and more.
          </p>
        ) : (
          embeds.map((embed, index) => (
            <div
              key={embed.id}
              className="border border-border rounded-lg p-3 space-y-3"
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                <div className="flex-1 flex items-center gap-2">
                  <Select
                    value={embed.type}
                    onValueChange={(value) =>
                      updateEmbed(embed.id, { type: value as Embed["type"] })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMBED_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground truncate flex-1">
                    {embed.title || embed.url || "Untitled embed"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveEmbed(index, "up")}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => moveEmbed(index, "down")}
                    disabled={index === embeds.length - 1}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      setExpanded(expanded === embed.id ? null : embed.id)
                    }
                  >
                    {expanded === embed.id ? "−" : "+"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeEmbed(embed.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {expanded === embed.id && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t">
                  <div className="md:col-span-2">
                    <Label htmlFor={`url-${embed.id}`}>URL *</Label>
                    <div className="flex gap-2">
                      <Input
                        id={`url-${embed.id}`}
                        value={embed.url}
                        onChange={(e) =>
                          updateEmbed(embed.id, { url: e.target.value })
                        }
                        placeholder={
                          embed.type === "google-sheets"
                            ? "https://docs.google.com/spreadsheets/d/..."
                            : embed.type === "youtube"
                            ? "https://www.youtube.com/watch?v=..."
                            : "https://..."
                        }
                      />
                      {embed.url && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          asChild
                        >
                          <a
                            href={embed.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`title-${embed.id}`}>Title (optional)</Label>
                    <Input
                      id={`title-${embed.id}`}
                      value={embed.title || ""}
                      onChange={(e) =>
                        updateEmbed(embed.id, { title: e.target.value })
                      }
                      placeholder="e.g., AI Benchmark Comparison"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`height-${embed.id}`}>Height (px)</Label>
                    <Input
                      id={`height-${embed.id}`}
                      type="number"
                      value={embed.height || 400}
                      onChange={(e) =>
                        updateEmbed(embed.id, {
                          height: parseInt(e.target.value) || 400,
                        })
                      }
                      min={100}
                      max={1000}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}