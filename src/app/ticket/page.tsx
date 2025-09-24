"use client";
import { useState, useEffect } from "react";
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
import { ChevronRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { type TicketData } from "@/hooks/use-chat";

export default function TicketPortal() {
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    ticketId?: string;
    jiraIssueKey?: string;
    jiraUrl?: string;
    message?: string;
  }>({});

  // Load ticket data from chat if available
  useEffect(() => {
    const savedTicketData = sessionStorage.getItem("pendingTicketData");
    if (savedTicketData) {
      try {
        const data: TicketData = JSON.parse(savedTicketData);
        setTicketData(data);

        // Auto-fill form fields
        setSubject(data.originalIssue.substring(0, 100)); // Truncate long subjects

        // Map category from chatbot solutions or original issue
        const categoryMap: Record<string, string> = {
          "Login / Password Reset": "login",
          "New Laptop / Hardware / Software Request": "hardware",
          "New Hardware / Software Request": "hardware",
          "VPN / Remote Access": "vpn",
          "Application Issues (AS400, DealerLink, IBM Notes, etc.)":
            "application",
          "Email / Outlook": "email",
          "Printer / Peripheral": "printer",
          "Microsoft Teams / Phone": "teams",
          "Windows Updates / System Performance": "performance",
        };

        // Try to map category from solutions first, then from original issue
        let mappedCategory = "application"; // default

        // Check if we have a category from the chatbot solutions
        if (data.category) {
          mappedCategory = data.category.toLowerCase();
        } else {
          // Try to match the original issue text to a category
          const issueText = data.originalIssue.toLowerCase();

          if (issueText.includes("login") || issueText.includes("password")) {
            mappedCategory = "login";
          } else if (
            issueText.includes("hardware") ||
            issueText.includes("laptop") ||
            issueText.includes("software")
          ) {
            mappedCategory = "hardware";
          } else if (
            issueText.includes("vpn") ||
            issueText.includes("remote")
          ) {
            mappedCategory = "vpn";
          } else if (
            issueText.includes("email") ||
            issueText.includes("outlook")
          ) {
            mappedCategory = "email";
          } else if (issueText.includes("print")) {
            mappedCategory = "printer";
          } else if (
            issueText.includes("teams") ||
            issueText.includes("phone")
          ) {
            mappedCategory = "teams";
          } else if (
            issueText.includes("update") ||
            issueText.includes("performance") ||
            issueText.includes("slow")
          ) {
            mappedCategory = "performance";
          } else {
            // Check against the exact prompts from chatbot
            for (const [prompt, category] of Object.entries(categoryMap)) {
              if (data.originalIssue === prompt) {
                mappedCategory = category;
                break;
              }
            }
          }
        }

        setCategory(mappedCategory);

        // Build description with original issue and attempted solutions
        let autoDescription = `Original Issue: ${data.originalIssue}\n\n`;

        if (data.solutionsAttempted.length > 0) {
          autoDescription += "Solutions Already Attempted:\n";
          data.solutionsAttempted.forEach((solution, index) => {
            autoDescription += `\n${index + 1}. ${solution.title}:\n`;
            solution.steps.forEach((step, stepIndex) => {
              autoDescription += `   ${stepIndex + 1}. ${step}\n`;
            });
          });
          autoDescription +=
            "\nDespite following these steps, the issue persists. Please provide additional assistance.\n";
        }

        setDescription(autoDescription);
        setPriority("medium"); // Default priority

        // Clear the session storage
        sessionStorage.removeItem("pendingTicketData");
      } catch (error) {
        console.error("Error parsing ticket data:", error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category,
          subject,
          description,
          priority,
          ticketData,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSubmissionResult(result);
        setIsSubmitted(true);
      } else {
        throw new Error("Failed to submit ticket");
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
      alert("There was an error submitting your ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {isSubmitted ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Ticket Submitted Successfully!
              </h2>
              <p className="text-gray-600 mb-4">
                Your support ticket has been created and sent to our IT team.
                Someone will contact you soon to help resolve your issue.
              </p>

              {/* Show ticket details */}
              <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-green-800 mb-2">
                  📋 Ticket Details
                </h3>
                {submissionResult.ticketId && (
                  <p className="text-sm text-green-700 mb-1">
                    <strong>Internal Ticket:</strong>{" "}
                    {submissionResult.ticketId}
                  </p>
                )}
                {submissionResult.jiraIssueKey && (
                  <div className="text-sm text-green-700">
                    <p className="mb-1">
                      <strong>Jira Ticket:</strong>{" "}
                      {submissionResult.jiraIssueKey} 🎯
                    </p>
                    {submissionResult.jiraUrl && (
                      <a
                        href={submissionResult.jiraUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        View in Jira →
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => (window.location.href = "/")}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Return to Home
                </Button>
                <div className="text-sm text-gray-500">
                  You can also continue using our chatbot for other questions.
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
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
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select
                        value={category}
                        onValueChange={setCategory}
                        required
                      >
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
                          <SelectItem value="teams">
                            Microsoft Teams / Phone
                          </SelectItem>
                          <SelectItem value="performance">
                            Windows Updates / System Performance
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <Input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief description of the issue"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Please provide detailed information about your issue"
                        rows={8}
                        required
                      />
                      {ticketData && (
                        <p className="text-xs text-gray-500">
                          ✨ Auto-filled with your chat conversation and
                          attempted solutions
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Select
                        value={priority}
                        onValueChange={setPriority}
                        required
                      >
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
                      disabled={isSubmitting}
                      className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Ticket"}
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
                        For example DL/AS400 Access, monitor, Visio, Power BI
                        etc.
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
          </>
        )}
      </div>
    </main>
  );
}
