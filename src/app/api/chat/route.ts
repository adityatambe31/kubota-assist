import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { SUPPORT_PROMPTS } from "@/lib/prompts";
import { TicketType } from "@/lib/types";
import { searchSolutions } from "@/lib/mongodb";
import { explainSolution } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { message, context = [] } = await req.json();

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

      return NextResponse.json({
        message: explanation,
        solutions: solutions,
        suggestTicket: false,
      });
    }

    // No solutions found
    return NextResponse.json({
      message:
        "I don't find any matching solutions in our database. Please create a support ticket.",
      solutions: [],
      suggestTicket: true,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { message: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
