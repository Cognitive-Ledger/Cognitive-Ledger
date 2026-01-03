import { Helmet } from "react-helmet-async";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Send, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function ContributorPending() {
  const { user } = useAuth();

  const { data: articles, isLoading } = useQuery({
    queryKey: ["contributor-pending-articles", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("author", user?.email || "")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <PortalLayout>
      <Helmet>
        <title>Pending Review | Cognitive Ledger Portal</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pending Review</h1>
            <p className="text-muted-foreground mt-1">
              Articles waiting for editorial review
            </p>
          </div>
          <Button asChild>
            <Link to="/portal/contributor/submit">
              <Send className="w-4 h-4 mr-2" />
              Submit New Article
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : articles && articles.length > 0 ? (
          <div className="space-y-4">
            {articles.map((article) => (
              <Card key={article.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="capitalize">
                          {article.category}
                        </Badge>
                        <Badge className="bg-yellow-500/10 text-yellow-500">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending Review
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-2 mb-3">
                        {article.excerpt}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Submitted on {format(new Date(article.created_at), "MMMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Pending Articles</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any articles waiting for review
              </p>
              <Button asChild>
                <Link to="/portal/contributor/submit">
                  <Send className="w-4 h-4 mr-2" />
                  Submit an Article
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}
