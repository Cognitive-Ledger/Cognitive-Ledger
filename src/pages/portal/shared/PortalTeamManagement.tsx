import { useState } from "react";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { useHasEditorialAccess } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, UserPlus, Shield, Edit2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface TeamMember {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  email?: string;
  full_name?: string;
}

export default function PortalTeamManagement() {
  const { isAdmin } = useHasEditorialAccess();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("editor");
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data: roles, error: rolesError } = await supabase.from("user_roles").select("*").order("created_at", { ascending: false });
      if (rolesError) throw rolesError;

      const userIds = roles?.map((r) => r.user_id) || [];
      const { data: profiles } = await supabase.from("profiles").select("id, email, full_name").in("id", userIds);

      return roles?.map((role) => {
        const profile = profiles?.find((p) => p.id === role.user_id);
        return { ...role, email: profile?.email || "Unknown", full_name: profile?.full_name || null };
      }) as TeamMember[];
    },
    enabled: isAdmin,
  });

  const handleAddMember = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: profile, error: profileError } = await supabase.from("profiles").select("id").eq("email", email.trim().toLowerCase()).maybeSingle();
      if (profileError) throw profileError;

      if (!profile) {
        toast.error("No user found with that email. They must sign up first.");
        setIsSubmitting(false);
        return;
      }

      const { data: existingRole } = await supabase.from("user_roles").select("id").eq("user_id", profile.id).maybeSingle();
      if (existingRole) {
        toast.error("This user already has a role assigned.");
        setIsSubmitting(false);
        return;
      }

      const { error: insertError } = await supabase.from("user_roles").insert({ user_id: profile.id, role: selectedRole });
      if (insertError) throw insertError;

      toast.success(`Added ${email} as ${selectedRole}`);
      setEmail("");
      setSelectedRole("editor");
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    } catch (error) {
      toast.error("Failed to add team member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingMember) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("user_roles").update({ role: selectedRole }).eq("id", editingMember.id);
      if (error) throw error;
      toast.success(`Updated role to ${selectedRole}`);
      setEditingMember(null);
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    } catch (error) {
      toast.error("Failed to update role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      const { error } = await supabase.from("user_roles").delete().eq("id", id);
      if (error) throw error;
      toast.success("Team member removed");
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
    } catch (error) {
      toast.error("Failed to remove team member");
    }
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case "admin": return "destructive";
      case "editor": return "default";
      case "contributor": return "secondary";
      default: return "outline";
    }
  };

  if (!isAdmin) {
    return (
      <PortalLayout requiredRole="admin">
        <div className="text-center py-12">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Admin Only</h1>
          <p className="text-muted-foreground">Only administrators can manage team members.</p>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout requiredRole="admin">
      <Helmet>
        <title>Team Management | Portal</title>
      </Helmet>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6" />Team Management</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage editors, contributors, and their access levels</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><UserPlus className="w-4 h-4 mr-2" />Add Team Member</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>Add a user to your team by their email. They must have an account first.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin"><div className="flex items-center gap-2"><Shield className="h-4 w-4 text-destructive" />Admin - Full access</div></SelectItem>
                      <SelectItem value="editor"><div className="flex items-center gap-2"><Edit2 className="h-4 w-4 text-primary" />Editor - Create & edit content</div></SelectItem>
                      <SelectItem value="contributor"><div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" />Contributor - Limited editing</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddMember} className="w-full" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add Team Member"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 border rounded-lg bg-destructive/5 border-destructive/20">
            <div className="flex items-center gap-2 mb-2"><Shield className="h-4 w-4 text-destructive" /><span className="font-medium">Admin</span></div>
            <p className="text-sm text-muted-foreground">Full access to all features, including team management and deletion rights.</p>
          </div>
          <div className="p-4 border rounded-lg bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-2"><Edit2 className="h-4 w-4 text-primary" /><span className="font-medium">Editor</span></div>
            <p className="text-sm text-muted-foreground">Create, edit, and publish articles, models, and other content.</p>
          </div>
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2"><Users className="h-4 w-4 text-muted-foreground" /><span className="font-medium">Contributor</span></div>
            <p className="text-sm text-muted-foreground">Submit content for review. Cannot publish directly.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => (<Skeleton key={i} className="h-16 w-full" />))}</div>
        ) : teamMembers && teamMembers.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div><p className="font-medium">{member.full_name || "No name"}</p><p className="text-sm text-muted-foreground">{member.email}</p></div>
                    </TableCell>
                    <TableCell><Badge variant={getRoleBadgeVariant(member.role)}>{member.role}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{new Date(member.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Dialog open={editingMember?.id === member.id} onOpenChange={(open) => { if (open) { setEditingMember(member); setSelectedRole(member.role); } else { setEditingMember(null); } }}>
                          <DialogTrigger asChild><Button variant="ghost" size="icon"><Edit2 className="h-4 w-4" /></Button></DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Role</DialogTitle>
                              <DialogDescription>Change the role for {member.email}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="admin">Admin</SelectItem>
                                  <SelectItem value="editor">Editor</SelectItem>
                                  <SelectItem value="contributor">Contributor</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button onClick={handleUpdateRole} className="w-full" disabled={isSubmitting}>{isSubmitting ? "Updating..." : "Update Role"}</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                              <AlertDialogDescription>Are you sure you want to remove {member.email} from the team? They will lose all editorial access.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteMember(member.id)}>Remove</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No team members yet</p>
            <Button onClick={() => setIsDialogOpen(true)}>Add your first team member</Button>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
