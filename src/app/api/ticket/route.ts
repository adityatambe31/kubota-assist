import { NextRequest } from "next/server";
import { withErrorHandling, logApiRequest } from "@/lib/api/handleError";
import { createSuccessResponse, HTTP_STATUS } from "@/lib/api/responses";
import {
  ticketRequestSchema,
  paginationSchema,
  validateRequest,
} from "@/lib/api/validation";
import { ticketService } from "@/lib/services/ticketService";

export const POST = withErrorHandling(async (req: Request) => {
  logApiRequest("POST", "/api/ticket");

  // Parse and validate request body
  const requestBody = await req.json();
  const validatedData = validateRequest(ticketRequestSchema, requestBody);

  // Create ticket using business logic service
  const result = await ticketService.createTicket({
    category: validatedData.category,
    subject: validatedData.subject,
    description: validatedData.description,
    priority: validatedData.priority,
    conversationHistory: validatedData.conversationHistory as any, // Type casting for now
  });

  // Return standardized success response
  return createSuccessResponse(result, HTTP_STATUS.CREATED, {
    ticketCreated: true,
    encryptionEnabled: result.encryptionEnabled,
  });
}, "Ticket Creation API");

export const GET = withErrorHandling(async (req: Request) => {
  logApiRequest("GET", "/api/ticket");

  // Parse and validate query parameters
  const { searchParams } = new URL(req.url);
  const ticketId = searchParams.get("ticketId");

  if (ticketId) {
    // Get specific ticket - not implemented in service yet
    return createSuccessResponse({
      message: "Single ticket retrieval not implemented",
    });
  }

  // Parse pagination parameters
  const paginationParams = validateRequest(paginationSchema, {
    page: searchParams.get("page"),
    limit: searchParams.get("limit"),
    sortBy: searchParams.get("sortBy"),
    sortOrder: searchParams.get("sortOrder"),
    search: searchParams.get("search"),
  });

  // Get tickets using business logic service
  const result = await ticketService.getTickets(paginationParams);

  // Return standardized success response
  return createSuccessResponse(result, HTTP_STATUS.OK, {
    totalTickets: result.pagination.total,
  });
}, "Ticket Retrieval API");
