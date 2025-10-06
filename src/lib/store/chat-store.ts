import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ChatMessage } from "@/hooks/use-chat";

/**
 * Chat state management for IT support conversations
 * Handles message storage, session tracking, and persistence
 */
interface ChatState {
  messages: ChatMessage[];
  lastActivity: number;
  isInitialized: boolean;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  initialize: () => void;
  clearMessages: () => void;
  updateActivity: () => void;
  isSessionValid: () => boolean;
}

const SESSION_TIMEOUT = 1000 * 60 * 30; // 30 minutes session timeout

export const useChatStore = create(
  persist<ChatState>(
    (set, get) => ({
      messages: [],
      lastActivity: Date.now(),
      isInitialized: false,
      initialize: () => {
        if (!get().isInitialized) {
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
      setMessages: (messages) => set({ messages, lastActivity: Date.now() }),
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
          lastActivity: Date.now(),
        })),
      clearMessages: () => set({ messages: [], lastActivity: Date.now() }),
      updateActivity: () =>
        set((state) => ({ ...state, lastActivity: Date.now() })),
      isSessionValid: () => Date.now() - get().lastActivity < SESSION_TIMEOUT,
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
