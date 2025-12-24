import { TrendingUp, Cpu, Scale } from "lucide-react";

type Level = "low" | "medium" | "high";

interface AIImpactPanelProps {
  businessImpact: Level;
  technicalImpact: Level;
  ethicalRisk: Level;
}

function getImpactStyles(level: Level) {
  switch (level) {
    case "low":
      return "impact-low";
    case "medium":
      return "impact-medium";
    case "high":
      return "impact-high";
  }
}

function getImpactLabel(level: Level) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function getImpactDescription(type: string, level: Level) {
  const descriptions: Record<string, Record<Level, string>> = {
    business: {
      low: "Minimal immediate market or operational changes expected.",
      medium: "Moderate shifts in industry practices or business models.",
      high: "Significant disruption to markets, jobs, or business operations.",
    },
    technical: {
      low: "Incremental advancement in existing capabilities.",
      medium: "Notable improvement in performance or new capabilities.",
      high: "Breakthrough advancement that redefines the state of the art.",
    },
    ethical: {
      low: "Standard considerations with established best practices.",
      medium: "Requires careful consideration of potential misuse or bias.",
      high: "Significant concerns around safety, privacy, or societal impact.",
    },
  };
  return descriptions[type]?.[level] ?? "";
}

export function AIImpactPanel({
  businessImpact,
  technicalImpact,
  ethicalRisk,
}: AIImpactPanelProps) {
  return (
    <div className="bg-secondary/30 border border-divider p-5">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-caption mb-4">
        AI Impact Assessment
      </h4>

      <div className="space-y-4">
        {/* Business Impact */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-caption" />
            <span className="text-sm font-medium">Business Impact</span>
          </div>
          <div
            className={`inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider border ${getImpactStyles(
              businessImpact
            )}`}
          >
            {getImpactLabel(businessImpact)}
          </div>
          <p className="text-xs text-caption leading-relaxed">
            {getImpactDescription("business", businessImpact)}
          </p>
        </div>

        {/* Technical Impact */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-caption" />
            <span className="text-sm font-medium">Technical Impact</span>
          </div>
          <div
            className={`inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider border ${getImpactStyles(
              technicalImpact
            )}`}
          >
            {getImpactLabel(technicalImpact)}
          </div>
          <p className="text-xs text-caption leading-relaxed">
            {getImpactDescription("technical", technicalImpact)}
          </p>
        </div>

        {/* Ethical Risk */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Scale className="h-4 w-4 text-caption" />
            <span className="text-sm font-medium">Ethical Risk</span>
          </div>
          <div
            className={`inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider border ${getImpactStyles(
              ethicalRisk
            )}`}
          >
            {getImpactLabel(ethicalRisk)}
          </div>
          <p className="text-xs text-caption leading-relaxed">
            {getImpactDescription("ethical", ethicalRisk)}
          </p>
        </div>
      </div>
    </div>
  );
}
