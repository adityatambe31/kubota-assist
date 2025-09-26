import mongoose from "mongoose";

// Encrypted data structure for secure storage
interface EncryptedData {
  encrypted: string; // Base64 encoded encrypted content
  keyId: string; // KMS key ARN or ID
  algorithm: string; // Encryption algorithm used
  iv: string; // Base64 encoded initialization vector
  authTag?: string; // Base64 encoded authentication tag
  dataKeyEncrypted: string; // Base64 encoded encrypted data key
}

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
    originalIssue: string | EncryptedData;
    solutionsAttempted: Array<{
      title: string | EncryptedData;
      steps: Array<string | EncryptedData>;
    }>;
    conversationHistory: Array<{
      role: "bot" | "user";
      content: string | EncryptedData;
      timestamp: string;
      encrypted: boolean;
      solutions?: Array<{
        title: string | EncryptedData;
        steps: Array<string | EncryptedData>;
      }>;
    }>;
  };
  source: string;
  assignedTo?: string;
  tags: string[];
  // Jira integration fields
  jiraIssueKey?: string;
  jiraIssueId?: string;
  jiraUrl?: string;
  // Encryption metadata
  encryptionMetadata?: {
    enabled: boolean;
    keyId: string;
    algorithm: string;
    encryptedAt: Date;
    version: number;
  };
}

// Mongoose schema for encrypted data
const EncryptedDataSchema = new mongoose.Schema(
  {
    encrypted: { type: String, required: true },
    keyId: { type: String, required: true },
    algorithm: { type: String, required: true },
    iv: { type: String, required: true },
    authTag: { type: String },
    dataKeyEncrypted: { type: String, required: true },
  },
  { _id: false }
);

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
    originalIssue: {
      type: mongoose.Schema.Types.Mixed, // Can be String or EncryptedData
      required: false,
    },
    solutionsAttempted: [
      {
        title: { type: mongoose.Schema.Types.Mixed }, // Can be String or EncryptedData
        steps: [{ type: mongoose.Schema.Types.Mixed }], // Array of String or EncryptedData
      },
    ],
    conversationHistory: [
      {
        role: { type: String, enum: ["bot", "user"], required: true },
        content: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be String or EncryptedData
        timestamp: { type: String, required: true },
        encrypted: { type: Boolean, default: false },
        solutions: [
          {
            title: { type: mongoose.Schema.Types.Mixed },
            steps: [{ type: mongoose.Schema.Types.Mixed }],
          },
        ],
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
  // Encryption metadata
  encryptionMetadata: {
    enabled: { type: Boolean, default: false },
    keyId: { type: String },
    algorithm: { type: String },
    encryptedAt: { type: Date },
    version: { type: Number, default: 1 },
  },
});

// Indexes for better query performance
SupportTicketSchema.index({ ticketId: 1 });
SupportTicketSchema.index({ status: 1, createdAt: -1 });
SupportTicketSchema.index({ jiraIssueKey: 1 });
SupportTicketSchema.index({ "encryptionMetadata.enabled": 1 });

// Update the updatedAt field before saving
SupportTicketSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Method to check if ticket has encrypted data
SupportTicketSchema.methods.isEncrypted = function () {
  return this.encryptionMetadata?.enabled || false;
};

// Method to get encryption info
SupportTicketSchema.methods.getEncryptionInfo = function () {
  if (!this.encryptionMetadata?.enabled) {
    return null;
  }
  return {
    keyId: this.encryptionMetadata.keyId,
    algorithm: this.encryptionMetadata.algorithm,
    encryptedAt: this.encryptionMetadata.encryptedAt,
    version: this.encryptionMetadata.version,
  };
};

export const SupportTicket =
  mongoose.models.SupportTicket ||
  mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);

export default SupportTicket;
