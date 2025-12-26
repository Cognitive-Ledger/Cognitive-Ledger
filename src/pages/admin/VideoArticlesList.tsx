import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useArticles, useDeleteArticle } from "@/hooks/useArticles";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Video } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useHasEditorialAccess } from "@/hooks/useUserRole";

export default function VideoArticlesList() {
  const { data: articles, isLoading } = useArticles();
  const deleteArticle = useDeleteArticle();
  const { role } = useHasEditorialAccess();

  const videoArticles = articles?.filter((a) => a.category === "video") ?? [];

  const handleDelete = (id: string) => {
    deleteArticle.mutate(id);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="headline-primary">Video Articles</h1>
          <p className="text-muted-foreground mt-1">
            Manage video content
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/videos/new">
            <Plus className="w-4 h-4 mr-2" />
            New Video
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : videoArticles.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <Video className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No video articles yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first video article to get started.
          </p>
          <Button asChild>
            <Link to="/admin/videos/new">
              <Plus className="w-4 h-4 mr-2" />
              New Video
            </Link>
          </Button>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium">
                  Author
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium">
                  Published
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {videoArticles.map((article) => (
                <tr key={article.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-10 bg-muted rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                        {article.image_url ? (
                          <img 
                            src={article.image_url} 
                            alt="" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Video className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="font-medium">{article.title}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {article.author}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                        article.status === "published"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : article.status === "scheduled"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(article.published_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/videos/${article.id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      {role === "admin" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Video</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this video? This
                                action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(article.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
