import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ITIssue } from "@/lib/models/ITIssue";
import { TicketType } from "@/lib/types";
import { SUPPORT_PROMPTS } from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { message, context = [] } = await req.json();

    // Remove the initial greeting condition since it's handled by the store
    if (context.length === 1) {
      // Find matching solutions for the selected category
      const solutions = await findSolutionsForCategory(message);

      return NextResponse.json({
        message: `Here are some solutions for ${message}:`,
        solutions,
      });
    }

    // Find matching prompt category based on message
    const matchingCategory = SUPPORT_PROMPTS.find((category) =>
      category.subPrompts.some((subPrompt) =>
        subPrompt.keywords.some((keyword) =>
          message.toLowerCase().includes(keyword.toLowerCase())
        )
      )
    );

    // Server-side mongoose query with category filter
    const query = matchingCategory
      ? {
          $and: [
            { $text: { $search: message } },
            { category: matchingCategory.title },
          ],
        }
      : { $text: { $search: message } };

    const solutions = await ITIssue.find(query, {
      score: { $meta: "textScore" },
    })
      .sort({ score: { $meta: "textScore" } })
      .limit(3)
      .lean();

    if (!solutions.length) {
      return NextResponse.json({
        message: matchingCategory
          ? `I understand you're having an issue with ${matchingCategory.title.toLowerCase()}. Would you like to create a support ticket?`
          : "I couldn't find an exact match. Would you like to create a support ticket?",
        solutions: [],
      });
    }

    return NextResponse.json({
      message: matchingCategory
        ? `I understand you're having an issue with ${matchingCategory.title.toLowerCase()}. Here are some possible solutions:`
        : "I found some possible solutions:",
      solutions: solutions.map((solution: any) => ({
        ...solution,
        id: solution._id.toString(),
      })),
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}

async function findSolutionsForCategory(category: string) {
  // Implement your logic to find solutions based on the category
  // This is a placeholder function
  return [];
}
