"use client";
import { useEffect, useState, useRef } from "react"; // Add useRef import
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Send, X, Maximize2, Bot, User, ArrowRight } from "lucide-react";
import Image from "next/image";
import { HandbookEntry } from "@/lib/types";
import { useChat, type ChatMessage } from "@/hooks/use-chat";
import { TicketType } from "@/lib/models/ITIssue";

const GREETING_MESSAGE =
  "Hello! I'm your IT Support Assistant. How can I help you today?";

interface TicketSuggestion {
  suggestTicket: boolean;
  ticketType?: TicketType;
  ticketDescription?: string;
}

interface SolutionFeedback {
  showFeedback: boolean;
  solutionId?: string;
  category?: TicketType;
}

export function ChatBot() {
  const { messages, addMessage, initialize, updateActivity } = useChat();
  const [input, setInput] = useState("");
  const [showTooltip, setShowTooltip] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize chat on first render
  useEffect(() => {
    initialize();
  }, [initialize]);

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

  // Add ref for messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Add input ref
  const inputRef = useRef<HTMLInputElement>(null);

  // Add scroll to bottom effect
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen) {
      const showTimer = setInterval(() => {
        setShowTooltip(true);
        setTimeout(() => {
          setShowTooltip(false);
        }, 3000);
      }, 6000);

      return () => clearInterval(showTimer);
    } else {
      setShowTooltip(false);
    }
  }, [isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
    };

    addMessage(userMessage);
    updateActivity();
    setInput("");
    setIsLoading(true);

    // Prepare context including the new user message
    const updatedContext = [...messages, userMessage];

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input.trim(),
          context: updatedContext,
        }),
      });

      const data = await response.json();
      addMessage({
        role: "bot",
        content: data.message,
        solutions: data.solutions,
      });
      updateActivity();
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

  // Render solutions in message bubbles
  const renderSolutions = (solutions: HandbookEntry[]) => (
    <div className="space-y-2 mt-2">
      {solutions.map((solution, index) => (
        <div key={index} className="bg-orange-50 rounded-lg p-3">
          <div className="font-medium mb-1">Solution {index + 1}</div>
          <ol className="list-decimal list-inside space-y-1">
            {solution.solution.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );

  const renderTicketSuggestion = (suggestion: TicketSuggestion) => {
    if (!suggestion.suggestTicket) return null;

    return (
      <div className="mt-2 space-y-2">
        <p className="text-sm text-gray-600">
          Would you like to create a support ticket?
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.open("/chat", "_blank")}
        >
          Create VPN Support Ticket
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderSolution = (solution: any) => (
    <div className="bg-orange-50 rounded-lg p-3 mt-2">
      <h4 className="font-medium text-sm mb-2">{solution.title}</h4>
      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
        {solution.solution.map((step: string, i: number) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </div>
  );

  const handleFeedback = (messageIndex: number, isHelpful: boolean) => {
    if (isHelpful) {
      addMessage({
        role: "bot",
        content: "Great! Is there anything else I can help you with?",
      });
    } else {
      addMessage({
        role: "bot",
        content:
          "I'm sorry the solution didn't help. Would you like to create a support ticket?",
      });
    }
    updateActivity();
  };

  const renderFeedback = (feedback: SolutionFeedback, messageIndex: number) => {
    if (!feedback.showFeedback) return null;

    return (
      <div className="mt-4 space-y-3">
        <p className="text-sm text-gray-600 font-medium">
          Did this solution help resolve your issue?
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-20"
            onClick={() => handleFeedback(messageIndex, true)}
          >
            Yes
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-20"
            onClick={() => handleFeedback(messageIndex, false)}
          >
            No
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      <AnimatePresence mode="wait">
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 80,
                damping: 12,
              },
            }}
            exit={{
              opacity: 0,
              x: 10,
              scale: 0.95,
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            className="bg-white text-black px-4 py-2 rounded-full shadow-md border border-orange-200 
                     flex items-center gap-2 cursor-pointer hover:bg-gray-50/80 transition-all"
            onClick={() => setShowTooltip(false)}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Your IT Helpdesk, just a click away
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-20 h-20 p-0 overflow-hidden cursor-pointer transition-shadow duration-200 hover:shadow-lg"
            >
              <Image
                src="/bot.png"
                alt="Chat Bot"
                width={72}
                height={72}
                className="w-20 h-20 object-contain transition-transform duration-200"
                priority
              />
            </Button>
          </motion.div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[90vw] md:w-[450px] p-0 mb-4 border-2 rounded-xl overflow-hidden shadow-lg"
          side="top"
          align="end"
          sideOffset={12}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
              },
            }}
            className="flex flex-col h-[85vh] md:h-[500px]" // Made taller
          >
            <div className="p-4 border-b bg-orange-600 flex justify-between items-center">
              <h3 className="font-semibold text-white flex items-center gap-2">
                IT Support Assistant
              </h3>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-white hover:bg-orange-500/20"
                  asChild
                >
                  <Link href="/chat">
                    <Maximize2 className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-white hover:bg-orange-500/20"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages section with icons */}
            <div className="flex-1 p-4 overflow-y-auto space-y-5">
              {messages.length === 1 ? (
                <div className="space-y-5">
                  {/* Bot's initial greeting with profile pic */}
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <div className="rounded-lg px-4 py-3 max-w-[85%] bg-gray-100">
                      <p className="text-lg mb-2">👋 Hi, I'm here to help.</p>
                      <p className="text-sm text-gray-600">
                        Please select the issue that best matches your problem:
                      </p>
                    </div>
                  </div>

                  {/* Prompt buttons */}
                  <div className="ml-11 space-y-2">
                    {mainPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start text-left hover:bg-orange-50 hover:border-orange-200 transition-colors"
                        onClick={async () => {
                          setInput(prompt.title);
                          await handleSubmit(new Event("submit") as any);
                          updateActivity();
                        }}
                      >
                        <span className="mr-3 text-xl">{prompt.icon}</span>
                        <span>{prompt.title}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 ${
                      msg.role === "bot"
                        ? "justify-start"
                        : "justify-end flex-row-reverse"
                    }`}
                  >
                    {msg.role === "bot" ? (
                      <div className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                    )}
                    <div
                      className={`rounded-lg px-4 py-3 max-w-[85%] ${
                        msg.role === "bot"
                          ? "bg-gray-100 text-black"
                          : "bg-orange-600 text-white"
                      }`}
                    >
                      {msg.content}
                      {msg.solutions?.map((solution, i) =>
                        renderSolution(solution)
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} /> {/* Add scroll anchor */}
            </div>

            <form onSubmit={handleSubmit} className="p-4 border-t">
              <div className="flex gap-2">
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
                  <Send
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </form>
          </motion.div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
