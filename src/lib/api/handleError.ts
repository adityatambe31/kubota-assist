import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { createErrorResponse, ERROR_CODES, HTTP_STATUS } from "./responses";

/**
 * Application-specific error types
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = ERROR_CODES.INTERNAL_ERROR,
    public statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    public details?: any
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message,
      ERROR_CODES.VALIDATION_ERROR,
      HTTP_STATUS.BAD_REQUEST,
      details
    );
    this.name = "ValidationError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message,
      ERROR_CODES.DATABASE_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      details
    );
    this.name = "DatabaseError";
  }
}

export class AIServiceError extends AppError {
  constructor(message: string, details?: any) {
    super(
      message,
      ERROR_CODES.AI_SERVICE_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      details
    );
    this.name = "AIServiceError";
  }
}

export class EncryptionError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "ENCRYPTION_ERROR", 500, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, "AUTHENTICATION_ERROR", 401, details);
  }
}

/**
 * Centralized error handler for API routes
 * Logs errors appropriately and returns standardized error responses
 */
export function handleApiError(
  error: unknown,
  context: string = "API"
): NextResponse {
  // Generate request ID for tracking
  const requestId = `req_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 8)}`;

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    console.error(`${context} Validation Error [${requestId}]:`, {
      issues: error.issues,
      path: error.issues.map((issue) => issue.path.join(".")).join(", "),
    });

    return createErrorResponse(
      "Invalid request data",
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR,
      {
        requestId,
        validationErrors: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        })),
      }
    );
  }

  // Handle application-specific errors
  if (error instanceof AppError) {
    const logLevel = error.statusCode >= 500 ? "error" : "warn";
    console[logLevel](`${context} ${error.name} [${requestId}]:`, {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    });

    return createErrorResponse(error.message, error.statusCode, error.code, {
      requestId,
      ...error.details,
    });
  }

  // Handle MongoDB/Mongoose errors
  if (error && typeof error === "object" && "name" in error) {
    const mongoError = error as any;
    if (
      mongoError.name === "MongoError" ||
      mongoError.name === "MongoServerError"
    ) {
      console.error(`${context} Database Error [${requestId}]:`, {
        name: mongoError.name,
        message: mongoError.message,
        code: mongoError.code,
      });

      return createErrorResponse(
        "Database operation failed",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.DATABASE_ERROR,
        { requestId }
      );
    }

    if (mongoError.name === "ValidationError") {
      console.error(`${context} MongoDB Validation Error [${requestId}]:`, {
        message: mongoError.message,
        errors: mongoError.errors,
      });

      return createErrorResponse(
        "Invalid data provided",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR,
        { requestId }
      );
    }
  }

  // Handle generic errors
  const genericError = error as Error;
  console.error(`${context} Unexpected Error [${requestId}]:`, {
    name: genericError.name || "Unknown",
    message: genericError.message || "An unexpected error occurred",
    stack:
      process.env.NODE_ENV === "development" ? genericError.stack : undefined,
  });

  return createErrorResponse(
    "An unexpected error occurred",
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_ERROR,
    { requestId }
  );
}

/**
 * Utility function to wrap async API handlers with error handling
 */
export function withErrorHandling(
  handler: (req: Request, ...args: any[]) => Promise<NextResponse>,
  context?: string
) {
  return async (req: Request, ...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(req, ...args);
    } catch (error) {
      return handleApiError(error, context);
    }
  };
}

/**
 * Logs API request details for debugging
 */
export function logApiRequest(method: string, path: string, data?: any): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${path}`, data ? { data } : {});
}
