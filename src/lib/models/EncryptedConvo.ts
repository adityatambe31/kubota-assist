import mongoose from "mongoose";

// Interface for encrypted chat messages
export interface IEncryptedMessage {
  role: "user" | "assistant";
  encryptedContent: string; // The encrypted message content
  keyId: string; // AWS KMS Key ID used for encryption
  algorithm: string; // Encryption algorithm (AES-256-GCM or AWS-KMS)
  iv?: string; // Initialization Vector (optional for AWS KMS)
  authTag?: string; // Authentication tag for verification (optional for AWS KMS)
  originalLength: number; // Length of original message (for stats)
  timestamp: Date; // When message was sent
}

// Interface for the complete encrypted conversation
export interface IEncryptedConvo {
  sessionId: string; // Unique session identifier
  conversationTitle?: string; // Optional title (not encrypted)
  userId?: string; // User ID if available
  messages: IEncryptedMessage[]; // Array of encrypted messages

  // Encryption metadata
  encryptionInfo: {
    keyId: string; // AWS KMS Key ID
    algorithm: string; // Encryption algorithm
    region: string; // AWS region
    encryptedAt: Date; // When conversation was encrypted
  };

  // Session metadata (not encrypted)
  metadata: {
    startedAt: Date;
    lastMessageAt: Date;
    isActive: boolean;
    totalMessages: number;
    category?: string; // e.g., "login-issue", "network-problem"
    resolved?: boolean;
  };

  // Security settings
  security: {
    retentionDays: number; // How long to keep this conversation
    canDecrypt: boolean; // Whether decryption is allowed
    accessCount: number; // How many times it's been decrypted
  };
}

// Mongoose schema for individual encrypted messages
const EncryptedMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    encryptedContent: {
      type: String,
      required: true, // This is the encrypted gibberish
    },
    keyId: {
      type: String,
      required: true, // AWS KMS Key ID
    },
    algorithm: {
      type: String,
      default: "AWS-KMS",
    },
    iv: {
      type: String,
      required: false, // Optional for AWS KMS
    },
    authTag: {
      type: String,
      required: false, // Optional for AWS KMS
    },
    originalLength: {
      type: Number,
      required: true, // Original message length
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Main schema for encrypted conversations
const EncryptedConvoSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true, // Index for fast lookups
    },
    conversationTitle: {
      type: String,
      maxLength: 200,
    },
    userId: {
      type: String,
      index: true,
    },
    messages: [EncryptedMessageSchema],

    encryptionInfo: {
      keyId: { type: String, required: true },
      algorithm: { type: String, default: "AWS-KMS" },
      region: { type: String, required: true },
      encryptedAt: { type: Date, default: Date.now },
    },

    metadata: {
      startedAt: { type: Date, default: Date.now },
      lastMessageAt: { type: Date, default: Date.now },
      isActive: { type: Boolean, default: true },
      totalMessages: { type: Number, default: 0 },
      category: String,
      resolved: Boolean,
    },

    security: {
      retentionDays: { type: Number, default: 90 }, // Keep for 90 days
      canDecrypt: { type: Boolean, default: true }, // Allow decryption
      accessCount: { type: Number, default: 0 }, // Track access
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: "encrypted_convo", // Exact collection name you wanted!
  }
);

// Indexes for better performance
EncryptedConvoSchema.index({ "metadata.startedAt": -1 });
EncryptedConvoSchema.index({ "metadata.category": 1 });
EncryptedConvoSchema.index({ "encryptionInfo.keyId": 1 });

// Pre-save middleware to update metadata
EncryptedConvoSchema.pre("save", function (next) {
  if (this.metadata) {
    this.metadata.totalMessages = this.messages.length;
    if (this.messages.length > 0) {
      this.metadata.lastMessageAt = new Date();
    }
  }
  next();
});

// Instance methods
EncryptedConvoSchema.methods.addEncryptedMessage = function (
  encryptedMessage: IEncryptedMessage
) {
  this.messages.push(encryptedMessage);
  this.metadata.totalMessages = this.messages.length;
  this.metadata.lastMessageAt = new Date();
  return this.save();
};

EncryptedConvoSchema.methods.incrementAccessCount = function () {
  this.security.accessCount += 1;
  return this.save();
};

EncryptedConvoSchema.methods.canBeDecrypted = function () {
  return (
    this.security.canDecrypt &&
    this.security.retentionDays > 0 &&
    this.metadata.isActive
  );
};

// Static methods
EncryptedConvoSchema.statics.findBySessionId = function (sessionId: string) {
  return this.findOne({ sessionId });
};

EncryptedConvoSchema.statics.findRecentConversations = function (
  limit: number = 10
) {
  return this.find({})
    .select("sessionId conversationTitle metadata encryptionInfo")
    .sort({ "metadata.startedAt": -1 })
    .limit(limit);
};

EncryptedConvoSchema.statics.getEncryptionStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalConversations: { $sum: 1 },
        totalMessages: { $sum: "$metadata.totalMessages" },
        avgMessagesPerConvo: { $avg: "$metadata.totalMessages" },
        totalAccessCount: { $sum: "$security.accessCount" },
      },
    },
  ]);
};

// Export the model with cache clearing for development
if (mongoose.models.EncryptedConvo) {
  delete mongoose.models.EncryptedConvo;
}

const EncryptedConvo = mongoose.model<IEncryptedConvo>(
  "EncryptedConvo",
  EncryptedConvoSchema
);

export default EncryptedConvo;
