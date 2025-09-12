import { ChatBot } from "../components/Chatbot";
import { Header } from "../components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Box,
  Ticket,
  MessageSquare,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-orange-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">
            Kubota IT Asset Management Portal
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl">
            Streamline your IT operations with our comprehensive asset
            management, reporting, and support system.
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Asset Management Card */}
          <Card className="flex flex-col p-6 hover:shadow-lg transition-all duration-200 border-orange-100 hover:border-orange-200">
            <div className="flex-1">
              <div className="relative h-12 w-12 mb-6">
                <Box className="h-12 w-12 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold mb-3">Asset Management</h2>
              <p className="text-gray-600 mb-6 min-h-[4rem]">
                Track and manage IT assets across your organization with our
                intuitive management system.
              </p>
            </div>
            <Button className="w-full group" variant="outline">
              Manage Assets
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>

          {/* Inventory Reports Card */}
          <Card className="flex flex-col p-6 hover:shadow-lg transition-all duration-200 border-orange-100 hover:border-orange-200">
            <div className="flex-1">
              <div className="relative h-12 w-12 mb-6">
                <BarChart3 className="h-12 w-12 text-orange-600" />
              </div>
              <h2 className="text-xl font-semibold mb-3">Inventory Reports</h2>
              <p className="text-gray-600 mb-6 min-h-[4rem]">
                Generate detailed reports on inventory status, asset allocation,
                and usage patterns.
              </p>
            </div>
            <Button className="w-full group" variant="outline">
              View Reports
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>

          {/* AI Support Card */}
          <Card className="flex flex-col p-6 hover:shadow-lg transition-all duration-200 border-orange-100 hover:border-orange-200">
            <div className="flex-1">
              <div className="relative h-12 w-12 mb-6">
                <Box className="absolute h-12 w-12 text-orange-600" />
                <div className="absolute bottom-0 right-0 bg-orange-600 rounded-full p-1">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-3">
                AI Support Assistant
              </h2>
              <p className="text-gray-600 mb-6 min-h-[4rem]">
                Get instant answers to common IT queries through our AI chatbot.
                Seamlessly escalates complex issues to our support team.
              </p>
            </div>
            <Button className="w-full group" variant="outline">
              Chat Now
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>
        </div>
      </div>

      <ChatBot />
    </main>
  );
}
