"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { UserX, Shield, Settings, Users } from "lucide-react";
import { getUserDisplayName } from "@/lib/utils";

// Types
type UserRole = "end_user" | "staff" | "super_admin";

interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  status: "active" | "revoked";
  createdAt: string;
}

// Mock API functions
const mockUsers: User[] = [
  {
    id: "1",
    email: "john.doe@kubota.com",
    username: getUserDisplayName(null, null, "john.doe@kubota.com"),
    role: "end_user",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    email: "sarah.manager@kubota.com",
    username: getUserDisplayName(null, null, "sarah.manager@kubota.com"),
    role: "staff",
    status: "active",
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    email: "admin@kubota.com",
    username: getUserDisplayName(null, null, "admin@kubota.com"),
    role: "super_admin",
    status: "active",
    createdAt: "2024-01-01",
  },
  {
    id: "4",
    email: "mike.user@kubota.com",
    username: getUserDisplayName(null, null, "mike.user@kubota.com"),
    role: "end_user",
    status: "active",
    createdAt: "2024-01-20",
  },
  {
    id: "5",
    email: "lisa.support@kubota.com",
    username: getUserDisplayName(null, null, "lisa.support@kubota.com"),
    role: "staff",
    status: "revoked",
    createdAt: "2024-01-05",
  },
];

const getRoleColor = (role: UserRole) => {
  switch (role) {
    case "super_admin":
      return "bg-red-100 text-red-800 hover:bg-red-200";
    case "staff":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    case "end_user":
      return "bg-green-100 text-green-800 hover:bg-green-200";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case "super_admin":
      return <Shield className="h-3 w-3" />;
    case "staff":
      return <Settings className="h-3 w-3" />;
    case "end_user":
      return <Users className="h-3 w-3" />;
    default:
      return null;
  }
};

export default function AdminConsole() {
  const { user, isLoaded } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if user has super_admin role
  const userRole = user?.publicMetadata?.role as string;
  const isAuthorized = userRole === "super_admin";

  // Show loading while user data is being fetched
  if (!isLoaded) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Show unauthorized message if user doesn't have admin access
  if (!isAuthorized) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
            <p className="text-gray-600 mt-2">
              You don't have permission to access the admin console.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch("/api/admin/users");
        const data = await response.json();

        if (data.success) {
          setUsers(data.users);
        } else {
          console.error("Failed to load users:", data.message);
          // Fallback to mock data
          setUsers(mockUsers);
        }
      } catch (error) {
        console.error("Error loading users:", error);
        // Fallback to mock data
        setUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          role: newRole,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
        console.log(`Updated user ${userId} role to ${newRole}`);
      } else {
        console.error("Failed to update user role:", data.message);
      }
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const handleRevokeUser = async (userId: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          status: "revoked",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, status: "revoked" } : user
          )
        );
        console.log(`Revoked access for user ${userId}`);
      } else {
        console.error("Failed to revoke user:", data.message);
      }
    } catch (error) {
      console.error("Error revoking user:", error);
    }
  };

  const handleRestoreUser = async (userId: string) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          status: "active",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, status: "active" } : user
          )
        );
        console.log(`Restored access for user ${userId}`);
      } else {
        console.error("Failed to restore user:", data.message);
      }
    } catch (error) {
      console.error("Error restoring user:", error);
    }
  };

  const activeUsers = users.filter((user) => user.status === "active");
  const revokedUsers = users.filter((user) => user.status === "revoked");

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-lg">Loading admin console...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Console</h1>
          <p className="text-gray-600 mt-2">
            Manage user roles and permissions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            Total Users: {users.length}
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            Active: {activeUsers.length}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "super_admin").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
            <Settings className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "staff").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">End Users</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === "end_user").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell className="text-gray-600">{user.email}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.status === "active" ? (
                        <Select
                          value={user.role}
                          onValueChange={(value: UserRole) =>
                            handleRoleChange(user.id, value)
                          }
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="end_user">
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                End User
                              </div>
                            </SelectItem>
                            <SelectItem value="staff">
                              <div className="flex items-center gap-2">
                                <Settings className="h-3 w-3" />
                                Staff
                              </div>
                            </SelectItem>
                            <SelectItem value="super_admin">
                              <div className="flex items-center gap-2">
                                <Shield className="h-3 w-3" />
                                Super Admin
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          className={`${getRoleColor(
                            user.role
                          )} flex items-center gap-1`}
                        >
                          {getRoleIcon(user.role)}
                          {user.role.replace("_", " ")}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active" ? "default" : "destructive"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.createdAt}</TableCell>
                  <TableCell className="text-right">
                    {user.status === "active" ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Revoke
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Revoke User Access
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to revoke access for{" "}
                              <strong>{user.email}</strong>? This user will no
                              longer be able to access the system.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRevokeUser(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Revoke Access
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestoreUser(user.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Restore
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
