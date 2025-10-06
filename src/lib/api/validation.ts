import { z } from "zod";

/**
 * Chat API validation schemas
 */
export const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message too long"),
  context: z
    .array(
      z.object({
        role: z.enum(["user", "bot"]),
        content: z.string(),
        solutions: z.array(z.any()).optional(),
        ticketSuggestion: z.any().optional(),
      })
    )
    .default([]),
  sessionId: z.string().optional(),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

/**
 * Ticket API validation schemas
 */
export const ticketRequestSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description too long"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "bot", "assistant"]),
        content: z.string(),
        solutions: z.array(z.any()).optional(),
      })
    )
    .optional(),
});

export type TicketRequest = z.infer<typeof ticketRequestSchema>;

/**
 * Auto-save chat validation schemas
 */
export const autoSaveChatRequestSchema = z.object({
  action: z.enum([
    "save-completed-session",
    "save-with-ticket",
    "save-resolved",
    "save-abandoned",
    "demo-auto-save",
  ]),
  data: z.object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "bot", "assistant"]),
          content: z.string(),
          solutions: z.array(z.any()).optional(),
          ticketSuggestion: z.any().optional(),
        })
      )
      .min(1, "At least one message is required"),
    sessionInfo: z
      .object({
        userId: z.string().optional(),
        category: z.string().optional(),
        resolved: z.boolean().optional(),
      })
      .optional(),
    ticketData: z.any().optional(),
  }),
});

export type AutoSaveChatRequest = z.infer<typeof autoSaveChatRequestSchema>;

/**
 * Retrieve conversation validation schemas
 */
export const retrieveConversationRequestSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  decrypt: z.boolean().default(false),
});

export type RetrieveConversationRequest = z.infer<
  typeof retrieveConversationRequestSchema
>;

/**
 * Admin user management validation schemas
 */
export const createUserRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["super_admin", "staff", "end_user"]).default("end_user"),
});

export const updateUserRequestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.enum(["super_admin", "staff", "end_user"]).optional(),
  status: z.enum(["active", "revoked"]).optional(),
});

export const deleteUserRequestSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;
export type DeleteUserRequest = z.infer<typeof deleteUserRequestSchema>;

/**
 * Webhook validation schemas
 */
export const clerkWebhookEventSchema = z.object({
  type: z.string(),
  data: z.record(z.any()),
  object: z.string(),
});

export type ClerkWebhookEvent = z.infer<typeof clerkWebhookEventSchema>;

/**
 * Generic pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

/**
 * Validation helper function
 */
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe validation that returns result with success flag
 */
export function safeValidateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}
