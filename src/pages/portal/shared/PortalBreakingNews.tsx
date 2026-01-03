import { useState } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useHasEditorialAccess } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";
import { Plus, Trash2, Zap } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface BreakingNewsItem {
  id: string;
  content: string;
  is_active: boolean;
  created_at: string;
}

interface PortalBreakingNewsProps {
  role: "admin" | "editor";
  baseUrl: string;
}

export default function PortalBreakingNews({ role, baseUrl }: PortalBreakingNewsProps) {
  const { isAdmin } = useHasEditorialAccess();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContent, setNewContent] = useState("");

  const { data: breakingNews, isLoading } = useQuery({
    queryKey: ["breaking-news"],
    queryFn: async () => {
      const { data, error } = await supabase.from("breaking_news").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as BreakingNewsItem[];
    },
  });

  const handleCreate = async () => {
    if (!newContent.trim()) {
      toast.error("Please enter content");
      return;
    }

    const { error } = await supabase.from("breaking_news").insert({ content: newContent.trim() });
    if (error) {
      toast.error("Failed to create breaking news");
    } else {
      toast.success("Breaking news created");
      setNewContent("");
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["breaking-news"] });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase.from("breaking_news").update({ is_active: !isActive }).eq("id", id);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(isActive ? "Breaking news hidden" : "Breaking news activated");
      queryClient.invalidateQueries({ queryKey: ["breaking-news"] });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("breaking_news").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Breaking news deleted");
      queryClient.invalidateQueries({ queryKey: ["breaking-news"] });
    }
  };

  return (
    <PortalLayout requiredRole={role}>
      <Helmet>
        <title>Breaking News | Portal</title>
      </Helmet>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Breaking News
          </h1>
          <p className="text-muted-foreground mt-1">Manage breaking news ticker</p>
        </div>
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
              <Input
                placeholder="Breaking news content..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
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
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakingNews.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium max-w-md truncate">{item.content}</TableCell>
                  <TableCell>
                    <Badge
                      variant={item.is_active ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => handleToggleActive(item.id, item.is_active)}
                    >
                      {item.is_active ? "Active" : "Hidden"}
                    </Badge>
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
                              Are you sure you want to delete this? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item.id)}>
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
          <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No breaking news yet</p>
          <Button onClick={() => setIsDialogOpen(true)}>Add your first breaking news</Button>
        </div>
      )}
    </PortalLayout>
  );
}
