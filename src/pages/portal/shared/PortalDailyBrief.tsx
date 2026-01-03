import { useState } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useHasEditorialAccess } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import { Plus, Trash2, Calendar, GripVertical } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";

interface DailyBriefItem {
  id: string;
  content: string;
  brief_date: string;
  order_index: number;
  created_at: string;
}

interface PortalDailyBriefProps {
  role: "admin" | "editor";
  baseUrl: string;
}

export default function PortalDailyBrief({ role, baseUrl }: PortalDailyBriefProps) {
  const { isAdmin } = useHasEditorialAccess();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const { data: briefItems, isLoading } = useQuery({
    queryKey: ["daily-brief-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("daily_brief_items").select("*").order("brief_date", { ascending: false }).order("order_index", { ascending: true });
      if (error) throw error;
      return data as DailyBriefItem[];
    },
  });

  const handleCreate = async () => {
    if (!newContent.trim()) {
      toast.error("Please enter content");
      return;
    }

    // Get max order index for the selected date
    const existingItems = briefItems?.filter(item => item.brief_date === selectedDate) || [];
    const maxOrder = existingItems.length > 0 ? Math.max(...existingItems.map(i => i.order_index)) : -1;

    const { error } = await supabase.from("daily_brief_items").insert({
      content: newContent.trim(),
      brief_date: selectedDate,
      order_index: maxOrder + 1,
    });

    if (error) {
      toast.error("Failed to create brief item");
    } else {
      toast.success("Brief item added");
      setNewContent("");
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["daily-brief-items"] });
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("daily_brief_items").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Brief item deleted");
      queryClient.invalidateQueries({ queryKey: ["daily-brief-items"] });
    }
  };

  // Group items by date
  const groupedItems = briefItems?.reduce((acc, item) => {
    if (!acc[item.brief_date]) {
      acc[item.brief_date] = [];
    }
    acc[item.brief_date].push(item);
    return acc;
  }, {} as Record<string, DailyBriefItem[]>) || {};

  return (
    <PortalLayout requiredRole={role}>
      <Helmet>
        <title>Daily Brief | Portal</title>
      </Helmet>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Daily Brief
          </h1>
          <p className="text-muted-foreground mt-1">Manage daily brief items</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Brief Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Daily Brief Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content</label>
                <Input
                  placeholder="Brief item content..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Add Item
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : Object.keys(groupedItems).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([date, items]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {format(new Date(date), "EEEE, MMMM d, yyyy")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="text-muted-foreground">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <span className="flex-1">{item.content}</span>
                      {isAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Brief Item</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this item?
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
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No daily brief items yet</p>
          <Button onClick={() => setIsDialogOpen(true)}>Add your first item</Button>
        </div>
      )}
    </PortalLayout>
  );
}
