import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb/connection";
import { searchSolutions } from "@/lib/db/mongodb/queries";
import { SUPPORT_PROMPTS } from "@/lib/ai/prompts";
import { TicketType } from "@/types/global";
import { explainSolution } from "@/lib/ai";
import autoSaveChatService from "@/lib/store/autoSaveChatService";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { message, context = [], sessionId } = await req.json();

    // Generate session ID if not provided
    const currentSessionId =
      sessionId ||
      `chat_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Initial category selection
    if (context.length === 0) {
      const selectedCategory = SUPPORT_PROMPTS.find(
        (cat) => cat.title === message
      );

      if (selectedCategory) {
        return NextResponse.json({
          message: "Please select your specific issue:",
          solutions: selectedCategory.subPrompts.map((subPrompt) => ({
            solution: [subPrompt.text],
            category: selectedCategory.title,
          })),
          suggestTicket: false,
        });
      }
    }

    // Find matching category
    const matchingCategory = SUPPORT_PROMPTS.find((category) =>
      category.subPrompts.some((subPrompt) =>
        subPrompt.keywords.some((keyword) =>
          message.toLowerCase().includes(keyword.toLowerCase())
        )
      )
    );

    // Determine category
    let category: TicketType | undefined = Object.values(TicketType).find(
      (type) => type === matchingCategory?.title
    );

    // Try getting category from context
    if (!category && context.length > 0) {
      const lastMessage = context[context.length - 1].content;
      category = Object.values(TicketType).find(
        (type) =>
          type ===
          SUPPORT_PROMPTS.find((cat) => cat.title === lastMessage)?.title
      );
    }

    // Search for solutions in database
    const solutions = await searchSolutions(message, category);

    if (solutions.length > 0) {
      // Get AI explanation for the solutions
      const explanation = await explainSolution(message, solutions, context);

      // Prepare chat messages for encryption
      const chatMessages = [
        ...context, // Previous messages in the conversation
        { role: "user", content: message }, // Current user message
        { role: "bot", content: explanation }, // Bot response
      ];

      // Auto-save the conversation in encrypted format
      try {
        await autoSaveChatService.saveCompletedChatSession(chatMessages, {
          sessionId: currentSessionId,
          category: category || "general-support",
          resolved: true, // Mark as resolved since we provided solutions
        });
      } catch (saveError) {
        console.error("Failed to save encrypted conversation:", saveError);
        // Don't fail the main response if saving fails
      }

      return NextResponse.json({
        message: explanation,
        solutions: solutions,
        suggestTicket: false,
        sessionId: currentSessionId, // Return session ID to frontend
      });
    }

    // No solutions found
    const noSolutionMessage =
      "I don't find any matching solutions in our database. Please create a support ticket.";

    // Prepare chat messages for encryption
    const chatMessages = [
      ...context, // Previous messages
      { role: "user", content: message }, // User message
      { role: "bot", content: noSolutionMessage }, // Bot response
    ];

    // Auto-save unresolved conversation
    try {
      await autoSaveChatService.saveCompletedChatSession(chatMessages, {
        sessionId: currentSessionId,
        category: category || "unresolved",
        resolved: false, // Mark as unresolved
      });
    } catch (saveError) {
      console.error("Failed to save unresolved conversation:", saveError);
    }

    return NextResponse.json({
      message: noSolutionMessage,
      solutions: [],
      suggestTicket: true,
      sessionId: currentSessionId,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
