import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SupportTicket } from "@/lib/models/SupportTicket";
import { jiraService } from "@/lib/jira";

export async function POST(req: NextRequest) {
  try {
    const { category, subject, description, priority, ticketData } =
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

    // Create ticket object
    const ticketData_obj = {
      ticketId,
      category,
      subject,
      description,
      priority,
      status: "open" as const,
      // Include chat context if available
      chatContext: ticketData
        ? {
            originalIssue: ticketData.originalIssue,
            solutionsAttempted: ticketData.solutionsAttempted,
            conversationHistory: ticketData.conversationHistory,
          }
        : undefined,
      // Additional metadata
      source: "chatbot-integration",
      tags: [],
    };

    // Insert ticket into database using Mongoose
    const ticket = new SupportTicket(ticketData_obj);
    const savedTicket = await ticket.save();

    if (savedTicket) {
      // Log successful ticket creation
      console.log(`✅ MongoDB ticket created: ${ticketId}`);

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

    await connectDB();

    if (ticketId) {
      // Get specific ticket
      const ticket = await SupportTicket.findOne({ ticketId }).lean();
      if (!ticket) {
        return NextResponse.json(
          { error: "Ticket not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ ticket });
    } else {
      // Get all tickets (limit for security)
      const tickets = await SupportTicket.find({})
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      return NextResponse.json({ tickets });
    }
  } catch (error) {
    console.error("Error retrieving tickets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
