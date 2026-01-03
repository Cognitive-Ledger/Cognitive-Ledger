import { useState } from "react";
import { Link } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { useModels } from "@/hooks/useModels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import { Plus, Edit, Trash2, Search, Brain } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useHasEditorialAccess } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface PortalModelsListProps {
  role: "admin" | "editor";
  baseUrl: string;
}

export default function PortalModelsList({ role, baseUrl }: PortalModelsListProps) {
  const { data: models, isLoading } = useModels();
  const { isAdmin } = useHasEditorialAccess();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const filteredModels = models?.filter((model) =>
    model.name.toLowerCase().includes(search.toLowerCase()) ||
    model.provider.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("ai_models").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete model");
    } else {
      toast.success("Model deleted");
      queryClient.invalidateQueries({ queryKey: ["models"] });
    }
  };

  return (
    <PortalLayout requiredRole={role}>
      <Helmet>
        <title>AI Models | Portal</title>
      </Helmet>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">AI Models</h1>
          <p className="text-muted-foreground mt-1">Manage AI model database</p>
        </div>
        <Button asChild>
          <Link to={`${baseUrl}/models/new`}>
            <Plus className="w-4 h-4 mr-2" />
            Add Model
          </Link>
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search models..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No models yet</h3>
          <p className="text-muted-foreground mb-4">Add your first AI model to the database.</p>
          <Button asChild>
            <Link to={`${baseUrl}/models/new`}>
              <Plus className="w-4 h-4 mr-2" />
              Add Model
            </Link>
          </Button>
        </div>
      ) : (
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
                  <TableCell className="font-medium">{model.name}</TableCell>
                  <TableCell>{model.provider}</TableCell>
                  <TableCell>{model.category}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(model.release_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`${baseUrl}/models/${model.id}`}>
                          <Edit className="h-4 w-4" />
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
                                Are you sure you want to delete this model? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(model.id)}>Delete</AlertDialogAction>
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
      )}
    </PortalLayout>
  );
}
