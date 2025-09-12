import { useState, useEffect } from "react";

export type ChatMessage = {
  role: "bot" | "user";
  content: string;
  solutions?: any[];
};

export function useChat(isFullPage: boolean = false) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Load messages when component mounts
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([
        {
          role: "bot",
          content:
            "Hello! I'm your IT support assistant. How can I help you today?",
        },
      ]);
    }
  }, []);

  // Save messages whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  return {
    messages,
    setMessages,
  };
}
