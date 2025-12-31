import { Sparkles, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface BriefItem {
  text: string;
  category: string;
}

interface DailyBriefProps {
  items: BriefItem[];
  date: string;
}

const categoryColors: Record<string, string> = {
  research: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  policy: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  companies: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  models: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  breaking: "bg-red-500/10 text-red-600 dark:text-red-400",
  default: "bg-primary/10 text-primary",
};

export function DailyBrief({ items, date }: DailyBriefProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-secondary/80 via-secondary/50 to-background border border-divider rounded-lg">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      
      {/* Header */}
      <div className="relative p-5 pb-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold text-headline">
                AI in 5 Minutes
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="h-3 w-3 text-caption" />
                <p className="text-caption text-xs">{date}</p>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-caption bg-secondary px-2 py-1 rounded">
            Daily Brief
          </span>
        </div>
      </div>
      
      {/* Divider */}
      <div className="relative px-5">
        <div className="h-px bg-gradient-to-r from-transparent via-divider to-transparent my-4" />
      </div>

      {/* Items */}
      <div className="relative px-5 pb-5">
        <ul className="space-y-3">
          {items.map((item, index) => {
            const colorClass = categoryColors[item.category.toLowerCase()] || categoryColors.default;
            
            return (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="group flex gap-3 p-3 rounded-lg hover:bg-secondary/80 transition-all duration-200 cursor-pointer"
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colorClass}`}>
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-body-text leading-relaxed group-hover:text-headline transition-colors">
                    {item.text}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-caption opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex-shrink-0" />
              </motion.li>
            );
          })}
        </ul>
      </div>

      {/* Footer */}
      <div className="relative border-t border-divider bg-secondary/30">
        <div className="px-5 py-3 flex items-center justify-between">
          <p className="text-xs text-caption flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            AI-assisted summary • Human-verified
          </p>
        </div>
      </div>
    </div>
  );
}
