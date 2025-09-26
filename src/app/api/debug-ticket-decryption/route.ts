import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SupportTicket } from "@/lib/models/SupportTicket";
import chatEncryptionService from "@/lib/services/ChatEncryptionService";

export async function POST(request: NextRequest) {
  try {
    const { ticketId } = await request.json();

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId required" }, { status: 400 });
    }

    await connectDB();

    // Get the ticket
    const ticket: any = await SupportTicket.findOne({ ticketId }).lean();
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (!ticket.encryptionMetadata?.enabled) {
      return NextResponse.json({
        success: false,
        message: "Ticket is not encrypted",
      });
    }

    const debugInfo = {
      ticketId,
      encryptionMetadata: ticket.encryptionMetadata,
      chatContext: {
        hasOriginalIssue: !!ticket.chatContext?.originalIssue,
        originalIssueType: typeof ticket.chatContext?.originalIssue,
        originalIssuePreview:
          typeof ticket.chatContext?.originalIssue === "string"
            ? ticket.chatContext.originalIssue.substring(0, 50) + "..."
            : ticket.chatContext?.originalIssue,
        solutionsCount: ticket.chatContext?.solutionsAttempted?.length || 0,
        conversationCount: ticket.chatContext?.conversationHistory?.length || 0,
      },
    };

    // Try to decrypt originalIssue step by step
    const decryptionTests = [];

    if (ticket.chatContext?.originalIssue) {
      try {
        console.log("🔍 Testing originalIssue decryption...");
        console.log("Original data:", ticket.chatContext.originalIssue);

        const decrypted = await chatEncryptionService.decryptText(
          ticket.chatContext.originalIssue
        );

        decryptionTests.push({
          field: "originalIssue",
          success: true,
          original: ticket.chatContext.originalIssue.substring(0, 50) + "...",
          decrypted: decrypted,
        });
      } catch (error) {
        decryptionTests.push({
          field: "originalIssue",
          success: false,
          original: ticket.chatContext.originalIssue.substring(0, 50) + "...",
          error: error instanceof Error ? error.message : "Unknown error",
          errorDetails: error,
        });
      }
    }

    // Try to decrypt a solution title
    if (ticket.chatContext?.solutionsAttempted?.[0]?.title) {
      try {
        console.log("🔍 Testing solution title decryption...");
        const solutionTitle = ticket.chatContext.solutionsAttempted[0].title;
        console.log("Solution title data:", solutionTitle);

        const decrypted = await chatEncryptionService.decryptText(
          solutionTitle
        );

        decryptionTests.push({
          field: "solutionTitle",
          success: true,
          original: solutionTitle.substring(0, 50) + "...",
          decrypted: decrypted,
        });
      } catch (error) {
        decryptionTests.push({
          field: "solutionTitle",
          success: false,
          original:
            ticket.chatContext.solutionsAttempted[0].title.substring(0, 50) +
            "...",
          error: error instanceof Error ? error.message : "Unknown error",
          errorDetails: error,
        });
      }
    }

    // Try to decrypt conversation content
    if (
      ticket.chatContext?.conversationHistory?.[0]?.content?.encryptedContent
    ) {
      try {
        console.log("🔍 Testing conversation decryption...");
        const conversationItem = ticket.chatContext.conversationHistory[0];
        console.log(
          "Full conversation item:",
          JSON.stringify(conversationItem, null, 2)
        );
        console.log(
          "Content structure:",
          JSON.stringify(conversationItem.content, null, 2)
        );

        const decrypted = await chatEncryptionService.decryptMessage(
          conversationItem.content
        );

        decryptionTests.push({
          field: "conversationContent",
          success: true,
          original:
            conversationItem.content.encryptedContent.substring(0, 50) + "...",
          decrypted: decrypted,
        });
      } catch (error) {
        console.error("Conversation decryption error details:", error);
        decryptionTests.push({
          field: "conversationContent",
          success: false,
          original:
            ticket.chatContext.conversationHistory[0].content.encryptedContent.substring(
              0,
              50
            ) + "...",
          error: error instanceof Error ? error.message : "Unknown error",
          errorDetails: {
            contentStructure: ticket.chatContext.conversationHistory[0].content,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      debugInfo,
      decryptionTests,
      message: "Debug information collected",
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Debug failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
