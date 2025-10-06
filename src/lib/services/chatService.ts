import { connectDB } from "@/lib/db/mongodb/connection";
import { searchSolutions } from "@/lib/db/mongodb/queries";
import { SUPPORT_PROMPTS } from "@/lib/ai/prompts";
import { TicketType } from "@/types/global";
import { explainSolution } from "@/lib/ai";
import autoSaveChatService from "@/lib/store/autoSaveChatService";
import { DatabaseError, AIServiceError } from "@/lib/api/handleError";
import { ChatMessage } from "@/hooks/use-chat";

export interface ChatSessionResult {
  message: string;
  solutions: any[];
  suggestTicket: boolean;
  sessionId: string;
}

/**
 * Chat service handling all chat-related business logic
 */
class ChatService {
  /**
   * Generates a unique session ID
   */
  generateSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  /**
   * Handles initial category selection when context is empty
   */
  handleCategorySelection(message: string): ChatSessionResult | null {
    const selectedCategory = SUPPORT_PROMPTS.find(
      (cat) => cat.title === message
    );

    if (selectedCategory) {
      return {
        message: "Please select your specific issue:",
        solutions: selectedCategory.subPrompts.map((subPrompt) => ({
          solution: [subPrompt.text],
          category: selectedCategory.title,
        })),
        suggestTicket: false,
        sessionId: this.generateSessionId(),
      };
    }

    return null;
  }

  /**
   * Determines the category from message content and context
   */
  determineCategoryFromMessage(
    message: string,
    context: ChatMessage[]
  ): TicketType | undefined {
    // Find matching category from message keywords
    const matchingCategory = SUPPORT_PROMPTS.find((category) =>
      category.subPrompts.some((subPrompt) =>
        subPrompt.keywords.some((keyword) =>
          message.toLowerCase().includes(keyword.toLowerCase())
        )
      )
    );

    let category: TicketType | undefined = Object.values(TicketType).find(
      (type) => type === matchingCategory?.title
    );

    // Try getting category from context if not found
    if (!category && context.length > 0) {
      const lastMessage = context[context.length - 1].content;
      category = Object.values(TicketType).find(
        (type) =>
          type ===
          SUPPORT_PROMPTS.find((cat) => cat.title === lastMessage)?.title
      );
    }

    return category;
  }

  /**
   * Processes a chat message and returns AI-generated response with solutions
   */
  async processChatMessage(
    message: string,
    context: ChatMessage[],
    sessionId?: string
  ): Promise<ChatSessionResult> {
    try {
      // Ensure database connection
      await connectDB();
    } catch (error) {
      throw new DatabaseError("Failed to connect to database", error);
    }

    const currentSessionId = sessionId || this.generateSessionId();

    // Handle initial category selection
    if (context.length === 0) {
      const categoryResult = this.handleCategorySelection(message);
      if (categoryResult) {
        categoryResult.sessionId = currentSessionId;
        return categoryResult;
      }
    }

    // Determine category from message
    const category = this.determineCategoryFromMessage(message, context);

    try {
      // Search for solutions in database
      const solutions = await searchSolutions(message, category);

      if (solutions.length > 0) {
        // Get AI explanation for the solutions
        let explanation: string;
        try {
          explanation = await explainSolution(message, solutions, context);
        } catch (error) {
          console.warn("AI service failed, using fallback explanation:", error);
          explanation = this.createFallbackExplanation(message, solutions);
        }

        // Prepare chat messages for auto-save
        const chatMessages = [
          ...context,
          { role: "user" as const, content: message },
          { role: "bot" as const, content: explanation },
        ];

        // Auto-save conversation (non-blocking)
        this.autoSaveConversation(
          chatMessages,
          currentSessionId,
          category,
          true
        ).catch((error) =>
          console.error("Failed to auto-save conversation:", error)
        );

        return {
          message: explanation,
          solutions: solutions,
          suggestTicket: false,
          sessionId: currentSessionId,
        };
      }

      // No solutions found - suggest ticket creation
      return await this.handleNoSolutionsFound(
        message,
        context,
        currentSessionId,
        category
      );
    } catch (error) {
      if (error instanceof DatabaseError) {
        throw error;
      }
      throw new DatabaseError("Failed to search for solutions", error);
    }
  }

  /**
   * Handles case when no solutions are found
   */
  private async handleNoSolutionsFound(
    message: string,
    context: ChatMessage[],
    sessionId: string,
    category?: TicketType
  ): Promise<ChatSessionResult> {
    const noSolutionMessage =
      "I don't find any matching solutions in our database. Please create a support ticket.";

    // Prepare chat messages for auto-save
    const chatMessages = [
      ...context,
      { role: "user" as const, content: message },
      { role: "bot" as const, content: noSolutionMessage },
    ];

    // Auto-save unresolved conversation (non-blocking)
    this.autoSaveConversation(chatMessages, sessionId, category, false).catch(
      (error) =>
        console.error("Failed to auto-save unresolved conversation:", error)
    );

    return {
      message: noSolutionMessage,
      solutions: [],
      suggestTicket: true,
      sessionId,
    };
  }

  /**
   * Creates a fallback explanation when AI service fails
   */
  private createFallbackExplanation(message: string, solutions: any[]): string {
    let explanation = `I found ${solutions.length} solution${
      solutions.length > 1 ? "s" : ""
    } for your issue: "${message}"\n\n`;

    solutions.forEach((solution, index) => {
      explanation += `**${solution.title}**\n`;
      if (solution.solution && Array.isArray(solution.solution)) {
        solution.solution.forEach((step: string, stepIndex: number) => {
          explanation += `${stepIndex + 1}. ${step}\n`;
        });
      }
      explanation += "\n";
    });

    return explanation;
  }

  /**
   * Auto-saves conversation to encrypted storage
   */
  private async autoSaveConversation(
    chatMessages: ChatMessage[],
    sessionId: string,
    category?: TicketType,
    resolved: boolean = false
  ): Promise<void> {
    try {
      await autoSaveChatService.saveCompletedChatSession(chatMessages, {
        sessionId,
        category: category || (resolved ? "general-support" : "unresolved"),
        resolved,
      });
    } catch (error) {
      // Don't throw - this is a background operation
      console.error("Auto-save failed:", error);
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
