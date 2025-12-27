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
import Podcasts from "./pages/Podcasts";
import LiveStreams from "./pages/LiveStreams";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ArticlesList from "./pages/admin/ArticlesList";
import ArticleEditor from "./pages/admin/ArticleEditor";
import ModelsList from "./pages/admin/ModelsList";
import ModelEditor from "./pages/admin/ModelEditor";
import BreakingNewsList from "./pages/admin/BreakingNewsList";
import DailyBriefList from "./pages/admin/DailyBriefList";
import VideoArticlesList from "./pages/admin/VideoArticlesList";
import VideoArticleEditor from "./pages/admin/VideoArticleEditor";
import PodcastsList from "./pages/admin/PodcastsList";
import PodcastEditor from "./pages/admin/PodcastEditor";
import LiveStreamsList from "./pages/admin/LiveStreamsList";
import LiveStreamEditor from "./pages/admin/LiveStreamEditor";

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
              <Route path="/podcasts" element={<Podcasts />} />
              <Route path="/live" element={<LiveStreams />} />
              <Route path="/breaking" element={<CategoryPage />} />
              <Route path="/research" element={<CategoryPage />} />
              <Route path="/companies" element={<CategoryPage />} />
              <Route path="/policy" element={<CategoryPage />} />
              <Route path="/models" element={<CategoryPage />} />
              <Route path="/opinion" element={<CategoryPage />} />
              <Route path="/explainers" element={<CategoryPage />} />
              <Route path="/video" element={<CategoryPage />} />
              {/* Admin routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/articles" element={<ArticlesList />} />
              <Route path="/admin/articles/new" element={<ArticleEditor />} />
              <Route path="/admin/articles/:id" element={<ArticleEditor />} />
              <Route path="/admin/videos" element={<VideoArticlesList />} />
              <Route path="/admin/videos/new" element={<VideoArticleEditor />} />
              <Route path="/admin/videos/:id" element={<VideoArticleEditor />} />
              <Route path="/admin/models" element={<ModelsList />} />
              <Route path="/admin/models/new" element={<ModelEditor />} />
              <Route path="/admin/models/:id" element={<ModelEditor />} />
              <Route path="/admin/breaking" element={<BreakingNewsList />} />
              <Route path="/admin/daily-brief" element={<DailyBriefList />} />
              <Route path="/admin/podcasts" element={<PodcastsList />} />
              <Route path="/admin/podcasts/new" element={<PodcastEditor />} />
              <Route path="/admin/podcasts/:id" element={<PodcastEditor />} />
              <Route path="/admin/streams" element={<LiveStreamsList />} />
              <Route path="/admin/streams/new" element={<LiveStreamEditor />} />
              <Route path="/admin/streams/:id" element={<LiveStreamEditor />} />
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
