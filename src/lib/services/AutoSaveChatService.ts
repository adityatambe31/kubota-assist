import chatEncryptionService from "@/lib/services/ChatEncryptionService";
import { ChatMessage } from "@/hooks/use-chat";

/**
 * Service to automatically save chat sessions to encrypted MongoDB collection
 * This integrates with your existing chat system
 */

export interface ChatSessionSaveOptions {
  sessionId?: string;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
  category?: string;
  resolved?: boolean;
  ticketCreated?: boolean;
}

class AutoSaveChatService {
  /**
   * Save a completed chat session to MongoDB
   * This encrypts all messages and stores them securely
   * @param messages - Array of chat messages from your chat system
   * @param options - Additional metadata about the session
   * @returns Promise<object> - Saved session info
   */
  async saveCompletedChatSession(
    messages: ChatMessage[],
    options: ChatSessionSaveOptions = {}
  ) {
    try {
      // Generate session ID if not provided
      const sessionId =
        options.sessionId ||
        `chat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // Convert your ChatMessage format to the encryption service format
      const messagesForEncryption = messages.map((msg) => ({
        role: (msg.role === "bot" ? "assistant" : msg.role) as
          | "user"
          | "assistant",
        content: this.formatMessageContent(msg),
        timestamp: new Date(), // You can add timestamps to ChatMessage if needed
      }));

      // Determine conversation title from first user message
      const firstUserMessage = messages.find((msg) => msg.role === "user");
      const conversationTitle = firstUserMessage
        ? `Support: ${firstUserMessage.content.substring(0, 50)}${
            firstUserMessage.content.length > 50 ? "..." : ""
          }`
        : "Support Chat Session";

      // Save encrypted conversation
      const savedConversation =
        await chatEncryptionService.storeEncryptedConversation(
          sessionId,
          messagesForEncryption,
          {
            conversationTitle,
            userId: options.userId,
            category: options.category || this.detectCategory(messages),
          }
        );

      // Log the save action
      console.log(`💾 Chat session auto-saved: ${sessionId}`);
      console.log(
        `📊 Session stats: ${messages.length} messages, encrypted in collection 'encrypted_convo'`
      );

      return {
        success: true,
        sessionId: savedConversation.sessionId,
        conversationTitle: savedConversation.conversationTitle,
        totalMessages: savedConversation.metadata.totalMessages,
        encryptedAt: savedConversation.encryptionInfo.encryptedAt,
        metadata: {
          category: options.category,
          resolved: options.resolved,
          ticketCreated: options.ticketCreated,
          databaseCollection: "encrypted_convo",
        },
      };
    } catch (error) {
      console.error("❌ Failed to auto-save chat session:", error);
      throw new Error(
        `Auto-save failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Save chat session when user creates a ticket
   * This marks the conversation as "ticket-created"
   */
  async saveSessionWithTicket(
    messages: ChatMessage[],
    ticketData: any,
    options: ChatSessionSaveOptions = {}
  ) {
    try {
      const result = await this.saveCompletedChatSession(messages, {
        ...options,
        category: ticketData.category || "general-support",
        resolved: false, // Issue not resolved since ticket was created
        ticketCreated: true,
      });

      console.log(
        `🎫 Chat session saved with ticket creation: ${result.sessionId}`
      );
      return result;
    } catch (error) {
      console.error("❌ Failed to save session with ticket:", error);
      throw error;
    }
  }

  /**
   * Save chat session when user's issue is resolved
   * This marks the conversation as "resolved"
   */
  async saveResolvedSession(
    messages: ChatMessage[],
    options: ChatSessionSaveOptions = {}
  ) {
    try {
      const result = await this.saveCompletedChatSession(messages, {
        ...options,
        resolved: true, // Issue was resolved through chat
        ticketCreated: false,
      });

      console.log(`✅ Resolved chat session saved: ${result.sessionId}`);
      return result;
    } catch (error) {
      console.error("❌ Failed to save resolved session:", error);
      throw error;
    }
  }

  /**
   * Auto-save when user leaves the chat (session cleanup)
   * This is for incomplete/abandoned sessions
   */
  async saveAbandonedSession(
    messages: ChatMessage[],
    options: ChatSessionSaveOptions = {}
  ) {
    try {
      // Only save if there are meaningful messages
      if (messages.length < 2) {
        console.log("🔄 Session too short, not saving");
        return null;
      }

      const result = await this.saveCompletedChatSession(messages, {
        ...options,
        category: "incomplete-session",
        resolved: false,
        ticketCreated: false,
      });

      console.log(`🚪 Abandoned chat session saved: ${result.sessionId}`);
      return result;
    } catch (error) {
      console.error("❌ Failed to save abandoned session:", error);
      throw error;
    }
  }

  /**
   * Format message content including solutions
   * This preserves the rich data from your chat system
   */
  private formatMessageContent(message: ChatMessage): string {
    let content = message.content;

    // If bot message has solutions, include them
    if (
      message.role === "bot" &&
      message.solutions &&
      message.solutions.length > 0
    ) {
      content += "\n\n📋 Solutions provided:\n";
      message.solutions.forEach((solution, index) => {
        content += `\n${index + 1}. ${solution.title}`;
        if (solution.solution && solution.solution.length > 0) {
          content += "\n   Steps:";
          solution.solution.forEach((step, stepIndex) => {
            content += `\n   - ${step}`;
          });
        }
      });
    }

    return content;
  }

  /**
   * Auto-detect category from messages
   */
  private detectCategory(messages: ChatMessage[]): string {
    const text = messages.map((m) => m.content.toLowerCase()).join(" ");

    // Simple category detection based on keywords
    if (
      text.includes("login") ||
      text.includes("password") ||
      text.includes("authentication")
    ) {
      return "authentication";
    } else if (
      text.includes("network") ||
      text.includes("internet") ||
      text.includes("connection")
    ) {
      return "network";
    } else if (
      text.includes("software") ||
      text.includes("application") ||
      text.includes("program")
    ) {
      return "software";
    } else if (
      text.includes("hardware") ||
      text.includes("computer") ||
      text.includes("device")
    ) {
      return "hardware";
    } else {
      return "general-support";
    }
  }

  /**
   * Get statistics about saved conversations
   */
  async getChatStatistics() {
    try {
      const conversations = await chatEncryptionService.listConversations(50);

      const stats = {
        totalConversations: conversations.length,
        categoryCounts: {} as Record<string, number>,
        recentActivity: conversations.slice(0, 10),
      };

      // Count categories
      conversations.forEach((conv: any) => {
        const category = conv.category || "unknown";
        stats.categoryCounts[category] =
          (stats.categoryCounts[category] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error("❌ Failed to get chat statistics:", error);
      throw error;
    }
  }
}

// Export singleton instance
const autoSaveChatService = new AutoSaveChatService();
export default autoSaveChatService;
