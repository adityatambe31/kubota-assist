import { MongoClient } from "mongodb";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const modelConfig = {
  model: "gemini-1.0-pro",
  config: {
    temperature: 0.7,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  },
};

interface HandbookEntry {
  _id: string;
  section: string;
  title: string;
  content: string;
  language: string;
}

export async function searchHandbook(query: string, context?: string) {
  const client = await MongoClient.connect(process.env.MONGODB_URI as string);
  const db = client.db("kubota_it_support");

  try {
    // First, use Gemini to understand the query and extract key concepts
    const analysisPrompt = `Analyze this IT support query and extract key concepts and potential handbook sections to search:
Query: "${query}"
Context: "${context || ""}"
Provide your analysis in JSON format with these fields:
- keywords: array of relevant search terms
- concepts: array of high-level concepts
- possibleSections: array of potential handbook sections`;

    const analysis = await ai.models.generateContentStream({
      ...modelConfig,
      contents: [
        {
          role: "user",
          parts: [{ text: analysisPrompt }],
        },
      ],
    });

    let analysisResponse = "";
    for await (const chunk of analysis) {
      analysisResponse += chunk.text ?? "";
    }

    // Parse the JSON response
    const searchTerms = JSON.parse(analysisResponse);

    // Perform a semantic search using the analyzed terms
    const entries = (await db
      .collection("handbook")
      .aggregate([
        {
          $search: {
            compound: {
              should: [
                {
                  text: {
                    query: searchTerms.keywords.join(" "),
                    path: "content",
                    fuzzy: {},
                  },
                },
                {
                  text: {
                    query: searchTerms.concepts.join(" "),
                    path: "section",
                    fuzzy: {},
                  },
                },
              ],
            },
          },
        },
        { $limit: 5 },
      ])
      .toArray()) as HandbookEntry[];

    if (entries.length === 0) {
      return {
        relevantContent: null,
        suggestTicket: true,
        message:
          "No relevant handbook entries found. Consider creating a support ticket.",
      };
    }

    // Use Gemini to synthesize the findings
    const synthesisPrompt = `Based on the user's query: "${query}"
and these handbook entries:

${entries
  .map(
    (entry) => `Section: ${entry.section}
Title: ${entry.title}
Content: ${entry.content}
---`
  )
  .join("\n")}

Provide a helpful response that:
1. Synthesizes the relevant information
2. Explains it in a clear, step-by-step manner
3. Suggests when to create a ticket if needed
4. Includes relevant section references`;

    const synthesis = await ai.models.generateContentStream({
      ...modelConfig,
      contents: [
        {
          role: "user",
          parts: [{ text: synthesisPrompt }],
        },
      ],
    });

    let synthesisResponse = "";
    for await (const chunk of synthesis) {
      synthesisResponse += chunk.text ?? "";
    }

    return {
      relevantContent: entries,
      synthesizedResponse: synthesisResponse,
      suggestTicket: synthesisResponse.toLowerCase().includes("ticket"),
      references: entries.map((e) => ({ section: e.section, title: e.title })),
    };
  } finally {
    await client.close();
  }
}

export async function getRelatedContent(section: string) {
  const client = await MongoClient.connect(process.env.MONGODB_URI as string);
  const db = client.db("kubota_it_support");

  try {
    return await db
      .collection("handbook")
      .find({ section: { $regex: new RegExp(section, "i") } })
      .toArray();
  } finally {
    await client.close();
  }
}
