import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { useArticles } from "@/hooks/useArticles";
import { useHasEditorialAccess } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function EditorArticlesList() {
  const { data: articles, isLoading } = useArticles();
  const { isAdmin } = useHasEditorialAccess();
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const filteredArticles = articles?.filter(
    (article) =>
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete article",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Article deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    }
  };

  return (
    <PortalLayout requiredRole="editor">
      <Helmet>
        <title>Articles | Editor Portal | Cognitive Ledger</title>
      </Helmet>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Articles</h1>
          <Button asChild>
            <Link to="/portal/editor/articles/new">
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredArticles && filteredArticles.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium line-clamp-1">
                          {article.title}
                        </p>
                        {article.is_featured && (
                          <Badge variant="secondary" className="mt-1">
                            Featured
                          </Badge>
                        )}
                        {article.is_breaking && (
                          <Badge variant="destructive" className="mt-1 ml-1">
                            Breaking
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{article.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={article.status === "published" ? "default" : 
                                article.status === "pending" ? "secondary" : "outline"}
                      >
                        {article.status || "published"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {article.author}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(article.published_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/portal/editor/articles/${article.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Article
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this
                                  article? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(article.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground mb-4">No articles found</p>
            <Button asChild>
              <Link to="/portal/editor/articles/new">Create your first article</Link>
            </Button>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
