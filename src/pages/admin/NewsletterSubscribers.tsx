import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Search,
  Trash2,
  UserPlus,
  Users,
  UserCheck,
  Send,
  Clock,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  is_active: boolean;
  unsubscribed_at: string | null;
  confirmed_at: string | null;
}

interface ScheduledNewsletter {
  id: string;
  subject: string;
  scheduled_for: string;
  status: string;
  created_at: string;
}

export default function NewsletterSubscribers() {
  const [search, setSearch] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const queryClient = useQueryClient();

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (error) throw error;
      return data as Subscriber[];
    },
  });

  const { data: scheduledNewsletters, isLoading: scheduledLoading } = useQuery({
    queryKey: ["scheduled-newsletters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_newsletters")
        .select("id, subject, scheduled_for, status, created_at")
        .order("scheduled_for", { ascending: true });

      if (error) throw error;
      return data as ScheduledNewsletter[];
    },
  });

  const addSubscriber = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.toLowerCase() });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
      setNewEmail("");
      toast.success("Subscriber added successfully");
    },
    onError: (error: any) => {
      if (error.message?.includes("duplicate")) {
        toast.error("This email is already subscribed");
      } else {
        toast.error("Failed to add subscriber");
      }
    },
  });

  const deleteSubscriber = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
      toast.success("Subscriber removed");
    },
    onError: () => {
      toast.error("Failed to remove subscriber");
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({
          is_active: isActive,
          unsubscribed_at: isActive ? null : new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["newsletter-subscribers"] });
      toast.success("Subscriber status updated");
    },
    onError: () => {
      toast.error("Failed to update subscriber");
    },
  });

  const cancelScheduled = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scheduled_newsletters")
        .update({ status: "cancelled" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-newsletters"] });
      toast.success("Newsletter cancelled");
    },
    onError: () => {
      toast.error("Failed to cancel newsletter");
    },
  });

  const filteredSubscribers = subscribers?.filter((sub) =>
    sub.email.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount =
    subscribers?.filter((s) => s.is_active && s.confirmed_at).length || 0;
  const pendingCount = subscribers?.filter((s) => !s.confirmed_at).length || 0;
  const pendingNewsletters =
    scheduledNewsletters?.filter((n) => n.status === "pending") || [];

  const exportToCSV = () => {
    if (!subscribers?.length) return;

    const headers = ["Email", "Subscribed At", "Status", "Unsubscribed At"];
    const rows = subscribers.map((sub) => [
      sub.email,
      format(new Date(sub.subscribed_at), "yyyy-MM-dd HH:mm"),
      sub.is_active ? "Active" : "Unsubscribed",
      sub.unsubscribed_at
        ? format(new Date(sub.unsubscribed_at), "yyyy-MM-dd HH:mm")
        : "",
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Subscribers exported");
  };

  const handleAddSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    addSubscriber.mutate(newEmail.trim());
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="headline-secondary">Newsletter</h1>
            <p className="text-muted-foreground mt-1">
              Manage subscribers and scheduled newsletters
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/admin/newsletter/compose">
                <Send className="w-4 h-4 mr-2" />
                Compose
              </Link>
            </Button>
            <Button variant="outline" onClick={exportToCSV} disabled={!subscribers?.length}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Tabs defaultValue="subscribers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="scheduled">
              Scheduled
              {pendingNewsletters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingNewsletters.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subscribers" className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-semibold">{subscribers?.length || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <UserCheck className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Confirmed</p>
                    <p className="text-2xl font-semibold">{activeCount}</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg">
                    <Users className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-semibold">{pendingCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add subscriber form */}
            <form onSubmit={handleAddSubscriber} className="flex gap-2">
              <Input
                type="email"
                placeholder="Add new subscriber email..."
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit" disabled={addSubscriber.isPending}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </form>

            {/* Search */}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search subscribers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Skeleton className="h-4 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-8 w-8" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredSubscribers?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No subscribers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubscribers?.map((subscriber) => (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(subscriber.subscribed_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {!subscriber.confirmed_at ? (
                            <Badge
                              variant="outline"
                              className="text-amber-600 border-amber-300"
                            >
                              Pending
                            </Badge>
                          ) : (
                            <Badge
                              variant={subscriber.is_active ? "default" : "secondary"}
                              className="cursor-pointer"
                              onClick={() =>
                                toggleActive.mutate({
                                  id: subscriber.id,
                                  isActive: !subscriber.is_active,
                                })
                              }
                            >
                              {subscriber.is_active ? "Active" : "Unsubscribed"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete subscriber?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove {subscriber.email} from your
                                  subscriber list.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteSubscriber.mutate(subscriber.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Scheduled Newsletters
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scheduledLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : pendingNewsletters.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No scheduled newsletters</p>
                    <p className="text-sm mt-1">
                      Compose a newsletter and schedule it for later
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingNewsletters.map((newsletter) => (
                      <div
                        key={newsletter.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{newsletter.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            Scheduled for{" "}
                            {format(
                              new Date(newsletter.scheduled_for),
                              "MMM d, yyyy 'at' h:mm a"
                            )}
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel scheduled newsletter?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will cancel the scheduled sending of "{newsletter.subject}".
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep scheduled</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => cancelScheduled.mutate(newsletter.id)}
                              >
                                Cancel newsletter
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

