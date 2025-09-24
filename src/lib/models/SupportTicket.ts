import mongoose from "mongoose";

export interface ISupportTicket {
  ticketId: string;
  category: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in-progress" | "resolved" | "closed";
  createdAt: Date;
  updatedAt: Date;
  chatContext?: {
    originalIssue: string;
    solutionsAttempted: Array<{
      title: string;
      steps: string[];
    }>;
    conversationHistory: Array<{
      role: "bot" | "user";
      content: string;
      solutions?: any[];
    }>;
  };
  source: string;
  assignedTo?: string;
  tags: string[];
  // Jira integration fields
  jiraIssueKey?: string;
  jiraIssueId?: string;
  jiraUrl?: string;
}

const SupportTicketSchema = new mongoose.Schema<ISupportTicket>({
  ticketId: {
    type: String,
    required: true,
    unique: true,
  },
  category: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "in-progress", "resolved", "closed"],
    default: "open",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  chatContext: {
    originalIssue: String,
    solutionsAttempted: [
      {
        title: String,
        steps: [String],
      },
    ],
    conversationHistory: [
      {
        role: { type: String, enum: ["bot", "user"] },
        content: String,
        solutions: [mongoose.Schema.Types.Mixed],
      },
    ],
  },
  source: {
    type: String,
    default: "manual",
  },
  assignedTo: String,
  tags: [String],
  // Jira integration fields
  jiraIssueKey: String,
  jiraIssueId: String,
  jiraUrl: String,
});

// Update the updatedAt field before saving
SupportTicketSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export const SupportTicket =
  mongoose.models.SupportTicket ||
  mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);
