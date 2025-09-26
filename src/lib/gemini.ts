import { GoogleGenerativeAI } from "@google/generative-ai";
import { HandbookEntry } from "./types";
import { GEMINI_SYSTEM_PROMPT } from "./prompts";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

// Initialize the model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Use the working model (the old reliable one)
const model = genAI.getGenerativeModel({
  model: "gemini-1.0-pro", // This one actually works!
  generationConfig: {
    maxOutputTokens: 1024,
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
  },
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

export async function analyzeIssueWithGemini(
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

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    return {
      message: response,
      suggestTicket: solutions.length === 0,
      enhancedSolutions: solutions,
    };
  } catch (error: any) {
    console.error("Gemini error:", error);

    // Use fallback for any error
    return {
      message: createFallback(query, solutions),
      suggestTicket: solutions.length === 0,
      enhancedSolutions: solutions,
    };
  }
}

export async function explainSolution(
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

    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    return response;
  } catch (error: any) {
    console.error("Gemini explainSolution error:", error);

    // Always use fallback on any error
    return createFallback(query, solutions);
  }
}

export async function* streamExplanation(
  query: string,
  solutions: HandbookEntry[],
  context?: { role: string; content: string }[]
) {
  try {
    const explanation = await explainSolution(query, solutions, context);
    yield explanation;
  } catch (error) {
    console.error("Streaming error:", error);
    yield createFallback(query, solutions);
  }
}
