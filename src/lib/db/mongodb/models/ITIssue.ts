import mongoose from "mongoose";
import { TicketType } from "../../../../types/global";

// Define ticket descriptions
export const TicketDescriptions = {
  [TicketType.LOGIN_ISSUES]:
    "Password reset, account unlock, and general login assistance",
  [TicketType.HARDWARE_SOFTWARE]:
    "Request new hardware, software, or system access",
  [TicketType.VPN_ACCESS]: "VPN and remote access assistance",
  [TicketType.APPLICATION]: "Help with AS400, DealerLink, IBM Notes, etc",
  [TicketType.EMAIL]: "Email and Outlook related issues",
  [TicketType.PRINTER]: "Printer and peripheral device support",
  [TicketType.TEAMS]: "Microsoft Teams and phone system support",
  [TicketType.SYSTEM]: "Windows updates and system performance issues",
};

const ITIssueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  solution: [
    {
      type: String,
      required: true,
    },
  ],
  keywords: [
    {
      type: String,
      index: true,
    },
  ],
  category: {
    type: String,
    required: true,
    enum: Object.values(TicketType),
    description: "Type of support ticket",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add text search index
ITIssueSchema.index({
  title: "text",
  description: "text",
  keywords: "text",
});

export const ITIssue =
  mongoose.models.ITIssue || mongoose.model("ITIssue", ITIssueSchema);
