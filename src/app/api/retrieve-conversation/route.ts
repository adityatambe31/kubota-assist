import { withErrorHandling, logApiRequest } from "@/lib/api/handleError";
import { createSuccessResponse } from "@/lib/api/responses";
import { retrieveConversationRequestSchema } from "@/lib/api/validation";
import chatEncryptionService from "@/lib/security/awsEncryption";

export const POST = withErrorHandling(async (req: Request) => {
  logApiRequest("POST", "/api/retrieve-conversation");

  const body = await req.json();
  const { sessionId, decrypt } = retrieveConversationRequestSchema.parse(body);

  console.log(`🔍 Retrieving conversation: ${sessionId}, decrypt: ${decrypt}`);

  const conversation = await chatEncryptionService.retrieveConversation(
    sessionId,
    decrypt
  );

  const message = decrypt
    ? "Conversation decrypted successfully"
    : "Encrypted conversation metadata retrieved";

  return createSuccessResponse(conversation, 200, { message });
});

export const GET = withErrorHandling(async (req: Request) => {
  logApiRequest("GET", "/api/retrieve-conversation");

  const info = {
    info: "Retrieve Encrypted Conversation",
    usage: 'POST with {"sessionId": "your-session-id", "decrypt": true/false}',
    endpoints: {
      POST: "Retrieve conversation data",
      GET: "Get API usage information",
    },
  };

  return createSuccessResponse(info);
});
