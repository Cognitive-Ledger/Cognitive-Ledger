import { Helmet } from "react-helmet-async";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Send, Clock, CheckCircle, XCircle, PenLine } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function ContributorDashboard() {
  const { user } = useAuth();

  const { data: articles, isLoading } = useQuery({
    queryKey: ["contributor-articles", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("author", user?.email || "")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const stats = [
    {
      name: "Total Submissions",
      value: articles?.length || 0,
      icon: FileText,
      color: "text-blue-500",
    },
    {
      name: "Published",
      value: articles?.filter(a => a.status === "published").length || 0,
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      name: "Pending Review",
      value: articles?.filter(a => a.status === "pending").length || 0,
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      name: "Drafts",
      value: articles?.filter(a => a.status === "draft").length || 0,
      icon: PenLine,
      color: "text-muted-foreground",
    },
  ];

  return (
    <PortalLayout>
      <Helmet>
        <title>Contributor Dashboard | Cognitive Ledger Portal</title>
      </Helmet>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">
            Manage your article submissions and track their status.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{stat.value}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/portal/contributor/submit">
                <Send className="w-4 h-4 mr-2" />
                Submit New Article
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/portal/contributor/submissions">
                <FileText className="w-4 h-4 mr-2" />
                View My Submissions
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/portal/contributor/pending">
                <Clock className="w-4 h-4 mr-2" />
                Check Pending Reviews
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Submissions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>Your latest article submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : articles && articles.length > 0 ? (
              <div className="space-y-3">
                {articles.slice(0, 5).map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {article.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(article.created_at), "MMM d, yyyy")} • {article.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={article.status || "draft"} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No submissions yet</p>
                <Button asChild>
                  <Link to="/portal/contributor/submit">Submit Your First Article</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Guidelines</CardTitle>
            <CardDescription>Tips for getting your articles approved</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <ul className="space-y-2 text-muted-foreground">
              <li>Ensure your article is original and properly researched</li>
              <li>Include relevant sources and citations</li>
              <li>Use clear, concise language appropriate for our audience</li>
              <li>Add a compelling title and excerpt</li>
              <li>Include relevant images with proper attribution</li>
              <li>Review for spelling and grammar before submitting</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    published: { icon: CheckCircle, className: "text-green-500 bg-green-500/10", label: "Published" },
    pending: { icon: Clock, className: "text-yellow-500 bg-yellow-500/10", label: "Pending" },
    draft: { icon: PenLine, className: "text-muted-foreground bg-muted", label: "Draft" },
    rejected: { icon: XCircle, className: "text-red-500 bg-red-500/10", label: "Rejected" },
  }[status] || { icon: Clock, className: "text-muted-foreground bg-muted", label: status };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
