import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
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
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
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

    return NextResponse.json({
      success: true,
      users: transformedUsers,
      total: transformedUsers.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// PATCH - Update user role or status in Clerk
export async function PATCH(req: Request) {
  try {
    const { userId: currentUserId } = await auth();

    if (!currentUserId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { userId, role, status } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
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

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: transformedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user" },
      { status: 500 }
    );
  }
}

// POST - Create new user (for future use)
export async function POST(req: Request) {
  try {
    const { email, role = "end_user" } = await req.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = users.find((user) => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      );
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

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create user" },
      { status: 500 }
    );
  }
}

// DELETE - Delete user (for future use)
export async function DELETE(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const deletedUser = users.splice(userIndex, 1)[0];

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete user" },
      { status: 500 }
    );
  }
}
