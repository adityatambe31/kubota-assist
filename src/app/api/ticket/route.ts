import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SupportTicket } from "@/lib/models/SupportTicket";
import { jiraService } from "@/lib/jira";
import chatEncryptionService from "@/lib/services/ChatEncryptionService";

export async function POST(req: NextRequest) {
  try {
    const { category, subject, description, priority, conversationHistory } =
      await req.json();

    // Validate required fields
    if (!category || !subject || !description || !priority) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Generate unique ticket ID
    const ticketId = `TICKET-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()}`;

    // Prepare chat context with encryption
    let chatContext;
    let encryptionMetadata;

    if (conversationHistory && conversationHistory.length > 0) {
      try {
        console.log("🔐 Encrypting conversation history...");

        // Extract solutions and original issue
        const userMessages = conversationHistory.filter(
          (msg: any) => msg.role === "user"
        );
        const botMessagesWithSolutions = conversationHistory.filter(
          (msg: any) => msg.role === "bot" && msg.solutions
        );

        const originalIssue = userMessages[0]?.content || "";
        const solutionsAttempted = botMessagesWithSolutions.flatMap(
          (msg: any) =>
            msg.solutions?.map((solution: any) => ({
              title: solution.title,
              steps: solution.solution || solution.steps || [],
            })) || []
        );

        // Use the chat encryption service for full conversation encryption
        if (chatEncryptionService.isEncryptionEnabled()) {
          // Encrypt the entire conversation using the chat encryption service
          const encryptedMessages =
            await chatEncryptionService.encryptConversation(
              conversationHistory
            );

          // Encrypt original issue and solutions separately
          const encryptedOriginalIssue =
            await chatEncryptionService.encryptText(originalIssue);

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

          chatContext = {
            originalIssue: encryptedOriginalIssue,
            solutionsAttempted: encryptedSolutions,
            conversationHistory: encryptedMessages,
          };

          encryptionMetadata = {
            enabled: true,
            keyId: process.env.AWS_KMS_KEY_ID || "",
            algorithm: "AWS-KMS",
            encryptedAt: new Date(),
            version: 2, // Updated version for new encryption system
          };
        } else {
          // Store unencrypted if encryption is disabled
          chatContext = {
            originalIssue: originalIssue,
            solutionsAttempted: solutionsAttempted,
            conversationHistory: conversationHistory,
          };

          encryptionMetadata = {
            enabled: false,
          };
        }

        console.log(
          `✅ Conversation history processed ${
            encryptionMetadata.enabled ? "(encrypted)" : "(plaintext)"
          }`
        );
      } catch (encryptionError) {
        console.error(
          "❌ Encryption failed, saving unencrypted:",
          encryptionError
        );

        // Fallback: save unencrypted if encryption fails
        const userMessages = conversationHistory.filter(
          (msg: any) => msg.role === "user"
        );
        const botMessagesWithSolutions = conversationHistory.filter(
          (msg: any) => msg.role === "bot" && msg.solutions
        );

        chatContext = {
          originalIssue: userMessages[0]?.content || "",
          solutionsAttempted: botMessagesWithSolutions.flatMap(
            (msg: any) =>
              msg.solutions?.map((solution: any) => ({
                title: solution.title,
                steps: solution.solution || solution.steps || [],
              })) || []
          ),
          conversationHistory: conversationHistory,
        };

        encryptionMetadata = {
          enabled: false,
          error:
            encryptionError instanceof Error
              ? encryptionError.message
              : "Encryption failed",
        };
      }
    }

    // Create ticket object
    const ticketData_obj = {
      ticketId,
      category,
      subject,
      description,
      priority,
      status: "open" as const,
      chatContext,
      encryptionMetadata,
      // Additional metadata
      source: "chatbot-integration",
      tags: chatEncryptionService.isEncryptionEnabled() ? ["encrypted"] : [],
    };

    // Insert ticket into database using Mongoose
    const ticket = new SupportTicket(ticketData_obj);
    const savedTicket = await ticket.save();

    if (savedTicket) {
      // Log successful ticket creation
      console.log(
        `✅ MongoDB ticket created: ${ticketId}${
          encryptionMetadata?.enabled ? " (encrypted)" : ""
        }`
      );

      // 🎯 CREATE JIRA TICKET - This is the magic!
      let jiraResult = null;
      try {
        console.log("🎫 Creating Jira ticket...");
        jiraResult = await jiraService.createTicketFromSupportData({
          category,
          subject,
          description,
          priority,
          ticketId,
        });

        if (jiraResult.success) {
          console.log(`🎉 Jira ticket created: ${jiraResult.issueKey}`);

          // Update MongoDB ticket with Jira info
          await SupportTicket.findByIdAndUpdate(savedTicket._id, {
            jiraIssueKey: jiraResult.issueKey,
            jiraIssueId: jiraResult.issueId,
            jiraUrl: jiraResult.url,
          });
        } else {
          console.error("❌ Jira ticket creation failed:", jiraResult.error);
        }
      } catch (jiraError) {
        console.error("❌ Jira integration error:", jiraError);
        // Don't fail the whole request if Jira fails
      }

      return NextResponse.json(
        {
          success: true,
          ticketId: ticketId,
          jiraIssueKey: jiraResult?.issueKey,
          jiraUrl: jiraResult?.url,
          encrypted: encryptionMetadata?.enabled || false,
          message: jiraResult?.success
            ? `Support ticket created successfully! Jira ticket: ${jiraResult.issueKey}. Our IT team will contact you soon!`
            : "Support ticket created successfully. Our IT team will contact you soon!",
        },
        { status: 201 }
      );
    } else {
      throw new Error("Failed to create ticket");
    }
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          "Failed to create support ticket. Please try again or contact IT directly.",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve tickets (for admin interface if needed)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId");
    const decrypt = searchParams.get("decrypt") === "true";

    await connectDB();

    if (ticketId) {
      // Get specific ticket
      const ticket: any = await SupportTicket.findOne({ ticketId }).lean();
      if (!ticket) {
        return NextResponse.json(
          { error: "Ticket not found" },
          { status: 404 }
        );
      }

      // Decrypt if requested and ticket is encrypted
      let processedTicket = ticket;
      if (decrypt && ticket.encryptionMetadata?.enabled && ticket.chatContext) {
        try {
          console.log("🔓 Decrypting ticket data...");

          const decryptedChatContext = { ...ticket.chatContext };

          // Decrypt original issue
          if (typeof decryptedChatContext.originalIssue === "string") {
            // New system: encrypted as base64 string
            decryptedChatContext.originalIssue =
              await chatEncryptionService.decryptText(
                decryptedChatContext.originalIssue
              );
          } else if (typeof decryptedChatContext.originalIssue === "object") {
            // Old system: encrypted as object
            decryptedChatContext.originalIssue =
              await chatEncryptionService.decryptText(
                decryptedChatContext.originalIssue.encrypted ||
                  decryptedChatContext.originalIssue
              );
          }

          // Decrypt solutions
          if (decryptedChatContext.solutionsAttempted) {
            const decryptedSolutions = [];
            for (const solution of decryptedChatContext.solutionsAttempted) {
              const decryptedSolution = {
                title: "",
                steps: [] as string[],
              };

              // Decrypt title (handle both string and object formats)
              if (typeof solution.title === "string") {
                // New system: base64 string
                decryptedSolution.title =
                  await chatEncryptionService.decryptText(solution.title);
              } else if (typeof solution.title === "object") {
                // Old system: object with encrypted property
                decryptedSolution.title =
                  await chatEncryptionService.decryptText(
                    solution.title.encrypted || solution.title
                  );
              } else {
                decryptedSolution.title = solution.title;
              }

              // Decrypt steps (handle both string and object formats)
              for (const step of solution.steps) {
                if (typeof step === "string") {
                  // New system: base64 string
                  decryptedSolution.steps.push(
                    await chatEncryptionService.decryptText(step)
                  );
                } else if (typeof step === "object") {
                  // Old system: object with encrypted property
                  decryptedSolution.steps.push(
                    await chatEncryptionService.decryptText(
                      step.encrypted || step
                    )
                  );
                } else {
                  decryptedSolution.steps.push(step);
                }
              }

              decryptedSolutions.push(decryptedSolution);
            }
            decryptedChatContext.solutionsAttempted = decryptedSolutions;
          }

          // Decrypt conversation history
          if (decryptedChatContext.conversationHistory) {
            decryptedChatContext.conversationHistory =
              await chatEncryptionService.decryptConversation(
                decryptedChatContext.conversationHistory
              );
          }

          processedTicket = {
            ...ticket,
            chatContext: decryptedChatContext,
            decrypted: true,
          };

          console.log("✅ Ticket data decrypted successfully");
        } catch (decryptionError) {
          console.error("❌ Decryption failed:", decryptionError);
          processedTicket = {
            ...ticket,
            decryptionError: "Failed to decrypt ticket data",
          };
        }
      }

      return NextResponse.json({ ticket: processedTicket });
    } else {
      // Get all tickets (limit for security) - return encrypted by default
      const tickets = await SupportTicket.find({})
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      // Add encryption status to ticket list
      const ticketsWithStatus = tickets.map((ticket: any) => ({
        ...ticket,
        isEncrypted: ticket.encryptionMetadata?.enabled || false,
      }));

      return NextResponse.json({ tickets: ticketsWithStatus });
    }
  } catch (error) {
    console.error("Error retrieving tickets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
