import { Sparkles } from "lucide-react";

interface BriefItem {
  text: string;
  category: string;
}

interface DailyBriefProps {
  items: BriefItem[];
  date: string;
}

export function DailyBrief({ items, date }: DailyBriefProps) {
  return (
    <div className="bg-secondary/50 p-6 border border-divider">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-serif text-lg font-medium">AI in 5 Minutes</h3>
      </div>
      <p className="text-caption text-xs mb-4">{date} — Daily Brief</p>
      
      <ul className="space-y-4">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3">
            <span className="text-primary font-semibold text-sm flex-shrink-0">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <span className="text-xs text-caption uppercase tracking-wider">
                {item.category}
              </span>
              <p className="text-sm text-body-text mt-0.5 leading-relaxed">
                {item.text}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 pt-4 border-t border-divider">
        <p className="text-xs text-caption italic">
          AI-assisted summary. Human-verified.
        </p>
      </div>
    </div>
  );
}
