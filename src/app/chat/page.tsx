"use client";

import { useChat } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, Bot, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ChatMessage } from "@/lib/types";

export default function Chat() {
  const { messages, setMessages } = useChat(true);
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input.trim() }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: data.message,
          solutions: data.solutions,
        },
      ]);
    } catch (error) {
      console.error("Chat Error:", error);
    }
  };

  // Render the same solutions component as Chatbot
  const renderSolutions = (solutions: any[]) => (
    <div className="space-y-2 mt-2">
      {solutions.map((solution, index) => (
        <div key={index} className="bg-orange-50 rounded-lg p-3">
          <div className="font-medium mb-1">Solution {index + 1}</div>
          <ol className="list-decimal list-inside space-y-1">
            {solution.solution.map((step: string, i: number) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white px-4 py-3">
        <div className="mx-auto max-w-4xl flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:bg-slate-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-semibold">IT Support Assistant</h1>
        </div>
      </header>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="mx-auto max-w-4xl space-y-5">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${
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
                    ? "bg-gray-100 text-black"
                    : "bg-orange-600 text-white"
                }`}
              >
                {msg.content}
                {msg.solutions && renderSolutions(msg.solutions)}
              </div>
              {msg.role === "user" && (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
