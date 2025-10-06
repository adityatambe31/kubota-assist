import { withErrorHandling, logApiRequest } from "@/lib/api/handleError";
import { createSuccessResponse } from "@/lib/api/responses";
import { autoSaveChatRequestSchema } from "@/lib/api/validation";
import autoSaveChatService from "@/lib/store/autoSaveChatService";
import { ChatMessage } from "@/hooks/use-chat";

/**
 * API to auto-save chat sessions to encrypted MongoDB
 * This integrates with your existing chat flow
 */

export const POST = withErrorHandling(async (req: Request) => {
  logApiRequest("POST", "/api/auto-save-chat");

  const body = await req.json();
  const { action, data } = autoSaveChatRequestSchema.parse(body);

  switch (action) {
    case "save-completed-session": {
      // Save when user completes chat interaction
      const { messages, sessionInfo } = data;

      const result = await autoSaveChatService.saveCompletedChatSession(
        messages as ChatMessage[],
        {
          userId: sessionInfo?.userId,
          category: sessionInfo?.category,
          resolved: sessionInfo?.resolved,
          userAgent: req.headers.get("user-agent") || undefined,
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        }
      );

      return createSuccessResponse(result, 200, {
        message: "Chat session encrypted and saved successfully",
      });
    }

    case "save-with-ticket": {
      // Save when user creates a ticket
      const { messages, ticketData, sessionInfo } = data;

      const result = await autoSaveChatService.saveSessionWithTicket(
        messages as ChatMessage[],
        ticketData,
        {
          userId: sessionInfo?.userId,
          userAgent: req.headers.get("user-agent") || undefined,
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        }
      );

      return createSuccessResponse(result, 200, {
        message: "Chat session saved with ticket creation",
      });
    }

    case "save-resolved": {
      // Save when issue is resolved through chat
      const { messages, sessionInfo } = data;

      const result = await autoSaveChatService.saveResolvedSession(
        messages as ChatMessage[],
        {
          userId: sessionInfo?.userId,
          category: sessionInfo?.category,
          userAgent: req.headers.get("user-agent") || undefined,
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        }
      );

      return createSuccessResponse(result, 200, {
        message: "Resolved chat session saved",
      });
    }

    case "save-abandoned": {
      // Save when user leaves without completing
      const { messages, sessionInfo } = data;

      const result = await autoSaveChatService.saveAbandonedSession(
        messages as ChatMessage[],
        {
          userId: sessionInfo?.userId,
          userAgent: req.headers.get("user-agent") || undefined,
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        }
      );

      const message = result
        ? "Abandoned session saved"
        : "Session too short, not saved";
      return createSuccessResponse(result, 200, { message });
    }

    case "demo-auto-save": {
      // Demo: Show how auto-save works with sample data
      const demoMessages: ChatMessage[] = [
        {
          role: "user",
          content:
            "Hi, I can't login to my computer. It says my password is incorrect.",
        },
        {
          role: "bot",
          content:
            "I can help you with login issues. Let me provide some solutions:",
          solutions: [
            {
              title: "Reset Your Password",
              solution: [
                "Go to the login page",
                "Click 'Forgot Password'",
                "Enter your username",
                "Check your email for reset instructions",
              ],
              category: "Authentication",
            },
            {
              title: "Check Caps Lock",
              solution: [
                "Make sure Caps Lock is off",
                "Try typing your password in a text editor first",
                "Copy and paste if needed",
              ],
              category: "Authentication",
            },
          ],
        },
        {
          role: "user",
          content: "Thanks! The password reset worked. I'm able to login now.",
        },
        {
          role: "bot",
          content:
            "Great! I'm glad the password reset solved your login issue. Is there anything else I can help you with?",
        },
        {
          role: "user",
          content: "No, that's all. Thank you for your help!",
        },
      ];

      const result = await autoSaveChatService.saveResolvedSession(
        demoMessages,
        {
          userId: "demo-user-123",
          category: "authentication",
          userAgent: req.headers.get("user-agent") || undefined,
          ipAddress: "127.0.0.1",
        }
      );

      const responseData = {
        ...result,
        demo: "Auto-Save Demo Completed",
        explanation: {
          what: "This demo chat session has been encrypted and saved",
          where: "MongoDB collection: encrypted_convo",
          security: "All messages are encrypted with AWS KMS",
          access:
            "Only authorized users with decrypt keys can read the content",
        },
      };

      return createSuccessResponse(responseData, 200, {
        message: "Demo conversation auto-saved successfully!",
      });
    }

    default: {
      // This should never happen due to Zod validation, but included for completeness
      throw new Error("Invalid action");
    }
  }
});

