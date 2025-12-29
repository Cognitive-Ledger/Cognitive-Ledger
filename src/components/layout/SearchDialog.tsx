import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Cpu, ArrowRight, Loader2, Clock, TrendingUp, Sparkles } from "lucide-react";
import { useArticles } from "@/hooks/useArticles";
import { useModels } from "@/hooks/useModels";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Fuzzy search scoring function
function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  
  // Exact match gets highest score
  if (t.includes(q)) return 100 + (q.length / t.length) * 50;
  
  // Word boundary matches
  const words = t.split(/\s+/);
  let wordScore = 0;
  for (const word of words) {
    if (word.startsWith(q)) wordScore += 80;
    else if (word.includes(q)) wordScore += 40;
  }
  if (wordScore > 0) return wordScore;
  
  // Character sequence matching
  let score = 0;
  let queryIdx = 0;
  for (let i = 0; i < t.length && queryIdx < q.length; i++) {
    if (t[i] === q[queryIdx]) {
      score += 10;
      queryIdx++;
    }
  }
  return queryIdx === q.length ? score : 0;
}

const RECENT_SEARCHES_KEY = "cognitive-ledger-recent-searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  const recent = getRecentSearches().filter(s => s !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const { data: articles, isLoading: articlesLoading } = useArticles();
  const { data: models, isLoading: modelsLoading } = useModels();

  // Load recent searches on open
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
      setQuery("");
      setDebouncedQuery("");
      setSelectedIndex(0);
    }
  }, [open]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setSelectedIndex(0);
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  // Filter and score results with fuzzy matching
  const filteredArticles = debouncedQuery.length >= 2 
    ? articles?.map(article => ({
        ...article,
        score: Math.max(
          fuzzyScore(debouncedQuery, article.title) * 1.5,
          fuzzyScore(debouncedQuery, article.excerpt),
          fuzzyScore(debouncedQuery, article.category) * 0.8,
          fuzzyScore(debouncedQuery, article.author) * 0.5
        )
      }))
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6) 
    : [];

  const filteredModels = debouncedQuery.length >= 2
    ? models?.map(model => ({
        ...model,
        score: Math.max(
          fuzzyScore(debouncedQuery, model.name) * 1.5,
          fuzzyScore(debouncedQuery, model.provider),
          fuzzyScore(debouncedQuery, model.category) * 0.8,
          fuzzyScore(debouncedQuery, model.description || "") * 0.3
        )
      }))
      .filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
    : [];

  const allResults = [
    ...(filteredArticles || []).map(a => ({ type: 'article' as const, item: a })),
    ...(filteredModels || []).map(m => ({ type: 'model' as const, item: m }))
  ];

  const handleSelectArticle = useCallback((slug: string, title: string) => {
    addRecentSearch(title);
    navigate(`/article/${slug}`);
    onOpenChange(false);
    setQuery("");
  }, [navigate, onOpenChange]);

  const handleSelectModel = useCallback((name: string) => {
    addRecentSearch(name);
    navigate("/ai-index");
    onOpenChange(false);
    setQuery("");
  }, [navigate, onOpenChange]);

  const handleRecentSearch = (search: string) => {
    setQuery(search);
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && allResults[selectedIndex]) {
      e.preventDefault();
      const result = allResults[selectedIndex];
      if (result.type === 'article') {
        handleSelectArticle(result.item.slug, result.item.title);
      } else {
        handleSelectModel(result.item.name);
      }
    }
  }, [allResults, selectedIndex, handleSelectArticle, handleSelectModel]);

  // Scroll selected item into view
  useEffect(() => {
    const container = resultsRef.current;
    if (container) {
      const selected = container.querySelector('[data-selected="true"]');
      if (selected) {
        selected.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const isLoading = articlesLoading || modelsLoading;
  const hasResults = allResults.length > 0;
  const showNoResults = debouncedQuery.length >= 2 && !hasResults && !isLoading;

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query || query.length < 2) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-primary/20 text-primary rounded px-0.5">{part}</mark> : part
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-0 gap-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search articles, AI models, topics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-11 pr-4 h-12 text-lg border-0 focus-visible:ring-0"
              autoFocus
            />
            {query && (
              <button 
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </DialogHeader>
        
        <div ref={resultsRef} className="max-h-[450px] overflow-y-auto">
          {/* Recent searches when no query */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-2 flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Recent Searches
              </p>
              <div className="flex flex-wrap gap-2 px-2">
                {recentSearches.map((search, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRecentSearch(search)}
                    className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty state with suggestions */}
          {query.length < 2 && recentSearches.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium mb-2">Search the Cognitive Ledger</p>
              <p className="text-xs opacity-70">Find articles, AI models, research, and more</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {["GPT-5", "Gemini", "AI Safety", "Research"].map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1 text-xs bg-muted/50 hover:bg-muted rounded-full transition-colors flex items-center gap-1"
                  >
                    <TrendingUp className="h-3 w-3" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && debouncedQuery.length >= 2 && (
            <div className="p-8 text-center">
              <Loader2 className="h-6 w-6 mx-auto animate-spin text-primary" />
              <p className="text-sm text-muted-foreground mt-2">Searching...</p>
            </div>
          )}

          {showNoResults && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No results found for "{debouncedQuery}"</p>
              <p className="text-xs mt-1 opacity-70">Try a different search term</p>
            </div>
          )}

          {hasResults && (
            <div className="p-2">
              {/* Articles results */}
              {filteredArticles && filteredArticles.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2 flex items-center gap-1.5">
                    <FileText className="h-3 w-3" />
                    Articles ({filteredArticles.length})
                  </p>
                  {filteredArticles.map((article, idx) => {
                    const globalIdx = idx;
                    const isSelected = selectedIndex === globalIdx;
                    return (
                      <button
                        key={article.id}
                        data-selected={isSelected}
                        onClick={() => handleSelectArticle(article.slug, article.title)}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left group ${
                          isSelected ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-muted'
                        }`}
                      >
                        <FileText className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm line-clamp-1 ${isSelected ? 'text-primary' : 'group-hover:text-primary'} transition-colors`}>
                            {highlightMatch(article.title, debouncedQuery)}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {highlightMatch(article.excerpt, debouncedQuery)}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {article.category}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">{article.reading_time} min read</span>
                          </div>
                        </div>
                        <ArrowRight className={`h-4 w-4 mt-1 ${isSelected ? 'text-primary opacity-100' : 'text-muted-foreground opacity-0 group-hover:opacity-100'} transition-opacity`} />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Models results */}
              {filteredModels && filteredModels.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2 flex items-center gap-1.5">
                    <Cpu className="h-3 w-3" />
                    AI Models ({filteredModels.length})
                  </p>
                  {filteredModels.map((model, idx) => {
                    const globalIdx = (filteredArticles?.length || 0) + idx;
                    const isSelected = selectedIndex === globalIdx;
                    return (
                      <button
                        key={model.id}
                        data-selected={isSelected}
                        onClick={() => handleSelectModel(model.name)}
                        className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left group ${
                          isSelected ? 'bg-primary/10 ring-1 ring-primary/20' : 'hover:bg-muted'
                        }`}
                      >
                        <Cpu className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm line-clamp-1 ${isSelected ? 'text-primary' : 'group-hover:text-primary'} transition-colors`}>
                            {highlightMatch(model.name, debouncedQuery)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {highlightMatch(model.provider, debouncedQuery)} • {model.category}
                          </p>
                          {model.parameters && (
                            <span className="text-[10px] text-muted-foreground/70">{model.parameters}</span>
                          )}
                        </div>
                        <ArrowRight className={`h-4 w-4 mt-1 ${isSelected ? 'text-primary opacity-100' : 'text-muted-foreground opacity-0 group-hover:opacity-100'} transition-opacity`} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd> select</span>
          </div>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">esc</kbd> close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}