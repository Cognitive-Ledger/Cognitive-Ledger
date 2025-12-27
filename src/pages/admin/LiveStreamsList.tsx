import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useHasEditorialAccess } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Search, Radio, Lock, Users } from "lucide-react";
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

export default function LiveStreamsList() {
  const { isAdmin } = useHasEditorialAccess();
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: streams, isLoading } = useQuery({
    queryKey: ["admin-streams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_streams")
        .select("*")
        .order("scheduled_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredStreams = streams?.filter(
    (stream) =>
      stream.title.toLowerCase().includes(search.toLowerCase()) ||
      stream.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("live_streams").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete live stream",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Live stream deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-streams"] });
    }
  };

  const toggleLive = async (id: string, isLive: boolean) => {
    const { error } = await supabase
      .from("live_streams")
      .update({ is_live: !isLive })
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update stream status",
        variant: "destructive",
      });
    } else {
      toast({
        title: isLive ? "Stream ended" : "Stream is now live!",
        description: isLive ? "The stream has been marked as offline" : "Viewers will be notified",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-streams"] });
    }
  };

  return (
    <>
      <Helmet>
        <title>Live Streams | Admin | Cognitive Ledger</title>
      </Helmet>
      <AdminLayout>
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="headline-primary">Live Streams</h1>
            <Button asChild>
              <Link to="/admin/streams/new">
                <Plus className="w-4 h-4 mr-2" />
                New Stream
              </Link>
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search streams..."
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
          ) : filteredStreams && filteredStreams.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Viewers</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStreams.map((stream) => (
                    <TableRow key={stream.id}>
                      <TableCell>
                        {stream.is_live ? (
                          <Badge variant="destructive" className="animate-pulse">
                            <Radio className="h-3 w-3 mr-1" />
                            LIVE
                          </Badge>
                        ) : (
                          <Badge variant="outline">Scheduled</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium line-clamp-1">
                            {stream.title}
                          </p>
                          {stream.is_premium && (
                            <Badge variant="secondary" className="mt-1">
                              <Lock className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(stream.scheduled_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          {stream.viewers_count}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant={stream.is_live ? "destructive" : "default"}
                            size="sm"
                            onClick={() => toggleLive(stream.id, stream.is_live || false)}
                          >
                            {stream.is_live ? "End Stream" : "Go Live"}
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/streams/${stream.id}`}>
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
                                    Delete Stream
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this
                                    live stream? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(stream.id)}
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
              <Radio className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No live streams yet</p>
              <Button asChild>
                <Link to="/admin/streams/new">Schedule your first stream</Link>
              </Button>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
