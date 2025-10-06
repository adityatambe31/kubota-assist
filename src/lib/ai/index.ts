// Unified AI interface for handling IT support queries
import { HandbookEntry } from "@/types/global";
import { explainSolutionWithGemini } from "./gemini";
import { explainSolutionWithOpenAI } from "./openai";

// Export all AI providers
export * from "./gemini";
export * from "./openai";
export * from "./prompts";

/**
 * Primary AI function - uses Gemini as default, falls back to OpenAI
 * Provides explanations for IT support solutions
 */
export async function explainSolution(
  query: string,
  solutions: HandbookEntry[],
  context?: { role: string; content: string }[]
): Promise<string> {
  // Try Gemini first (primary AI provider)
  try {
    return await explainSolutionWithGemini(query, solutions, context);
  } catch (geminiError) {
    console.warn("Gemini failed, trying OpenAI fallback:", geminiError);

    // Fallback to OpenAI
    try {
      return await explainSolutionWithOpenAI(query, solutions, context);
    } catch (openaiError) {
      console.error("Both AI providers failed:", { geminiError, openaiError });

      // Final fallback - simple formatted response
      return createSimpleFallback(query, solutions);
    }
  }
}

/**
 * Simple fallback when both AI providers fail
 */
function createSimpleFallback(
  query: string,
  solutions: HandbookEntry[]
): string {
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
