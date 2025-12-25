import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useModels } from "@/hooks/useModels";
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

export default function ModelsList() {
  const { data: models, isLoading } = useModels();
  const { isAdmin } = useHasEditorialAccess();
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const filteredModels = models?.filter(
    (model) =>
      model.name.toLowerCase().includes(search.toLowerCase()) ||
      model.provider.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("ai_models").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete model",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Model deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["models"] });
    }
  };

  return (
    <>
      <Helmet>
        <title>AI Models | Admin | Cognitive Ledger</title>
      </Helmet>
      <AdminLayout>
        <div>
          <div className="flex items-center justify-between mb-6">
            <h1 className="headline-primary">AI Models</h1>
            <Button asChild>
              <Link to="/admin/models/new">
                <Plus className="w-4 h-4 mr-2" />
                Add Model
              </Link>
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search models..."
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
          ) : filteredModels && filteredModels.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Release Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModels.map((model) => (
                    <TableRow key={model.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{model.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {model.version}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{model.provider}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{model.category}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(model.release_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/models/${model.id}`}>
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
                                  <AlertDialogTitle>Delete Model</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this model?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(model.id)}
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
              <p className="text-muted-foreground mb-4">No AI models found</p>
              <Button asChild>
                <Link to="/admin/models/new">Add your first model</Link>
              </Button>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
}
