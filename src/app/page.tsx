import { ChatBot } from "../components/Chatbot";
import { Header } from "../components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Box, MessageSquare } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <ChatBot />
    </main>
  );
}
