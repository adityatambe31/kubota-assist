import OpenAI from "openai";
import { HandbookEntry } from "../../types/global";
import { GEMINI_SYSTEM_PROMPT } from "./prompts";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Simple fallback when AI fails
function createFallback(query: string, solutions: HandbookEntry[]): string {
  if (solutions.length === 0) {
    return `I understand you're having issues with: "${query}"\n\nPlease create a support ticket for assistance.`;
  }

  let response = `## Solutions for: ${query}\n\n`;
  solutions.forEach((solution, index) => {
    response += `### ${solution.title}\n`;
    response += `**Category:** ${solution.category || "General"}\n\n`;
    response += `**Steps:**\n`;
    solution.solution.forEach((step, stepIndex) => {
      response += `${stepIndex + 1}. ${step}\n`;
    });
    response += "\n";
  });

  return response;
}

export async function analyzeIssueWithOpenAI(
  query: string,
  solutions: HandbookEntry[],
  context: { role: string; content: string }[] = []
) {
  try {
    // Format solutions
    const formattedSolutions = solutions.map(
      (s, i) => `SOLUTION ${i + 1}:
Title: ${s.title}
Category: ${s.category || "General"}
Steps:
${s.solution.map((step, j) => `${j + 1}. ${step}`).join("\n")}`
    );

    const prompt = `${GEMINI_SYSTEM_PROMPT}

USER QUERY: ${query}

${
  formattedSolutions.length > 0
    ? `DATABASE SOLUTIONS:\n${formattedSolutions.join("\n\n")}`
    : "NO_SOLUTIONS_FOUND"
}

Please provide a helpful response.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: GEMINI_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `USER QUERY: ${query}

${
  formattedSolutions.length > 0
    ? `DATABASE SOLUTIONS:\n${formattedSolutions.join("\n\n")}`
    : "NO_SOLUTIONS_FOUND"
}

Please provide a helpful response.`,
        },
      ],
      max_tokens: 1024,
      temperature: 0.7,
      top_p: 0.8,
    });

    const response = completion.choices[0]?.message?.content || "";

    return {
      message: response,
      suggestTicket: solutions.length === 0,
      enhancedSolutions: solutions,
    };
  } catch (error: any) {
    console.error("OpenAI error:", error);

    // Use fallback for any error
    return {
      message: createFallback(query, solutions),
      suggestTicket: solutions.length === 0,
      enhancedSolutions: solutions,
    };
  }
}

export async function explainSolutionWithOpenAI(
  query: string,
  solutions: HandbookEntry[],
  context?: { role: string; content: string }[]
) {
  try {
    // Early fallback if no solutions
    if (!solutions || solutions.length === 0) {
      return createFallback(query, solutions);
    }

    const formattedSolutions = solutions.map(
      (s, i) => `SOLUTION ${i + 1}:
Title: ${s.title}
Steps: ${s.solution.join(", ")}`
    );

    const prompt = `Explain these solutions for: ${query}

${formattedSolutions.join("\n\n")}

Please provide clear, step-by-step instructions.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1024,
      temperature: 0.7,
      top_p: 0.8,
    });

    return (
      completion.choices[0]?.message?.content ||
      createFallback(query, solutions)
    );
  } catch (error: any) {
    console.error("OpenAI explainSolution error:", error);

    // Always use fallback on any error
    return createFallback(query, solutions);
  }
}

export async function* streamExplanationWithOpenAI(
  query: string,
  solutions: HandbookEntry[],
  context?: { role: string; content: string }[]
) {
  try {
    const explanation = await explainSolutionWithOpenAI(
      query,
      solutions,
      context
    );
    yield explanation;
  } catch (error) {
    console.error("Streaming error:", error);
    yield createFallback(query, solutions);
  }
}
