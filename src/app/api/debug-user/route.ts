import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authData = await auth();
    const metadata = authData.sessionClaims?.publicMetadata as
      | { role?: string }
      | undefined;

    let clerkUserData = null;
    let clerkRole = null;

    if (authData.userId) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(authData.userId);
        clerkUserData = {
          id: user.id,
          emailAddress: user.emailAddresses[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName,
          publicMetadata: user.publicMetadata,
          privateMetadata: user.privateMetadata,
        };
        clerkRole = (user.publicMetadata as { role?: string })?.role;
      } catch (clerkError) {
        console.error("Error fetching from Clerk:", clerkError);
      }
    }

    return NextResponse.json(
      {
        debug: "User session debug info",
        userId: authData.userId,
        sessionId: authData.sessionId,
        sessionClaims: authData.sessionClaims,
        publicMetadata: authData.sessionClaims?.publicMetadata,
        role: metadata?.role,
        hasRole: !!metadata?.role,
        roleValue: metadata?.role,
        isSuperAdmin: metadata?.role === "super_admin",
        clerkUserData,
        clerkRole,
        clerkIsSuperAdmin: clerkRole === "super_admin",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Debug user error:", error);
    return NextResponse.json(
      {
        error: "Failed to get user debug info",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
