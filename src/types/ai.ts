// AI-related types
export interface AIResponse {
  content: string;
  solutions?: Array<{
    title: string;
    steps: string[];
    category?: string;
  }>;
  confidence?: number;
}

export interface ChatContext {
  sessionId: string;
  userId?: string;
  previousMessages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
  }>;
}

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  category: string;
}
