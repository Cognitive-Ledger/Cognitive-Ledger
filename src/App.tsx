import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import ArticlePage from "./pages/ArticlePage";
import AIIndex from "./pages/AIIndex";
import CategoryPage from "./pages/CategoryPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/article/:slug" element={<ArticlePage />} />
              <Route path="/ai-index" element={<AIIndex />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/breaking" element={<CategoryPage />} />
              <Route path="/research" element={<CategoryPage />} />
              <Route path="/companies" element={<CategoryPage />} />
              <Route path="/policy" element={<CategoryPage />} />
              <Route path="/models" element={<CategoryPage />} />
              <Route path="/opinion" element={<CategoryPage />} />
              <Route path="/explainers" element={<CategoryPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
