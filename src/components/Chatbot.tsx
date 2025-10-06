"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Send, X, Maximize2, Bot, User } from "lucide-react";
import Image from "next/image";
import { useChat, type ChatMessage } from "@/hooks/use-chat";
import { type HandbookEntry } from "@/types/global";
import { MAIN_SUPPORT_CATEGORIES } from "@/utils/supportCategories";
import { useRouter } from "next/navigation";

export function ChatBot() {
  const { messages, addMessage, updateActivity, generateTicketData } =
    useChat();
  const [input, setInput] = useState("");
  const [showTooltip, setShowTooltip] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Initialize chat on first render
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        role: "bot",
        content:
          "👋 Hi, I'm here to help. Please select the issue that best matches your problem:",
      });
    }
  }, [messages.length, addMessage]);

  // Main prompts data
  const mainPrompts = MAIN_SUPPORT_CATEGORIES;

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleCreateTicket = () => {
    const ticketData = generateTicketData();
    if (ticketData) {
      // Store ticket data in sessionStorage for the ticket page
      sessionStorage.setItem("pendingTicketData", JSON.stringify(ticketData));
      router.push("/ticket");
      setIsOpen(false);
    }
  };

  const renderSolution = (
    solution: HandbookEntry,
    isLastMessage: boolean = false
  ) => (
    <div className="space-y-3">
      <div className="bg-orange-50 rounded-lg p-3">
        <h4 className="font-medium text-sm mb-2">{solution.title}</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          {solution.solution.map((step: string, i: number) => (
            <li key={`${solution.title}-step-${i}`}>{step}</li>
          ))}
        </ol>
      </div>

      {isLastMessage && (
        <div className="bg-white border border-orange-200 rounded-lg p-3">
          <p className="text-sm text-gray-600 mb-3">
            Did these steps solve your issue? If not, you can create a support
            ticket and we'll help you further.
          </p>
          <Button
            onClick={handleCreateTicket}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            Create Support Ticket
          </Button>
        </div>
      )}
    </div>
  );

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
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
              transition: { type: "spring", stiffness: 100, damping: 15 },
            }}
            className="flex flex-col h-[85vh] md:h-[500px]"
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

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-5">
              {messages.length <= 1 ? (
                <div className="space-y-5">
                  {messages.map((msg, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-orange-600 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="rounded-lg px-4 py-3 max-w-[85%] bg-gray-100">
                        <p>{msg.content}</p>
                      </div>
                    </div>
                  ))}

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
                      {/* ✅ Only show text if no solutions */}
                      {(!msg.solutions || msg.solutions.length === 0) && (
                        <div className="whitespace-pre-line">
                          {msg.content
                            .replace(/###[^#]+###/g, "")
                            .replace(/\*\*([^*]+)\*\*/g, "$1")
                            .replace(/\*([^*]+)\*/g, "$1")
                            .replace(/- /g, "• ")
                            .trim()}
                        </div>
                      )}

                      {/* ✅ Show orange cards if solutions exist */}
                      {msg.solutions?.map((solution, solutionIndex) => {
                        const isLastBotMessage =
                          i === messages.length - 1 && msg.role === "bot";
                        const isLastSolution =
                          solutionIndex === (msg.solutions?.length || 0) - 1;
                        const shouldShowTicketButton =
                          isLastBotMessage && isLastSolution;

                        return (
                          <div key={`${solutionIndex}-${solution.title}`}>
                            {renderSolution(solution, shouldShowTicketButton)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
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
