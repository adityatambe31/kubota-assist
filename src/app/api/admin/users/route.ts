import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import {
  withErrorHandling,
  logApiRequest,
  AuthenticationError,
} from "@/lib/api/handleError";
import { createSuccessResponse } from "@/lib/api/responses";
import { getUserDisplayName } from "@/utils/userHelpers";

// Mock user data - In a real app, this would be in a database
let users = [
  {
    id: "1",
    email: "rick@kubota.com",
    role: "end_user",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    email: "linda.manager@kubota.com",
    role: "staff",
    status: "active",
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    email: "admin@kubota.com",
    role: "super_admin",
    status: "active",
    createdAt: "2024-01-01",
  },
  {
    id: "4",
    email: "aditya.user@kubota.com",
    role: "end_user",
    status: "active",
    createdAt: "2024-01-20",
  },
  {
    id: "5",
    email: "clifton@kubota.com",
    role: "staff",
    status: "revoked",
    createdAt: "2024-01-05",
  },
];

// GET - Fetch all users from Clerk
export const GET = withErrorHandling(async (req: Request) => {
  logApiRequest("GET", "/api/admin/users");

  const { userId } = await auth();

  if (!userId) {
    throw new AuthenticationError("Authentication required");
  }

  // Get the clerk client instance
  const clerk = await clerkClient();

  // Fetch users from Clerk
  const clerkUsers = await clerk.users.getUserList({
    limit: 100,
    offset: 0,
  });

  // Transform Clerk users to our format
  const transformedUsers = clerkUsers.data.map((user: any) => ({
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || "",
    username: getUserDisplayName(
      user.firstName,
      user.lastName,
      user.emailAddresses[0]?.emailAddress || ""
    ),
    role: (user.publicMetadata?.role as string) || "end_user",
    status: user.banned ? "revoked" : "active",
    createdAt: new Date(user.createdAt).toISOString().split("T")[0],
  }));

  const responseData = {
    users: transformedUsers,
    total: transformedUsers.length,
  };

  return createSuccessResponse(responseData, 200, {
    message: "Users retrieved successfully",
  });
});

// PATCH - Update user role or status in Clerk
export const PATCH = withErrorHandling(async (req: Request) => {
  logApiRequest("PATCH", "/api/admin/users");

  const { userId: currentUserId } = await auth();

  if (!currentUserId) {
    throw new AuthenticationError("Authentication required");
  }

  const body = await req.json();
  const { userId, role, status } = body;

  if (!userId) {
    throw new Error("User ID is required");
  }

  // Get the clerk client instance
  const clerk = await clerkClient();

  // Update role if provided
  if (role && ["end_user", "staff", "super_admin"].includes(role)) {
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role,
      },
    });
  }

  // Update status if provided (ban/unban user)
  if (status && ["active", "revoked"].includes(status)) {
    if (status === "revoked") {
      await clerk.users.banUser(userId);
    } else if (status === "active") {
      await clerk.users.unbanUser(userId);
    }
  }

  // Fetch the updated user to return
  const updatedUser = await clerk.users.getUser(userId);

  const transformedUser = {
    id: updatedUser.id,
    email: updatedUser.emailAddresses[0]?.emailAddress || "",
    username: getUserDisplayName(
      updatedUser.firstName,
      updatedUser.lastName,
      updatedUser.emailAddresses[0]?.emailAddress || ""
    ),
    role: (updatedUser.publicMetadata?.role as string) || "end_user",
    status: updatedUser.banned ? "revoked" : "active",
    createdAt: new Date(updatedUser.createdAt).toISOString().split("T")[0],
  };

  return createSuccessResponse(transformedUser, 200, {
    message: "User updated successfully",
  });
});

// POST - Create new user (for future use)
export const POST = withErrorHandling(async (req: Request) => {
  logApiRequest("POST", "/api/admin/users");

  const { userId: currentUserId } = await auth();

  if (!currentUserId) {
    throw new AuthenticationError("Authentication required");
  }

  const { email, role = "end_user" } = await req.json();

  if (!email) {
    throw new Error("Email is required");
  }

  // Check if user already exists
  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const newUser = {
    id: (users.length + 1).toString(),
    email,
    role,
    status: "active",
    createdAt: new Date().toISOString().split("T")[0],
  };

  users.push(newUser);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return createSuccessResponse(newUser, 201, {
    message: "User created successfully",
  });
});

// DELETE - Delete user (for future use)
export const DELETE = withErrorHandling(async (req: Request) => {
  logApiRequest("DELETE", "/api/admin/users");

  const { userId: currentUserId } = await auth();

  if (!currentUserId) {
    throw new AuthenticationError("Authentication required");
  }

  const { userId } = await req.json();

  if (!userId) {
    throw new Error("User ID is required");
  }

  const userIndex = users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    throw new Error("User not found");
  }

  const deletedUser = users.splice(userIndex, 1)[0];

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return createSuccessResponse(deletedUser, 200, {
    message: "User deleted successfully",
  });
});
