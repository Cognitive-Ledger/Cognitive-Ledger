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
import Subscribe from "./pages/Subscribe";
import Checkout from "./pages/Checkout";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import About from "./pages/About";
import Contact from "./pages/Contact";
import EditorialStandards from "./pages/EditorialStandards";
import Unsubscribe from "./pages/Unsubscribe";
import ConfirmNewsletter from "./pages/ConfirmNewsletter";

// Portal
import PortalAuth from "./pages/portal/PortalAuth";
import AdminPortalDashboard from "./pages/portal/admin/AdminPortalDashboard";
import AdminArticlesList from "./pages/portal/admin/AdminArticlesList";
import EditorPortalDashboard from "./pages/portal/editor/EditorPortalDashboard";
import EditorArticlesList from "./pages/portal/editor/EditorArticlesList";
import ContributorDashboard from "./pages/portal/contributor/ContributorDashboard";
import ContributorSubmissions from "./pages/portal/contributor/ContributorSubmissions";
import ContributorPending from "./pages/portal/contributor/ContributorPending";
import ContributorSubmit from "./pages/portal/contributor/ContributorSubmit";
import PortalSettings from "./pages/portal/shared/PortalSettings";
import {
  AdminVideosList, AdminVideoEditor, AdminModelsList, AdminModelEditor,
  AdminBreakingNews, AdminDailyBrief, AdminPodcastsList, AdminPodcastEditor,
  AdminStreamsList, AdminStreamEditor, AdminNewsletter, AdminNewsletterCompose, AdminTeam,
  EditorVideosList, EditorVideoEditor, EditorModelsList, EditorModelEditor,
  EditorBreakingNews, EditorDailyBrief, EditorPodcastsList, EditorPodcastEditor,
  EditorStreamsList, EditorStreamEditor, EditorNewsletter, EditorNewsletterCompose
} from "./pages/portal/PortalPlaceholders";

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
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/article/:slug" element={<ArticlePage />} />
              <Route path="/ai-index" element={<AIIndex />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/podcasts" element={<Podcasts />} />
              <Route path="/live" element={<LiveStreams />} />
              <Route path="/subscribe" element={<Subscribe />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/standards" element={<EditorialStandards />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              <Route path="/confirm-newsletter" element={<ConfirmNewsletter />} />
              <Route path="/breaking" element={<CategoryPage />} />
              <Route path="/research" element={<CategoryPage />} />
              <Route path="/companies" element={<CategoryPage />} />
              <Route path="/policy" element={<CategoryPage />} />
              <Route path="/models" element={<CategoryPage />} />
              <Route path="/opinion" element={<CategoryPage />} />
              <Route path="/explainers" element={<CategoryPage />} />
              <Route path="/video" element={<CategoryPage />} />

              {/* Staff Portal */}
              <Route path="/portal" element={<PortalAuth />} />
              
              {/* Admin Portal */}
              <Route path="/portal/admin" element={<AdminPortalDashboard />} />
              <Route path="/portal/admin/articles" element={<AdminArticlesList />} />
              <Route path="/portal/admin/articles/*" element={<AdminArticlesList />} />
              <Route path="/portal/admin/videos" element={<AdminVideosList />} />
              <Route path="/portal/admin/videos/*" element={<AdminVideoEditor />} />
              <Route path="/portal/admin/models" element={<AdminModelsList />} />
              <Route path="/portal/admin/models/*" element={<AdminModelEditor />} />
              <Route path="/portal/admin/breaking" element={<AdminBreakingNews />} />
              <Route path="/portal/admin/daily-brief" element={<AdminDailyBrief />} />
              <Route path="/portal/admin/podcasts" element={<AdminPodcastsList />} />
              <Route path="/portal/admin/podcasts/*" element={<AdminPodcastEditor />} />
              <Route path="/portal/admin/streams" element={<AdminStreamsList />} />
              <Route path="/portal/admin/streams/*" element={<AdminStreamEditor />} />
              <Route path="/portal/admin/newsletter" element={<AdminNewsletter />} />
              <Route path="/portal/admin/newsletter/compose" element={<AdminNewsletterCompose />} />
              <Route path="/portal/admin/team" element={<AdminTeam />} />

              {/* Editor Portal */}
              <Route path="/portal/editor" element={<EditorPortalDashboard />} />
              <Route path="/portal/editor/articles" element={<EditorArticlesList />} />
              <Route path="/portal/editor/articles/*" element={<EditorArticlesList />} />
              <Route path="/portal/editor/videos" element={<EditorVideosList />} />
              <Route path="/portal/editor/videos/*" element={<EditorVideoEditor />} />
              <Route path="/portal/editor/models" element={<EditorModelsList />} />
              <Route path="/portal/editor/models/*" element={<EditorModelEditor />} />
              <Route path="/portal/editor/breaking" element={<EditorBreakingNews />} />
              <Route path="/portal/editor/daily-brief" element={<EditorDailyBrief />} />
              <Route path="/portal/editor/podcasts" element={<EditorPodcastsList />} />
              <Route path="/portal/editor/podcasts/*" element={<EditorPodcastEditor />} />
              <Route path="/portal/editor/streams" element={<EditorStreamsList />} />
              <Route path="/portal/editor/streams/*" element={<EditorStreamEditor />} />
              <Route path="/portal/editor/newsletter" element={<EditorNewsletter />} />
              <Route path="/portal/editor/newsletter/compose" element={<EditorNewsletterCompose />} />

              {/* Contributor Portal */}
              <Route path="/portal/contributor" element={<ContributorDashboard />} />
              <Route path="/portal/contributor/submissions" element={<ContributorSubmissions />} />
              <Route path="/portal/contributor/pending" element={<ContributorPending />} />
              <Route path="/portal/contributor/submit" element={<ContributorSubmit />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
