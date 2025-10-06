import { withErrorHandling, logApiRequest } from "@/lib/api/handleError";
import { createSuccessResponse, HTTP_STATUS } from "@/lib/api/responses";
import { chatRequestSchema, validateRequest } from "@/lib/api/validation";
import { chatService } from "@/lib/services/chatService";

export const POST = withErrorHandling(async (req: Request) => {
  logApiRequest("POST", "/api/chat");

  // Parse and validate request body
  const requestBody = await req.json();
  const validatedData = validateRequest(chatRequestSchema, requestBody);

  // Process chat message using business logic service
  const result = await chatService.processChatMessage(
    validatedData.message,
    validatedData.context || [],
    validatedData.sessionId
  );

  // Return standardized success response
  return createSuccessResponse(result, HTTP_STATUS.OK, {
    sessionId: result.sessionId,
  });
}, "Chat API");
