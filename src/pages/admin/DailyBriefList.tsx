import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useDailyBrief } from "@/hooks/useArticles";
import { useHasEditorialAccess } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function DailyBriefList() {
  const { data: dailyBrief, isLoading } = useDailyBrief();
  const { isAdmin } = useHasEditorialAccess();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newContent, setNewContent] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
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

    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("daily_brief_items").insert({
      content: newContent,
      order_index: orderIndex,
      brief_date: today,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create daily brief item",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Daily brief item created successfully",
      });
      setNewContent("");
      setOrderIndex(0);
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["daily-brief"] });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("daily_brief_items")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete daily brief item",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Daily brief item deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["daily-brief"] });
    }
  };

  return (
    <>
      <Helmet>
        <title>Daily Brief | Admin | Cognitive Ledger</title>
      </Helmet>
      <AdminLayout>
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="headline-primary">Daily Brief</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Today's date: {new Date().toLocaleDateString()}
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Daily Brief Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Input
                      id="content"
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Brief item content..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="order">Order Index</Label>
                    <Input
                      id="order"
                      type="number"
                      min={0}
                      value={orderIndex}
                      onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
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
          ) : dailyBrief && dailyBrief.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Order</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyBrief.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono">
                        {item.order_index}
                      </TableCell>
                      <TableCell>{item.content}</TableCell>
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
                                <AlertDialogTitle>
                                  Delete Daily Brief Item
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this item?
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
              <p className="text-muted-foreground mb-4">
                No daily brief items for today
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                Add your first item
              </Button>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
