"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat, type ChatMessage } from "@/hooks/use-chat";
import { HandbookEntry } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function ChatPage() {
  const { messages, addMessage, updateActivity } = useChat();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [feedbackRequested, setFeedbackRequested] = useState(false);

  // Main prompts data
  const mainPrompts = [
    { icon: "🔑", title: "Login / Password Reset" },
    { icon: "💻", title: "New Laptop / Hardware / Software Request" },
    { icon: "🌐", title: "VPN / Remote Access" },
    {
      icon: "📂",
      title: "Application Issues (AS400, DealerLink, IBM Notes, etc.)",
    },
    { icon: "📧", title: "Email / Outlook" },
    { icon: "🖨️", title: "Printer / Peripheral" },
    { icon: "📞", title: "Microsoft Teams / Phone" },
    { icon: "🔄", title: "Windows Updates / System Performance" },
  ];

  const PromptMenu = ({ onSelect }: { onSelect: (prompt: string) => void }) => (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <div className="text-gray-700 mb-4">
        <p className="text-lg mb-2">👋 Hi, I'm here to help.</p>
        <p className="text-sm">
          Please select the issue that best matches your problem:
        </p>
      </div>

      <div className="grid gap-3">
        {mainPrompts.map((prompt, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start text-left hover:bg-orange-50 hover:border-orange-200 transition-colors"
            onClick={() => onSelect(prompt.title)}
          >
            <span className="mr-3 text-xl">{prompt.icon}</span>
            <span>{prompt.title}</span>
          </Button>
        ))}
      </div>
    </div>
  );

  // Handle feedback response
  const handleFeedbackResponse = (isResolved: boolean) => {
    setFeedbackRequested(false);
    updateActivity(); // Update last activity timestamp

    if (isResolved) {
      addMessage({
        role: "bot",
        content: "Great! Is there anything else I can help you with?",
      });
    } else {
      addMessage({
        role: "bot",
        content:
          "I'm sorry the solution didn't help. Let me create a support ticket for you.",
      });

      // Redirect to ticket page after a short delay
      setTimeout(() => {
        router.push("/ticket");
      }, 2000);
    }
  };

  const renderSolution = (solution: HandbookEntry) => (
    <div className="bg-orange-50 rounded-lg p-3 mt-2">
      <h4 className="font-medium text-sm mb-2">{solution.title}</h4>
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
        {solution.solution.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </div>
  );

  // Render feedback prompt
  const FeedbackPrompt = () => (
    <div className="bg-gray-50 rounded-lg p-4 mt-4 border max-w-2xl mx-auto">
      <p className="text-sm mb-3">Was this solution helpful?</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => handleFeedbackResponse(true)}>
          Yes, it helped
        </Button>
        <Button
          variant="outline"
          onClick={() => handleFeedbackResponse(false)}
          className="text-orange-600 border-orange-600 hover:bg-orange-50"
        >
          No, create ticket
        </Button>
      </div>
    </div>
  );

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    updateActivity(); // Update last activity timestamp

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
    };

    addMessage(userMessage);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input.trim(),
          context: messages,
        }),
      });

      const data = await response.json();

      addMessage({
        role: "bot",
        content: data.message,
        solutions: data.solutions,
      });

      // Show feedback prompt after bot response
      setTimeout(() => {
        setFeedbackRequested(true);
      }, 3000);
    } catch (error) {
      console.error("Chat Error:", error);
      addMessage({
        role: "bot",
        content: "I'm sorry, I encountered an error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col h-screen bg-gray-50">
      <header className="sticky top-0 z-50 w-full border-b bg-orange-600">
        <div className="container mx-auto max-w-4xl px-4 flex h-14 items-center">
          <div className="flex items-center gap-2 text-white">
            <Bot className="h-6 w-6" />
            <span className="text-lg font-semibold">IT Support Assistant</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-4xl px-4 py-4 space-y-6">
          {messages.length === 1 ? (
            <PromptMenu
              onSelect={(prompt) => {
                setInput(prompt);
                handleSubmit(new Event("submit") as any);
              }}
            />
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 max-w-2xl mx-auto ${
                  msg.role === "bot" ? "justify-start" : "justify-end"
                }`}
              >
                {msg.role === "bot" && (
                  <div className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-3 max-w-[85%] ${
                    msg.role === "bot"
                      ? "bg-white shadow-sm"
                      : "bg-orange-600 text-white"
                  }`}
                >
                  {msg.content}
                  {msg.solutions?.map((solution, i) =>
                    renderSolution(solution)
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
                {msg.role === "bot" &&
                  i === messages.length - 1 &&
                  feedbackRequested && <FeedbackPrompt />}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <footer className="sticky bottom-0 border-t bg-white p-4">
        <form
          onSubmit={handleSubmit}
          className="container mx-auto max-w-4xl px-4"
        >
          <div className="flex gap-2 max-w-2xl mx-auto">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-600"
            />
            <Button
              type="submit"
              size="icon"
              className="bg-orange-600 hover:bg-orange-700"
              disabled={isLoading}
            >
              <Send className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </form>
      </footer>
    </main>
  );
}
