import { Helmet } from "react-helmet-async";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useArticles } from "@/hooks/useArticles";
import { useModels } from "@/hooks/useModels";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText,
  Cpu,
  Zap,
  Calendar,
  Plus,
  Video,
  Headphones,
  Radio,
  Users,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function AdminPortalDashboard() {
  const { data: articles, isLoading: articlesLoading } = useArticles();
  const { data: models, isLoading: modelsLoading } = useModels();

  const { data: breakingNews, isLoading: breakingLoading } = useQuery({
    queryKey: ["breaking-news-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("breaking_news")
        .select("id")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: dailyBrief, isLoading: briefLoading } = useQuery({
    queryKey: ["daily-brief-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_brief_items")
        .select("id");
      if (error) throw error;
      return data;
    },
  });

  const { data: pendingArticles, isLoading: pendingLoading } = useQuery({
    queryKey: ["pending-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: teamCount, isLoading: teamLoading } = useQuery({
    queryKey: ["team-count"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id");
      if (error) throw error;
      return data;
    },
  });

  const stats = [
    {
      name: "Articles",
      value: articles?.length ?? 0,
      icon: FileText,
      loading: articlesLoading,
      href: "/portal/admin/articles",
    },
    {
      name: "AI Models",
      value: models?.length ?? 0,
      icon: Cpu,
      loading: modelsLoading,
      href: "/portal/admin/models",
    },
    {
      name: "Breaking News",
      value: breakingNews?.length ?? 0,
      icon: Zap,
      loading: breakingLoading,
      href: "/portal/admin/breaking",
    },
    {
      name: "Daily Brief Items",
      value: dailyBrief?.length ?? 0,
      icon: Calendar,
      loading: briefLoading,
      href: "/portal/admin/daily-brief",
    },
    {
      name: "Team Members",
      value: teamCount?.length ?? 0,
      icon: Users,
      loading: teamLoading,
      href: "/portal/admin/team",
    },
    {
      name: "Pending Reviews",
      value: pendingArticles?.length ?? 0,
      icon: Clock,
      loading: pendingLoading,
      href: "/portal/admin/articles?status=pending",
    },
  ];

  const quickActions = [
    { name: "New Article", href: "/portal/admin/articles/new", icon: FileText },
    { name: "New Video", href: "/portal/admin/videos/new", icon: Video },
    { name: "New AI Model", href: "/portal/admin/models/new", icon: Cpu },
    { name: "New Podcast", href: "/portal/admin/podcasts/new", icon: Headphones },
    { name: "New Stream", href: "/portal/admin/streams/new", icon: Radio },
  ];

  return (
    <PortalLayout requiredRole="admin">
      <Helmet>
        <title>Admin Dashboard | Cognitive Ledger Portal</title>
      </Helmet>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your content and team management
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <Link key={stat.name} to={stat.href}>
              <Card className="hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </CardTitle>
                  <stat.icon className="w-5 h-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {stat.loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <p className="text-3xl font-bold">{stat.value}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pending Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Reviews
              </CardTitle>
              <CardDescription>Articles awaiting approval</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : pendingArticles && pendingArticles.length > 0 ? (
                <div className="space-y-3">
                  {pendingArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/portal/admin/articles/${article.id}`}
                      className="block p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <p className="font-medium text-foreground truncate">{article.title}</p>
                      <p className="text-sm text-muted-foreground">
                        By {article.author} • {format(new Date(article.created_at), "MMM d, yyyy")}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">No pending reviews</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Create new content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Button key={action.name} variant="outline" className="h-auto py-4" asChild>
                    <Link to={action.href}>
                      <div className="flex flex-col items-center gap-2">
                        <action.icon className="w-5 h-5" />
                        <span className="text-sm">{action.name}</span>
                      </div>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Articles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Articles</CardTitle>
              <CardDescription>Latest published content</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/portal/admin/articles">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {articlesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : articles && articles.length > 0 ? (
              <div className="space-y-3">
                {articles.slice(0, 5).map((article) => (
                  <Link
                    key={article.id}
                    to={`/portal/admin/articles/${article.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{article.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {article.category} • {format(new Date(article.published_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-6">No articles yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
