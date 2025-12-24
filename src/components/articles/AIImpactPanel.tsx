import { TrendingUp, Cpu, Scale } from "lucide-react";

interface ImpactLevel {
  level: "low" | "medium" | "high";
  description: string;
}

interface AIImpactPanelProps {
  businessImpact: ImpactLevel;
  technicalImpact: ImpactLevel;
  ethicalRisk: ImpactLevel;
}

function getImpactStyles(level: "low" | "medium" | "high") {
  switch (level) {
    case "low":
      return "impact-low";
    case "medium":
      return "impact-medium";
    case "high":
      return "impact-high";
  }
}

function getImpactLabel(level: "low" | "medium" | "high") {
  return level.charAt(0).toUpperCase() + level.slice(1);
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
              businessImpact.level
            )}`}
          >
            {getImpactLabel(businessImpact.level)}
          </div>
          <p className="text-xs text-caption leading-relaxed">
            {businessImpact.description}
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
              technicalImpact.level
            )}`}
          >
            {getImpactLabel(technicalImpact.level)}
          </div>
          <p className="text-xs text-caption leading-relaxed">
            {technicalImpact.description}
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
              ethicalRisk.level
            )}`}
          >
            {getImpactLabel(ethicalRisk.level)}
          </div>
          <p className="text-xs text-caption leading-relaxed">
            {ethicalRisk.description}
          </p>
        </div>
      </div>
    </div>
  );
}
