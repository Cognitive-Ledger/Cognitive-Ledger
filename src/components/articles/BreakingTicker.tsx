import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface TickerItem {
  id: string;
  headline: string;
  slug: string;
}

interface BreakingTickerProps {
  items: TickerItem[];
}

export function BreakingTicker({ items }: BreakingTickerProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-primary text-primary-foreground overflow-hidden">
      <div className="container py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="h-4 w-4 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Breaking
            </span>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex gap-12 ticker-scroll whitespace-nowrap">
              {[...items, ...items].map((item, index) => (
                <Link
                  key={`${item.id}-${index}`}
                  to={`/article/${item.slug}`}
                  className="text-sm hover:underline"
                >
                  {item.headline}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