export const GET = withErrorHandling(async (req: Request) => {
  logApiRequest("GET", "/api/auto-save-chat");

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  switch (action) {
    case "stats": {
      // Get statistics about saved chat sessions
      const stats = await autoSaveChatService.getChatStatistics();
      return createSuccessResponse(stats, 200, {
        message: "Chat session statistics retrieved",
      });
    }

    case "integration-guide": {
      // Show how to integrate with your existing chat system
      const integrationGuide = {
        title: "🔗 Chat Auto-Save Integration Guide",
        description:
          "How to automatically save chat sessions to encrypted MongoDB",
        integrationPoints: {
          "1. When user completes chat": {
            endpoint: "POST /api/auto-save-chat",
            action: "save-completed-session",
            data: {
              messages: "Array of ChatMessage[]",
              sessionInfo: {
                userId: "string (optional)",
                category: "string (optional)",
                resolved: "boolean",
              },
            },
          },
          "2. When ticket is created": {
            endpoint: "POST /api/auto-save-chat",
            action: "save-with-ticket",
            data: {
              messages: "Array of ChatMessage[]",
              ticketData: "Your ticket data object",
            },
          },
          "3. When user leaves chat": {
            endpoint: "POST /api/auto-save-chat",
            action: "save-abandoned",
            data: {
              messages: "Array of ChatMessage[]",
            },
          },
        },
        codeExample: {
          javascript: `
// In your chat component, when conversation ends:
const saveSession = async (messages, resolved = false) => {
  try {
    const response = await fetch('/api/auto-save-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: resolved ? 'save-resolved' : 'save-completed-session',
        data: {
          messages: messages,
          sessionInfo: {
            userId: currentUser?.id,
            resolved: resolved
          }
        }
      })
    });
    
    const result = await response.json();
    console.log('Chat saved:', result.data.sessionId);
  } catch (error) {
    console.error('Failed to save chat:', error);
  }
};`,
          react: `
// Add to your chat hook (use-chat.ts)
const saveChatSession = useCallback(async (resolved: boolean = false) => {
  const messages = get().messages;
  if (messages.length < 2) return;
  
  await saveSession(messages, resolved);
  clearMessages(); // Clear after saving
}, []);`,
        },
        benefits: [
          "🔐 All conversations automatically encrypted",
          "💾 Persistent storage in MongoDB",
          "📊 Analytics on user interactions",
          "🔍 Searchable conversation history",
          "📋 Compliance with data protection laws",
          "🛡️ Secure audit trail",
        ],
      };

      return createSuccessResponse(integrationGuide);
    }

    default: {
      const defaultResponse = {
        title: "🤖 Auto-Save Chat Sessions",
        description: "Automatically save and encrypt chat conversations",
        availableActions: {
          "?action=stats": "Get chat session statistics",
          "?action=integration-guide": "See integration instructions",
        },
        currentStatus: {
          encryption: "✅ AWS KMS Enabled",
          storage: "✅ MongoDB encrypted_convo collection",
          autoSave: "✅ Ready for integration",
        },
      };

      return createSuccessResponse(defaultResponse);
    }
  }
});
