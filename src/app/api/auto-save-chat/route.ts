import { NextRequest, NextResponse } from "next/server";
import autoSaveChatService from "@/lib/services/AutoSaveChatService";
import { ChatMessage } from "@/hooks/use-chat";

/**
 * API to auto-save chat sessions to encrypted MongoDB
 * This integrates with your existing chat flow
 */

export async function POST(req: NextRequest) {
  try {
    const { action, data } = await req.json();

    switch (action) {
      case "save-completed-session": {
        // Save when user completes chat interaction
        const { messages, sessionInfo } = data;

        if (!messages || !Array.isArray(messages)) {
          return NextResponse.json(
            { success: false, error: "messages array required" },
            { status: 400 }
          );
        }

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

        return NextResponse.json({
          success: true,
          data: result,
          message: "Chat session encrypted and saved successfully",
        });
      }

      case "save-with-ticket": {
        // Save when user creates a ticket
        const { messages, ticketData, sessionInfo } = data;

        if (!messages || !ticketData) {
          return NextResponse.json(
            { success: false, error: "messages and ticketData required" },
            { status: 400 }
          );
        }

        const result = await autoSaveChatService.saveSessionWithTicket(
          messages as ChatMessage[],
          ticketData,
          {
            userId: sessionInfo?.userId,
            userAgent: req.headers.get("user-agent") || undefined,
            ipAddress: req.headers.get("x-forwarded-for") || "unknown",
          }
        );

        return NextResponse.json({
          success: true,
          data: result,
          message: "Chat session saved with ticket creation",
        });
      }

      case "save-resolved": {
        // Save when issue is resolved through chat
        const { messages, sessionInfo } = data;

        if (!messages) {
          return NextResponse.json(
            { success: false, error: "messages required" },
            { status: 400 }
          );
        }

        const result = await autoSaveChatService.saveResolvedSession(
          messages as ChatMessage[],
          {
            userId: sessionInfo?.userId,
            category: sessionInfo?.category,
            userAgent: req.headers.get("user-agent") || undefined,
            ipAddress: req.headers.get("x-forwarded-for") || "unknown",
          }
        );

        return NextResponse.json({
          success: true,
          data: result,
          message: "Resolved chat session saved",
        });
      }

      case "save-abandoned": {
        // Save when user leaves without completing
        const { messages, sessionInfo } = data;

        if (!messages) {
          return NextResponse.json(
            { success: false, error: "messages required" },
            { status: 400 }
          );
        }

        const result = await autoSaveChatService.saveAbandonedSession(
          messages as ChatMessage[],
          {
            userId: sessionInfo?.userId,
            userAgent: req.headers.get("user-agent") || undefined,
            ipAddress: req.headers.get("x-forwarded-for") || "unknown",
          }
        );

        return NextResponse.json({
          success: true,
          data: result,
          message: result
            ? "Abandoned session saved"
            : "Session too short, not saved",
        });
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
            content:
              "Thanks! The password reset worked. I'm able to login now.",
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

        return NextResponse.json({
          success: true,
          demo: "Auto-Save Demo Completed",
          data: result,
          explanation: {
            what: "This demo chat session has been encrypted and saved",
            where: "MongoDB collection: encrypted_convo",
            security: "All messages are encrypted with AWS KMS",
            access:
              "Only authorized users with decrypt keys can read the content",
          },
          message: "Demo conversation auto-saved successfully!",
        });
      }

      default: {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid action",
            supportedActions: [
              "save-completed-session",
              "save-with-ticket",
              "save-resolved",
              "save-abandoned",
              "demo-auto-save",
            ],
          },
          { status: 400 }
        );
      }
    }
  } catch (error) {
    console.error("❌ Auto-save chat API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to auto-save chat session",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    switch (action) {
      case "stats": {
        // Get statistics about saved chat sessions
        const stats = await autoSaveChatService.getChatStatistics();

        return NextResponse.json({
          success: true,
          data: stats,
          message: "Chat session statistics retrieved",
        });
      }

      case "integration-guide": {
        // Show how to integrate with your existing chat system
        return NextResponse.json({
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
        });
      }

      default: {
        return NextResponse.json({
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
        });
      }
    }
  } catch (error) {
    console.error("❌ Auto-save chat GET error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
