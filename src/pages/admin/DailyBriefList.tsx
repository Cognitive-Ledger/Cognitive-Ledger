import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useDailyBrief } from "@/hooks/useArticles";
import { useHasEditorialAccess } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, X } from "lucide-react";
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

interface BriefItemInput {
  id: string;
  content: string;
}

export default function DailyBriefList() {
  const { data: dailyBrief, isLoading } = useDailyBrief();
  const { isAdmin } = useHasEditorialAccess();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<BriefItemInput[]>([{ id: crypto.randomUUID(), content: "" }]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), content: "" }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, content: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, content } : item)));
  };

  const handleCreate = async () => {
    const validItems = items.filter((item) => item.content.trim());
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Add at least one item with content",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const today = new Date().toISOString().split("T")[0];
    const currentMaxOrder = dailyBrief?.length
      ? Math.max(...dailyBrief.map((item) => item.order_index))
      : -1;

    const newItems = validItems.map((item, index) => ({
      content: item.content.trim(),
      order_index: currentMaxOrder + 1 + index,
      brief_date: today,
    }));

    const { error } = await supabase.from("daily_brief_items").insert(newItems);

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create daily brief items",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `${newItems.length} item${newItems.length > 1 ? "s" : ""} added successfully`,
      });
      setItems([{ id: crypto.randomUUID(), content: "" }]);
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

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setItems([{ id: crypto.randomUUID(), content: "" }]);
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
            <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Items
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add Daily Brief Items</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex gap-2 items-start">
                      <span className="text-sm text-muted-foreground mt-2 w-6">
                        {index + 1}.
                      </span>
                      <Input
                        value={item.content}
                        onChange={(e) => updateItem(item.id, e.target.value)}
                        placeholder="Brief item content..."
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={addItem}
                    className="w-full"
                    type="button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Item
                  </Button>
                  <Button
                    onClick={handleCreate}
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : `Save ${items.filter((i) => i.content.trim()).length || ""} Item${items.filter((i) => i.content.trim()).length !== 1 ? "s" : ""}`}
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