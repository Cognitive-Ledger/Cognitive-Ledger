import { Helmet } from "react-helmet-async";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Send, Clock, CheckCircle, XCircle, PenLine, Eye, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ContributorSubmissions() {
  const { user } = useAuth();

  const { data: articles, isLoading } = useQuery({
    queryKey: ["contributor-all-articles", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("author", user?.email || "")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Published</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <PortalLayout>
      <Helmet>
        <title>My Submissions | Cognitive Ledger Portal</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Submissions</h1>
            <p className="text-muted-foreground mt-1">
              View and manage all your article submissions
            </p>
          </div>
          <Button asChild>
            <Link to="/portal/contributor/submit">
              <Send className="w-4 h-4 mr-2" />
              Submit New Article
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : articles && articles.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div className="font-medium">{article.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-md">
                          {article.excerpt}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {article.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(article.status || "draft")}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(article.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {article.status === "published" && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/article/${article.slug}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                          )}
                          {(article.status === "draft" || article.status === "rejected") && (
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/portal/contributor/submit?edit=${article.id}`}>
                                <Edit className="w-4 h-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No submissions yet</p>
                <Button asChild>
                  <Link to="/portal/contributor/submit">Submit Your First Article</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
