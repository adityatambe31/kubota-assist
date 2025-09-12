import mongoose from "mongoose";

// Define ticket types as an enum for better type safety
export enum TicketType {
  LOGIN_ISSUES = "login_issues",
  NEW_REQUEST = "new_request",
  INCIDENT = "incident",
  KDASH_ACCESS = "kdash_access",
  EXTERNAL_ACCESS = "external_access",
  VPN_REQUEST = "vpn_request",
}

// Define ticket descriptions
export const TicketDescriptions = {
  [TicketType.LOGIN_ISSUES]:
    "Password reset, account unlock, and general login assistance",
  [TicketType.NEW_REQUEST]: "Request new hardware, software, or system access",
  [TicketType.INCIDENT]: "Report technical issues or incidents",
  [TicketType.KDASH_ACCESS]: "Request access to K-dash platform",
  [TicketType.EXTERNAL_ACCESS]:
    "Access requests for external users and vendors",
  [TicketType.VPN_REQUEST]: "Geo-location based VPN access requests",
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
