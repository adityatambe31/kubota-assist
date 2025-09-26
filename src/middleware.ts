import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAdminApiRoute = createRouteMatcher(["/api/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Protect admin routes
  if (isAdminRoute(req)) {
    const authData = await auth();

    if (!authData.userId) {
      return Response.redirect(new URL("/sign-in", req.url));
    }

    try {
      // Fetch user data directly from Clerk to get metadata
      const client = await clerkClient();
      const user = await client.users.getUser(authData.userId);
      const userRole = (user.publicMetadata as { role?: string })?.role;

      if (userRole !== "super_admin") {
        return Response.redirect(new URL("/unauthorized", req.url));
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return Response.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Protect admin API routes
  if (isAdminApiRoute(req)) {
    const authData = await auth();

    if (!authData.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      // Fetch user data directly from Clerk to get metadata
      const client = await clerkClient();
      const user = await client.users.getUser(authData.userId);
      const userRole = (user.publicMetadata as { role?: string })?.role;

      if (userRole !== "super_admin") {
        return Response.json(
          { error: "Forbidden - Admin access required" },
          { status: 403 }
        );
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return Response.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
