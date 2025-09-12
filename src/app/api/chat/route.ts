import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ITIssue } from "@/lib/models/ITIssue";
import { TicketType } from "@/lib/types";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { message } = await req.json();

    // Server-side mongoose query
    const solutions = await ITIssue.find(
      { $text: { $search: message } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(3)
      .lean(); // Convert to plain JavaScript objects

    if (!solutions.length) {
      return NextResponse.json({
        message:
          "I couldn't find an exact match. Would you like to create a support ticket?",
        solutions: [],
      });
    }

    return NextResponse.json({
      message: "I found some possible solutions:",
      solutions: solutions.map((solution) => ({
        ...solution,
        id: solution._id.toString(), // Convert ObjectId to string
      })),
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
