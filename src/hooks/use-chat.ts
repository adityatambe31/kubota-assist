import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";

export type ChatMessage = {
  role: "bot" | "user";
  content: string;
  solutions?: Array<{
    title: string;
    solution: string[];
    category?: string;
  }>;
};

export type TicketData = {
  originalIssue: string;
  solutionsAttempted: Array<{
    title: string;
    steps: string[];
  }>;
  category?: string;
  conversationHistory: ChatMessage[];
};

interface ChatState {
  messages: ChatMessage[];
  lastActivity: number;
  isInitialized: boolean;
  ticketData: TicketData | null;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  initialize: () => void;
  clearMessages: () => void;
  updateActivity: () => void;
  generateTicketData: () => TicketData | null;
  clearTicketData: () => void;
}

// Custom storage implementation
const storage: StateStorage = {
  getItem: (name): string | null => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(name);
  },
  setItem: (name, value): void => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(name, value);
    }
  },
  removeItem: (name): void => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(name);
    }
  },
};

export const useChat = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      lastActivity: Date.now(),
      isInitialized: false,
      ticketData: null,
      setMessages: (messages) => set({ messages }),
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
          lastActivity: Date.now(),
        })),
      updateActivity: () =>
        set((state) => ({
          ...state,
          lastActivity: Date.now(),
        })),
      initialize: () => {
        const state = get();
        if (!state.isInitialized) {
          set({
            messages: [
              {
                role: "bot",
                content:
                  "👋 Hi, I'm here to help. Please select the issue that best matches your problem:",
              },
            ],
            isInitialized: true,
            lastActivity: Date.now(),
          });
        }
      },
      clearMessages: () =>
        set({ messages: [], isInitialized: false, ticketData: null }),
      generateTicketData: () => {
        const state = get();
        const userMessages = state.messages.filter(
          (msg) => msg.role === "user"
        );
        const botMessagesWithSolutions = state.messages.filter(
          (msg) => msg.role === "bot" && msg.solutions
        );

        if (userMessages.length === 0) return null;

        const originalIssue = userMessages[0]?.content || "";
        const solutionsAttempted = botMessagesWithSolutions.flatMap(
          (msg) =>
            msg.solutions?.map((solution) => ({
              title: solution.title,
              steps: solution.solution,
            })) || []
        );

        const ticketData: TicketData = {
          originalIssue,
          solutionsAttempted,
          conversationHistory: state.messages,
          category: botMessagesWithSolutions[0]?.solutions?.[0]?.category,
        };

        set({ ticketData });
        return ticketData;
      },
      clearTicketData: () => set({ ticketData: null }),
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => storage),
    }
  )
);
