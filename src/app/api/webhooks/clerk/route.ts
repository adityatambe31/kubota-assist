import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { withErrorHandling, logApiRequest } from "@/lib/api/handleError";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/api/responses";

export const POST = withErrorHandling(async (req: Request) => {
  logApiRequest("POST", "/api/webhooks/clerk");

  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env.local"
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return createErrorResponse("Missing svix headers", 400, "MISSING_HEADERS");
  }

  // Get the body
  const payload = await req.text();
  const body = JSON.parse(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return createErrorResponse(
      "Webhook verification failed",
      400,
      "VERIFICATION_FAILED"
    );
  }

  // Handle the webhook
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`🔗 Webhook received: ID=${id}, Type=${eventType}`);

  // Handle different event types
  switch (eventType) {
    case "user.created":
      console.log("👤 User created:", evt.data);
      // Set default role for new users
      break;

    case "user.updated":
      console.log("📝 User updated:", evt.data);
      break;

    case "user.deleted":
      console.log("🗑️ User deleted:", evt.data);
      break;

    default:
      console.log(`❓ Unhandled event type: ${eventType}`);
  }

  const responseData = {
    processed: true,
    eventType,
    eventId: id,
  };

  return createSuccessResponse(responseData, 200, {
    message: "Webhook processed successfully",
  });
});
