import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, FileText, Cpu, ArrowRight, Loader2 } from "lucide-react";
import { useArticles } from "@/hooks/useArticles";
import { useModels } from "@/hooks/useModels";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const navigate = useNavigate();
  
  const { data: articles, isLoading: articlesLoading } = useArticles();
  const { data: models, isLoading: modelsLoading } = useModels();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Filter results
  const filteredArticles = debouncedQuery.length >= 2 
    ? articles?.filter(article => 
        article.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 5) 
    : [];

  const filteredModels = debouncedQuery.length >= 2
    ? models?.filter(model =>
        model.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        model.category.toLowerCase().includes(debouncedQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  const handleSelectArticle = (slug: string) => {
    navigate(`/article/${slug}`);
    onOpenChange(false);
    setQuery("");
  };

  const handleSelectModel = () => {
    navigate("/ai-index");
    onOpenChange(false);
    setQuery("");
  };

  const isLoading = articlesLoading || modelsLoading;
  const hasResults = (filteredArticles?.length ?? 0) > 0 || (filteredModels?.length ?? 0) > 0;
  const showNoResults = debouncedQuery.length >= 2 && !hasResults && !isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles, AI models, topics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-12 text-lg border-0 focus-visible:ring-0"
              autoFocus
            />
          </div>
        </DialogHeader>
        
        <div className="max-h-[400px] overflow-y-auto">
          {query.length < 2 && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Type at least 2 characters to search</p>
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
              <p className="text-sm">No results found for "{debouncedQuery}"</p>
            </div>
          )}

          {hasResults && (
            <div className="p-2">
              {/* Articles results */}
              {filteredArticles && filteredArticles.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2">
                    Articles
                  </p>
                  {filteredArticles.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => handleSelectArticle(article.slug)}
                      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left group"
                    >
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {article.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {article.excerpt}
                        </p>
                        <p className="text-xs text-primary mt-1 capitalize">
                          {article.category}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                    </button>
                  ))}
                </div>
              )}

              {/* Models results */}
              {filteredModels && filteredModels.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-3 py-2">
                    AI Models
                  </p>
                  {filteredModels.map((model) => (
                    <button
                      key={model.id}
                      onClick={handleSelectModel}
                      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left group"
                    >
                      <Cpu className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {model.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {model.provider} • {model.category}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
          <span>Press ESC to close</span>
          <span>↵ to select</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
