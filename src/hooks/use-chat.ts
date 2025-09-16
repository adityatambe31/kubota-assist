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

interface ChatState {
  messages: ChatMessage[];
  lastActivity: number;
  isInitialized: boolean;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  initialize: () => void;
  clearMessages: () => void;
  updateActivity: () => void;
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
                  "Hello! I'm your IT Support Assistant. How can I help you today?",
              },
            ],
            isInitialized: true,
            lastActivity: Date.now(),
          });
        }
      },
      clearMessages: () => set({ messages: [], isInitialized: false }),
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => storage),
    }
  )
);
