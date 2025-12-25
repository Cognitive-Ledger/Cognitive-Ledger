import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useArticles, useBreakingNews, useDailyBrief } from "@/hooks/useArticles";
import { useModels } from "@/hooks/useModels";
import { FileText, Cpu, Zap, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: articles, isLoading: articlesLoading } = useArticles();
  const { data: models, isLoading: modelsLoading } = useModels();
  const { data: breakingNews, isLoading: breakingLoading } = useBreakingNews();
  const { data: dailyBrief, isLoading: dailyLoading } = useDailyBrief();

  const stats = [
    {
      name: "Articles",
      value: articles?.length ?? 0,
      icon: FileText,
      loading: articlesLoading,
    },
    {
      name: "AI Models",
      value: models?.length ?? 0,
      icon: Cpu,
      loading: modelsLoading,
    },
    {
      name: "Breaking News",
      value: breakingNews?.length ?? 0,
      icon: Zap,
      loading: breakingLoading,
    },
    {
      name: "Daily Brief Items",
      value: dailyBrief?.length ?? 0,
      icon: Calendar,
      loading: dailyLoading,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Cognitive Ledger</title>
      </Helmet>
      <AdminLayout>
        <div>
          <h1 className="headline-primary mb-6">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.name}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {stat.loading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-3xl font-bold">{stat.value}</div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Articles</CardTitle>
              </CardHeader>
              <CardContent>
                {articlesLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : articles && articles.length > 0 ? (
                  <ul className="space-y-3">
                    {articles.slice(0, 5).map((article) => (
                      <li
                        key={article.id}
                        className="flex items-center justify-between py-2 border-b border-border last:border-0"
                      >
                        <div>
                          <p className="font-medium text-sm line-clamp-1">
                            {article.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {article.category}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(article.published_at).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No articles yet. Create your first article!
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="/admin/articles/new"
                    className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-secondary transition-colors"
                  >
                    <FileText className="h-6 w-6 mb-2 text-primary" />
                    <span className="text-sm font-medium">New Article</span>
                  </a>
                  <a
                    href="/admin/models/new"
                    className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-secondary transition-colors"
                  >
                    <Cpu className="h-6 w-6 mb-2 text-primary" />
                    <span className="text-sm font-medium">Add Model</span>
                  </a>
                  <a
                    href="/admin/breaking/new"
                    className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-secondary transition-colors"
                  >
                    <Zap className="h-6 w-6 mb-2 text-primary" />
                    <span className="text-sm font-medium">Breaking News</span>
                  </a>
                  <a
                    href="/admin/daily-brief/new"
                    className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-secondary transition-colors"
                  >
                    <Calendar className="h-6 w-6 mb-2 text-primary" />
                    <span className="text-sm font-medium">Daily Brief</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </>
  );
}
