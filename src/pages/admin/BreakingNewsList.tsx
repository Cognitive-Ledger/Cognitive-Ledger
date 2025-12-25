import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useBreakingNews } from "@/hooks/useArticles";
import { useHasEditorialAccess } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function BreakingNewsList() {
  const { data: breakingNews, isLoading } = useBreakingNews();
  const { isAdmin } = useHasEditorialAccess();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newContent, setNewContent] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreate = async () => {
    if (!newContent.trim()) {
      toast({
        title: "Error",
        description: "Content is required",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("breaking_news")
      .insert({ content: newContent, is_active: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create breaking news",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Breaking news created successfully",
      });
      setNewContent("");
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["breaking-news"] });
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("breaking_news")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } else {
      queryClient.invalidateQueries({ queryKey: ["breaking-news"] });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("breaking_news").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete breaking news",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Breaking news deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["breaking-news"] });
    }
  };

  return (
    <>
      <Helmet>
        <title>Breaking News | Admin | Cognitive Ledger</title>
      </Helmet>
      <AdminLayout>
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="headline-primary">Breaking News</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Breaking News
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Breaking News</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Input
                      id="content"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Breaking news content..."
                    />
                  </div>
                  <Button onClick={handleCreate} className="w-full">
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : breakingNews && breakingNews.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Content</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {breakingNews.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="max-w-md">
                        <p className="line-clamp-2">{item.content}</p>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={item.is_active}
                          onCheckedChange={() =>
                            handleToggleActive(item.id, item.is_active)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {isAdmin && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Breaking News</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this breaking news?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(item.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground mb-4">No breaking news</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                Add your first breaking news
              </Button>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
