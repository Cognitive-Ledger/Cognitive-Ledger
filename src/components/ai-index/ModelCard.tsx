import { ExternalLink, Calendar, DollarSign, Zap, Layers, Box } from "lucide-react";

interface ModelCardProps {
  slug: string;
  name: string;
  provider: string;
  version: string;
  releaseDate: string;
  description: string;
  parameters?: string;
  contextWindow?: string;
  pricing?: string;
  category: string;
  benchmarks?: Record<string, number>;
}

export function ModelCard({
  name,
  provider,
  version,
  releaseDate,
  description,
  parameters,
  contextWindow,
  pricing,
  category,
  benchmarks,
}: ModelCardProps) {
  const benchmarkEntries = benchmarks ? Object.entries(benchmarks) : [];

  return (
    <article className="border border-divider bg-card p-6 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-primary font-medium">
            {category}
          </span>
          <h3 className="font-serif text-xl font-medium text-headline mt-1">{name}</h3>
          <p className="text-caption text-sm">{provider}</p>
        </div>
        <ExternalLink className="h-4 w-4 text-caption flex-shrink-0" />
      </div>

      <p className="text-body-text text-sm leading-relaxed mb-4">{description}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-caption" />
          <span className="text-caption">Version:</span>
          <span className="font-medium">{version}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-caption" />
          <span className="font-medium">{releaseDate}</span>
        </div>
        {parameters && (
          <div className="flex items-center gap-2 text-sm">
            <Box className="h-4 w-4 text-caption" />
            <span className="text-caption">Params:</span>
            <span className="font-medium">{parameters}</span>
          </div>
        )}
        {contextWindow && (
          <div className="flex items-center gap-2 text-sm">
            <Layers className="h-4 w-4 text-caption" />
            <span className="text-caption">Context:</span>
            <span className="font-medium">{contextWindow}</span>
          </div>
        )}
        {pricing && (
          <div className="flex items-center gap-2 text-sm col-span-2">
            <DollarSign className="h-4 w-4 text-caption" />
            <span className="text-caption">Pricing:</span>
            <span className="font-medium">{pricing}</span>
          </div>
        )}
      </div>

      {benchmarkEntries.length > 0 && (
        <div className="border-t border-divider pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-caption mb-3">
            Key Benchmarks
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {benchmarkEntries.slice(0, 4).map(([name, score]) => (
              <div
                key={name}
                className="bg-secondary/50 px-3 py-2 text-sm"
              >
                <span className="text-caption text-xs block">{name}</span>
                <span className="font-medium">{score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
