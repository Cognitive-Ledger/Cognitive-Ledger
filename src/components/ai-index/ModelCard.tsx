import { ExternalLink, Calendar, DollarSign, Zap } from "lucide-react";
import { Link } from "react-router-dom";

interface Benchmark {
  name: string;
  score: string;
}

interface ModelCardProps {
  slug: string;
  name: string;
  provider: string;
  currentVersion: string;
  releaseDate: string;
  description: string;
  pricing?: string;
  benchmarks: Benchmark[];
  logoUrl?: string;
}

export function ModelCard({
  slug,
  name,
  provider,
  currentVersion,
  releaseDate,
  description,
  pricing,
  benchmarks,
  logoUrl,
}: ModelCardProps) {
  return (
    <article className="border border-divider bg-card p-6 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {logoUrl && (
            <img
              src={logoUrl}
              alt={`${provider} logo`}
              className="w-10 h-10 object-contain"
            />
          )}
          <div>
            <h3 className="font-serif text-xl font-medium text-headline">{name}</h3>
            <p className="text-caption text-sm">{provider}</p>
          </div>
        </div>
        <Link
          to={`/ai-index/${slug}`}
          className="text-primary hover:underline text-sm flex items-center gap-1"
        >
          Details
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      <p className="text-body-text text-sm leading-relaxed mb-4">{description}</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Zap className="h-4 w-4 text-caption" />
          <span className="text-caption">Version:</span>
          <span className="font-medium">{currentVersion}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-caption" />
          <span className="text-caption">Released:</span>
          <span className="font-medium">{releaseDate}</span>
        </div>
        {pricing && (
          <div className="flex items-center gap-2 text-sm col-span-2">
            <DollarSign className="h-4 w-4 text-caption" />
            <span className="text-caption">Pricing:</span>
            <span className="font-medium">{pricing}</span>
          </div>
        )}
      </div>

      {benchmarks.length > 0 && (
        <div className="border-t border-divider pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-caption mb-3">
            Key Benchmarks
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {benchmarks.map((benchmark) => (
              <div
                key={benchmark.name}
                className="bg-secondary/50 px-3 py-2 text-sm"
              >
                <span className="text-caption text-xs block">{benchmark.name}</span>
                <span className="font-medium">{benchmark.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
