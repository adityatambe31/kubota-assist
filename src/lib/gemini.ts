import { GoogleGenerativeAI } from "@google/generative-ai";
import { HandbookEntry } from "./types";
import { GEMINI_SYSTEM_PROMPT, SOLUTION_TEMPLATE } from "./prompts";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

// Initialize the model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// For text-only input, use the latest Gemini model
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // or "gemini-1.5-pro"
  generationConfig: {
    maxOutputTokens: 2048,
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
  },
});

export async function analyzeIssueWithGemini(
  query: string,
  solutions: HandbookEntry[],
  context: { role: string; content: string }[] = []
) {
  try {
    // Format solutions for the AI
    const formattedSolutions = solutions.map(
      (s, i) => `SOLUTION ${i + 1}:
Title: ${s.title}
Category: ${s.category || "General"}
Steps:
${s.solution.map((step, j) => `${j + 1}. ${step}`).join("\n")}`
    );

    // Format chat history
    const formattedHistory = context
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n");

    // Construct prompt using template
    const prompt = `${GEMINI_SYSTEM_PROMPT}

USER QUERY:
${query}
${formattedHistory ? `\nCONVERSATION HISTORY:\n${formattedHistory}` : ""}
${
  formattedSolutions.length > 0
    ? `\nDATABASE SOLUTIONS:\n${formattedSolutions.join("\n\n")}`
    : "\nNO_SOLUTIONS_FOUND"
}

TASK:
1. Review the user's query carefully
2. Check if any database solutions match the issue
3. If matches found: Explain how to apply the solution(s) step by step
4. If no matches: Recommend creating a support ticket

Provide your response:`;

    // Initialize chat with system context
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: GEMINI_SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [
            {
              text: "I understand. I will only use and explain solutions from the database.",
            },
          ],
        },
      ],
    });

    // Get AI response
    const result = await chat.sendMessage([{ text: prompt }]);
    const response = await result.response.text();

    return {
      message: response,
      suggestTicket: solutions.length === 0,
      enhancedSolutions: solutions,
    };
  } catch (error) {
    console.error("Error in Gemini analysis:", error);
    throw error;
  }
}

export async function explainSolution(
  query: string,
  solutions: HandbookEntry[],
  context?: { role: string; content: string }[]
) {
  try {
    // Format solutions for the AI
    const formattedSolutions = solutions.map(
      (s, i) => `SOLUTION ${i + 1}:
Title: ${s.title}
Category: ${s.category || "General"}
Steps:
${s.solution.map((step, j) => `${j + 1}. ${step}`).join("\n")}`
    );

    // Construct prompt using template
    const prompt = `${GEMINI_SYSTEM_PROMPT}

USER QUERY:
${query}

DATABASE SOLUTIONS:
${formattedSolutions.join("\n\n")}

TASK:
1. Analyze the user's issue
2. Format your response using the exact structure specified in the system prompt
3. Include all relevant information from the database solutions
4. Ensure proper markdown formatting with headers, lists, and emphasis

Remember to follow the exact response format with proper sections and formatting.
Provide your response:`;

    // Initialize chat with system context
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: GEMINI_SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [
            {
              text: "I understand. I will only explain solutions from the database.",
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });

    // Get AI response
    const result = await chat.sendMessage([{ text: prompt }]);
    return result.response.text();
  } catch (error) {
    console.error("Error explaining solution:", error);
    throw error;
  }
}

export async function* streamExplanation(
  query: string,
  solutions: HandbookEntry[],
  context?: { role: string; content: string }[]
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

USER QUERY:
${query}
${
  formattedSolutions.length > 0
    ? `\nDATABASE SOLUTIONS:\n${formattedSolutions.join("\n\n")}`
    : "\nNO_SOLUTIONS_FOUND"
}

TASK:
1. Review the user's query carefully
2. Explain how to implement these solutions step by step
3. If no solutions are available, recommend creating a support ticket

Provide your response:`;

    // Initialize chat
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: GEMINI_SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [
            {
              text: "I understand. I will only explain solutions from the database.",
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 8000,
      },
    });

    const result = await chat.sendMessage([{ text: prompt }]);
    const response = await result.response;
    yield response.text();
  } catch (error) {
    console.error("Error in streaming explanation:", error);
    throw error;
  }
}
