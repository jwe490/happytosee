import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCog, UserPlus, Trash2, Shield, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdminUser {
  user_id: string;
  role: string;
  created_at: string;
  display_name: string | null;
  last_login_at: string | null;
}

interface UserManagementSectionProps {
  userRole: string;
}

export function UserManagementSection({ userRole }: UserManagementSectionProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "analyst" | "moderator" | "super_admin">("moderator");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManage = userRole === "super_admin";

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_admin_users");

      if (error) throw error;
      setAdmins((data as unknown as AdminUser[]) || []);
    } catch (err: any) {
      console.error("Error fetching admins:", err);
      toast.error("Failed to load admin users");
    } finally {
      setIsLoading(false);
    }
  };

  const addRole = async () => {
    if (!newUserId) {
      toast.error("Please enter a user ID");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("add_admin_role", {
        p_user_id: newUserId,
        p_role: newRole,
      });

      if (error) throw error;
      toast.success("Role added successfully");
      setIsAddDialogOpen(false);
      setNewUserId("");
      setNewRole("moderator");
      fetchAdmins();
    } catch (err: any) {
      console.error("Error adding role:", err);
      toast.error(err.message || "Failed to add role");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeRole = async (userId: string, role: "admin" | "analyst" | "moderator" | "super_admin" | "user") => {
    try {
      const { error } = await supabase.rpc("remove_admin_role", {
        p_user_id: userId,
        p_role: role,
      });

      if (error) throw error;
      toast.success("Role removed successfully");
      fetchAdmins();
    } catch (err: any) {
      console.error("Error removing role:", err);
      toast.error(err.message || "Failed to remove role");
    }
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      admin.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "admin":
        return "default";
      case "moderator":
        return "secondary";
      case "analyst":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserCog className="w-6 h-6 text-accent" />
            User Management
          </h2>
          <p className="text-muted-foreground">Manage admin users and roles</p>
        </div>
        {canManage && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Admin User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Admin User</DialogTitle>
                <DialogDescription>
                  Assign an admin role to an existing user
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">User ID</Label>
                  <Input
                    id="userId"
                    placeholder="Enter user UUID"
                    value={newUserId}
                    onChange={(e) => setNewUserId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={newRole} onValueChange={(value: "admin" | "analyst" | "moderator" | "super_admin") => setNewRole(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addRole} disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Role"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!canManage && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-destructive" />
              <div>
                <p className="font-medium">Super Admin Access Required</p>
                <p className="text-sm text-muted-foreground">
                  Only Super Admins can manage user roles
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, ID, or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Admin Table */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>
            {filteredAdmins.length} admin users found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Last Login</TableHead>
                {canManage && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.map((admin) => (
                <TableRow key={`${admin.user_id}-${admin.role}`}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{admin.display_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {admin.user_id.slice(0, 8)}...
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(admin.role)}>
                      {admin.role.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(admin.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {admin.last_login_at
                      ? new Date(admin.last_login_at).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRole(admin.user_id, admin.role as "admin" | "analyst" | "moderator" | "super_admin" | "user")}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filteredAdmins.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canManage ? 5 : 4} className="text-center py-8">
                    <p className="text-muted-foreground">No admin users found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/30">
              <Badge variant="destructive" className="mb-2">Super Admin</Badge>
              <p className="text-sm text-muted-foreground">
                Full access to all features, user management, and system settings
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <Badge variant="default" className="mb-2">Admin</Badge>
              <p className="text-sm text-muted-foreground">
                Access to analytics, recommendations, and activity logs
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <Badge variant="secondary" className="mb-2">Moderator</Badge>
              <p className="text-sm text-muted-foreground">
                Can view analytics and moderate content/reviews
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/30">
              <Badge variant="outline" className="mb-2">Analyst</Badge>
              <p className="text-sm text-muted-foreground">
                Read-only access to analytics and reports
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
