"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function TicketPortal() {
  const [category, setCategory] = useState("");

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-orange-600">
        {/* Top Navigation Bar */}
        <div className="container mx-auto">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="/logo.jpg"
                alt="KCL Logo"
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <h1 className="text-xl font-semibold text-white">
                KCL Support Center
              </h1>
            </div>
          </div>
        </div>

        {/* Sub Header with Breadcrumb */}
        <div className="bg-orange-700/50 border-t border-orange-500/30">
          <div className="container mx-auto">
            <div className="px-4 py-3">
              <div className="flex items-center space-x-2 text-sm text-orange-100">
                <Link
                  href="/"
                  className="hover:text-white transition-colors duration-200"
                >
                  Home
                </Link>
                <ChevronRight className="h-4 w-4 text-orange-300" />
                <span className="font-medium">Create Support Ticket</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Title Section */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Create Support Ticket
          </h2>
          <p className="mt-2 text-gray-600">
            Please provide details about your issue for the IT support team
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-6">
          What can we help you with?
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Ticket Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Support Ticket</CardTitle>
              <CardDescription>
                Please provide details about your issue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select issue category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="login">
                        Login Issue / Password Reset
                      </SelectItem>
                      <SelectItem value="hardware">
                        New Hardware/Software Request
                      </SelectItem>
                      <SelectItem value="vpn">
                        VPN/Remote Access Issues
                      </SelectItem>
                      <SelectItem value="application">
                        Application Issues
                      </SelectItem>
                      <SelectItem value="email">
                        Email/Outlook Problems
                      </SelectItem>
                      <SelectItem value="printer">
                        Printer/Peripheral Issues
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input placeholder="Brief description of the issue" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Please provide detailed information about your issue"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  Submit Ticket
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-medium">Common Requests</h3>
            <div className="grid gap-3">
              <Button
                variant="outline"
                className="justify-start text-left h-auto py-3"
              >
                <div>
                  <div className="font-medium">
                    Login Issue / Password Reset
                  </div>
                  <div className="text-sm text-gray-500">
                    Having trouble logging into websites or systems
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start text-left h-auto py-3"
              >
                <div>
                  <div className="font-medium">
                    Request New Hardware/Software
                  </div>
                  <div className="text-sm text-gray-500">
                    For example DL/AS400 Access, monitor, Visio, Power BI etc.
                  </div>
                </div>
              </Button>
              <Button
                variant="outline"
                className="justify-start text-left h-auto py-3"
              >
                <div>
                  <div className="font-medium">Report an Incident</div>
                  <div className="text-sm text-gray-500">
                    Let us know if something isn't working properly
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
