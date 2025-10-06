import { connectDB } from "@/lib/db/mongodb/connection";
import { SupportTicket } from "@/lib/db/mongodb/models/SupportTicket";
import { jiraService } from "@/lib/db/jira/client";
import chatEncryptionService from "@/lib/security/awsEncryption";
import { DatabaseError, EncryptionError } from "@/lib/api/handleError";
import { ChatMessage } from "@/hooks/use-chat";

export interface TicketCreationOptions {
  category: string;
  subject: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  conversationHistory?: ChatMessage[];
}

export interface TicketCreationResult {
  ticketId: string;
  status: string;
  jiraIssueKey?: string;
  encryptionEnabled: boolean;
}

export interface TicketListOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

/**
 * Ticket service handling all ticket-related business logic
 */
class TicketService {
  /**
   * Generates a unique ticket ID
   */
  generateTicketId(): string {
    return `TICKET-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;
  }

  /**
   * Creates a new support ticket with optional conversation history
   */
  async createTicket(
    options: TicketCreationOptions
  ): Promise<TicketCreationResult> {
    try {
      await connectDB();
    } catch (error) {
      throw new DatabaseError("Failed to connect to database", error);
    }

    const ticketId = this.generateTicketId();
    let chatContext: any = null;
    let encryptionMetadata: any = null;

    // Process conversation history if provided
    if (options.conversationHistory && options.conversationHistory.length > 0) {
      const contextResult = await this.processConversationHistory(
        options.conversationHistory
      );
      chatContext = contextResult.chatContext;
      encryptionMetadata = contextResult.encryptionMetadata;
    }

    try {
      // Create ticket in MongoDB
      const ticket = new SupportTicket({
        ticketId,
        category: options.category,
        subject: options.subject,
        description: options.description,
        priority: options.priority,
        status: "Open",
        chatContext,
        encryptionInfo: encryptionMetadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await ticket.save();

      // Create Jira ticket if enabled
      let jiraIssueKey: string | undefined;
      try {
        const jiraResult = await jiraService.createIssue({
          summary: options.subject,
          description: this.formatJiraDescription(options),
          priority: options.priority === "Critical" ? "High" : options.priority,
          issueType: "Task",
        });

        if (jiraResult.success && jiraResult.issueKey) {
          jiraIssueKey = jiraResult.issueKey;
          // Update MongoDB ticket with Jira key
          await SupportTicket.findOneAndUpdate({ ticketId }, { jiraIssueKey });
        }
      } catch (jiraError) {
        console.warn("Jira ticket creation failed:", jiraError);
        // Continue without Jira - ticket is still valid in MongoDB
      }

      return {
        ticketId,
        status: "Open",
        jiraIssueKey,
        encryptionEnabled: !!encryptionMetadata,
      };
    } catch (error) {
      throw new DatabaseError("Failed to create ticket", error);
    }
  }

  /**
   * Retrieves paginated list of tickets
   */
  async getTickets(options: TicketListOptions = {}): Promise<{
    tickets: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      await connectDB();
    } catch (error) {
      throw new DatabaseError("Failed to connect to database", error);
    }

    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
    } = options;

    const skip = (page - 1) * limit;
    const sortOptions: any = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Build search query
    let searchQuery: any = {};
    if (search) {
      searchQuery = {
        $or: [
          { ticketId: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
        ],
      };
    }

    try {
      const [tickets, total] = await Promise.all([
        SupportTicket.find(searchQuery)
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        SupportTicket.countDocuments(searchQuery),
      ]);

      // Decrypt ticket data if encryption is enabled
      const decryptedTickets = await this.decryptTicketsData(tickets);

      return {
        tickets: decryptedTickets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new DatabaseError("Failed to retrieve tickets", error);
    }
  }

  /**
   * Processes conversation history for encryption
   */
  private async processConversationHistory(
    conversationHistory: ChatMessage[]
  ): Promise<{
    chatContext: any;
    encryptionMetadata: any;
  }> {
    const userMessages = conversationHistory.filter(
      (msg) => msg.role === "user"
    );
    const botMessagesWithSolutions = conversationHistory.filter(
      (msg) => msg.role === "bot" && msg.solutions
    );

    const originalIssue = userMessages[0]?.content || "";
    const solutionsAttempted = botMessagesWithSolutions.flatMap(
      (msg) =>
        msg.solutions?.map((solution) => ({
          title: solution.title,
          steps: solution.solution || [],
        })) || []
    );

    if (chatEncryptionService.isEncryptionEnabled()) {
      try {
        // Encrypt conversation data
        const encryptedMessages =
          await chatEncryptionService.encryptConversation(conversationHistory);
        const encryptedOriginalIssue = await chatEncryptionService.encryptText(
          originalIssue
        );

        const encryptedSolutions = [];
        for (const solution of solutionsAttempted) {
          const encryptedSolution = {
            title: await chatEncryptionService.encryptText(solution.title),
            steps: [] as any[],
          };

          for (const step of solution.steps) {
            encryptedSolution.steps.push(
              await chatEncryptionService.encryptText(step)
            );
          }

          encryptedSolutions.push(encryptedSolution);
        }

        return {
          chatContext: {
            originalIssue: encryptedOriginalIssue,
            solutionsAttempted: encryptedSolutions,
            conversationHistory: encryptedMessages,
          },
          encryptionMetadata: {
            enabled: true,
            keyId: process.env.AWS_KMS_KEY_ID || "",
            algorithm: "AWS-KMS",
            encryptedAt: new Date(),
            version: 2,
          },
        };
      } catch (error) {
        throw new EncryptionError(
          "Failed to encrypt conversation history",
          error
        );
      }
    }

    // Return unencrypted data if encryption is disabled
    return {
      chatContext: {
        originalIssue,
        solutionsAttempted,
        conversationHistory,
      },
      encryptionMetadata: {
        enabled: false,
        version: 1,
      },
    };
  }

  /**
   * Formats ticket description for Jira
   */
  private formatJiraDescription(options: TicketCreationOptions): string {
    let description = `Category: ${options.category}\n\n`;
    description += `Description:\n${options.description}\n\n`;

    if (options.conversationHistory && options.conversationHistory.length > 0) {
      description += "Previous Support Interaction:\n";
      description +=
        "User attempted self-service but required additional assistance.\n";
    }

    description += `\nPriority: ${options.priority}`;

    return description;
  }

  /**
   * Decrypts ticket data if encryption was used
   */
  private async decryptTicketsData(tickets: any[]): Promise<any[]> {
    const decryptedTickets = [];

    for (const ticket of tickets) {
      let decryptedTicket = { ...ticket };

      if (ticket.encryptionInfo?.enabled && ticket.chatContext) {
        try {
          // Only decrypt for display - keep sensitive data minimal
          if (ticket.chatContext.originalIssue) {
            const decryptedIssue = await chatEncryptionService.decryptText(
              ticket.chatContext.originalIssue
            );
            decryptedTicket.originalIssue =
              decryptedIssue.substring(0, 100) + "...";
          }
        } catch (decryptionError) {
          console.warn("Failed to decrypt ticket data:", decryptionError);
          decryptedTicket.originalIssue = "[Encrypted - Unable to decrypt]";
        }
      }

      decryptedTickets.push(decryptedTicket);
    }

    return decryptedTickets;
  }
}

// Export singleton instance
export const ticketService = new TicketService();
