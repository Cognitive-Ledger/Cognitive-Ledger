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
import AdminDashboard from "./pages/admin/AdminDashboard";
import ArticlesList from "./pages/admin/ArticlesList";
import ArticleEditor from "./pages/admin/ArticleEditor";
import ModelsList from "./pages/admin/ModelsList";
import ModelEditor from "./pages/admin/ModelEditor";
import BreakingNewsList from "./pages/admin/BreakingNewsList";
import DailyBriefList from "./pages/admin/DailyBriefList";

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
              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/articles" element={<ArticlesList />} />
              <Route path="/admin/articles/new" element={<ArticleEditor />} />
              <Route path="/admin/articles/:id" element={<ArticleEditor />} />
              <Route path="/admin/models" element={<ModelsList />} />
              <Route path="/admin/models/new" element={<ModelEditor />} />
              <Route path="/admin/models/:id" element={<ModelEditor />} />
              <Route path="/admin/breaking" element={<BreakingNewsList />} />
              <Route path="/admin/daily-brief" element={<DailyBriefList />} />
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
