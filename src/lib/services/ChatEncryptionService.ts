import EncryptedConvo, {
  IEncryptedMessage,
  IEncryptedConvo,
} from "@/lib/models/EncryptedConvo";
import { connectDB } from "@/lib/mongodb";
import crypto from "crypto";
import { KMSClient, EncryptCommand, DecryptCommand } from "@aws-sdk/client-kms";

/**
 * AWS KMS-based Chat Encryption Service
 * Encrypts messages using AWS KMS for secure chat storage
 */
class ChatEncryptionService {
  private kmsClient: KMSClient;
  private keyId: string;
  private region: string;

  constructor() {
    // Initialize AWS KMS configuration
    this.keyId = process.env.AWS_KMS_KEY_ID!;
    this.region = process.env.AWS_REGION || "ca-central-1";

    if (!this.keyId) {
      throw new Error("AWS_KMS_KEY_ID environment variable is required");
    }

    // Initialize KMS client
    this.kmsClient = new KMSClient({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    console.log(
      `🔐 AWS KMS Chat Encryption Service initialized with key: ${this.keyId.substring(
        0,
        8
      )}...`
    );
  }

  /**
   * Encrypt a single message using AWS KMS
   * @param message - The plain text message to encrypt
   * @returns Promise<IEncryptedMessage> - Encrypted message data
   */
  async encryptMessage(
    message: string,
    role: "user" | "assistant"
  ): Promise<IEncryptedMessage> {
    try {
      // Use AWS KMS to encrypt the message
      const encryptCommand = new EncryptCommand({
        KeyId: this.keyId,
        Plaintext: Buffer.from(message, "utf-8"),
      });

      const result = await this.kmsClient.send(encryptCommand);

      if (!result.CiphertextBlob) {
        throw new Error("KMS encryption failed - no ciphertext returned");
      }

      // Convert encrypted data to base64 for storage
      const encryptedContent = Buffer.from(result.CiphertextBlob).toString(
        "base64"
      );

      // Return encrypted message structure
      const encryptedMessage: IEncryptedMessage = {
        role,
        encryptedContent,
        keyId: this.keyId,
        algorithm: "AWS-KMS",
        iv: "", // KMS handles IV internally
        authTag: "", // KMS handles authentication internally
        originalLength: message.length,
        timestamp: new Date(),
      };

      console.log(
        `✅ Message encrypted with AWS KMS: "${message.substring(
          0,
          30
        )}..." -> ${encryptedContent.substring(0, 20)}...`
      );
      return encryptedMessage;
    } catch (error) {
      console.error("❌ AWS KMS Encryption failed:", error);
      throw new Error(
        `Failed to encrypt message: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Decrypt a single message using AWS KMS
   * @param encryptedMessage - The encrypted message data
   * @returns Promise<string> - Decrypted plain text message
   */
  async decryptMessage(encryptedMessage: IEncryptedMessage): Promise<string> {
    try {
      // Convert base64 back to buffer for KMS
      const ciphertextBlob = Buffer.from(
        encryptedMessage.encryptedContent,
        "base64"
      );

      // Use AWS KMS to decrypt the message
      const decryptCommand = new DecryptCommand({
        CiphertextBlob: ciphertextBlob,
        KeyId: this.keyId, // Optional but good practice
      });

      const result = await this.kmsClient.send(decryptCommand);

      if (!result.Plaintext) {
        throw new Error("KMS decryption failed - no plaintext returned");
      }

      // Convert decrypted data back to string
      const decrypted = Buffer.from(result.Plaintext).toString("utf-8");

      console.log(
        `🔓 Message decrypted with AWS KMS: ${encryptedMessage.encryptedContent.substring(
          0,
          20
        )}... -> "${decrypted.substring(0, 30)}..."`
      );
      return decrypted;
    } catch (error) {
      console.error("❌ AWS KMS Decryption failed:", error);
      throw new Error(
        `Failed to decrypt message: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Store a new chat conversation in encrypted format
   * @param sessionId - Unique session identifier
   * @param messages - Array of plain text messages
   * @param options - Additional options
   * @returns Promise<IEncryptedConvo> - Saved encrypted conversation
   */
  async storeEncryptedConversation(
    sessionId: string,
    messages: Array<{
      role: "user" | "assistant";
      content: string;
      timestamp?: Date;
    }>,
    options?: {
      conversationTitle?: string;
      userId?: string;
      category?: string;
    }
  ): Promise<IEncryptedConvo> {
    try {
      await connectDB();

      // Encrypt all messages
      const encryptedMessages: IEncryptedMessage[] = [];

      for (const msg of messages) {
        const encrypted = await this.encryptMessage(msg.content, msg.role);
        if (msg.timestamp) {
          encrypted.timestamp = msg.timestamp;
        }
        encryptedMessages.push(encrypted);
      }

      // Create the encrypted conversation document
      const encryptedConvo = new EncryptedConvo({
        sessionId,
        conversationTitle:
          options?.conversationTitle ||
          `Chat Session ${new Date().toLocaleDateString()}`,
        userId: options?.userId,
        messages: encryptedMessages,
        encryptionInfo: {
          keyId: this.keyId,
          algorithm: "AWS-KMS",
          region: this.region,
          encryptedAt: new Date(),
        },
        metadata: {
          startedAt: new Date(),
          lastMessageAt: new Date(),
          isActive: true,
          totalMessages: encryptedMessages.length,
          category: options?.category,
        },
        security: {
          retentionDays: 90,
          canDecrypt: true,
          accessCount: 0,
        },
      });

      // Save to MongoDB
      const saved = await encryptedConvo.save();
      console.log(
        `💾 Encrypted conversation saved: ${sessionId} with ${encryptedMessages.length} messages`
      );

      return saved;
    } catch (error) {
      console.error("❌ Failed to store encrypted conversation:", error);
      throw new Error(
        `Storage failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Retrieve and decrypt a conversation (only when needed!)
   * @param sessionId - Session identifier
   * @param decrypt - Whether to decrypt the messages (default: false for security)
   * @returns Promise<object> - Conversation data
   */
  async retrieveConversation(sessionId: string, decrypt: boolean = false) {
    try {
      await connectDB();

      // Find the encrypted conversation
      const encryptedConvo = await EncryptedConvo.findOne({ sessionId });

      if (!encryptedConvo) {
        throw new Error(`Conversation not found: ${sessionId}`);
      }

      // Increment access count
      await (encryptedConvo as any).incrementAccessCount();

      if (!decrypt) {
        // Return without decrypting (for security/performance)
        return {
          sessionId: encryptedConvo.sessionId,
          conversationTitle: encryptedConvo.conversationTitle,
          metadata: encryptedConvo.metadata,
          encryptionInfo: encryptedConvo.encryptionInfo,
          security: encryptedConvo.security,
          messages: encryptedConvo.messages.map((msg: any) => ({
            role: msg.role,
            encryptedContent: msg.encryptedContent.substring(0, 50) + "...", // Show partial encrypted data
            originalLength: msg.originalLength,
            timestamp: msg.timestamp,
            isEncrypted: true,
          })),
          note: "Messages are encrypted. Use decrypt=true to view actual content.",
        };
      }

      // Decrypt messages (only when specifically requested)
      const decryptedMessages = [];
      for (const msg of encryptedConvo.messages) {
        const decryptedContent = await this.decryptMessage(msg);
        decryptedMessages.push({
          role: msg.role,
          content: decryptedContent,
          timestamp: msg.timestamp,
        });
      }

      console.log(`🔓 Conversation decrypted: ${sessionId}`);

      return {
        sessionId: encryptedConvo.sessionId,
        conversationTitle: encryptedConvo.conversationTitle,
        metadata: encryptedConvo.metadata,
        encryptionInfo: encryptedConvo.encryptionInfo,
        security: encryptedConvo.security,
        messages: decryptedMessages,
        note: "Messages have been decrypted for authorized access.",
      };
    } catch (error) {
      console.error("❌ Failed to retrieve conversation:", error);
      throw new Error(
        `Retrieval failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Add a new message to existing conversation
   * @param sessionId - Session identifier
   * @param message - Plain text message
   * @param role - Message role
   * @returns Promise<IEncryptedConvo> - Updated conversation
   */
  async addMessageToConversation(
    sessionId: string,
    message: string,
    role: "user" | "assistant"
  ): Promise<IEncryptedConvo> {
    try {
      await connectDB();

      // Find existing conversation
      const conversation = await EncryptedConvo.findOne({ sessionId });

      if (!conversation) {
        throw new Error(`Conversation not found: ${sessionId}`);
      }

      // Encrypt the new message
      const encryptedMessage = await this.encryptMessage(message, role);

      // Add to conversation
      await (conversation as any).addEncryptedMessage(encryptedMessage);

      console.log(`➕ Message added to conversation: ${sessionId}`);
      return conversation;
    } catch (error) {
      console.error("❌ Failed to add message:", error);
      throw new Error(
        `Add message failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get list of conversations (metadata only, no decryption)
   * @param limit - Number of conversations to return
   * @returns Promise<Array> - List of conversation metadata
   */
  async listConversations(limit: number = 10) {
    try {
      await connectDB();

      const conversations = await EncryptedConvo.find({})
        .select("sessionId conversationTitle metadata encryptionInfo security")
        .sort({ "metadata.startedAt": -1 })
        .limit(limit);

      return conversations.map((conv: any) => ({
        sessionId: conv.sessionId,
        conversationTitle: conv.conversationTitle,
        totalMessages: conv.metadata?.totalMessages || 0,
        startedAt: conv.metadata?.startedAt,
        lastMessageAt: conv.metadata?.lastMessageAt,
        category: conv.metadata?.category,
        isActive: conv.metadata?.isActive,
        encryptionKeyId:
          conv.encryptionInfo?.keyId?.substring(0, 8) + "..." || "unknown",
        accessCount: conv.security?.accessCount || 0,
      }));
    } catch (error) {
      console.error("❌ Failed to list conversations:", error);
      throw new Error(
        `List failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Encrypt individual text using AWS KMS (for ticket fields)
   * @param plaintext - Text to encrypt
   * @returns Promise<string> - Encrypted text as base64
   */
  async encryptText(plaintext: string): Promise<string> {
    try {
      const command = new EncryptCommand({
        KeyId: this.keyId,
        Plaintext: Buffer.from(plaintext, "utf-8"),
      });

      const response = await this.kmsClient.send(command);

      if (!response.CiphertextBlob) {
        throw new Error("No ciphertext returned from KMS");
      }

      return Buffer.from(response.CiphertextBlob).toString("base64");
    } catch (error) {
      console.error("❌ Text encryption failed:", error);
      throw new Error(
        `Text encryption failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Decrypt individual text using AWS KMS (for ticket fields)
   * @param encryptedText - Base64 encrypted text
   * @returns Promise<string> - Decrypted text
   */
  async decryptText(encryptedText: string): Promise<string> {
    try {
      const command = new DecryptCommand({
        CiphertextBlob: Buffer.from(encryptedText, "base64"),
      });

      const response = await this.kmsClient.send(command);

      if (!response.Plaintext) {
        throw new Error("No plaintext returned from KMS");
      }

      return Buffer.from(response.Plaintext).toString("utf-8");
    } catch (error) {
      console.error("❌ Text decryption failed:", error);
      throw new Error(
        `Text decryption failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Check if encryption is enabled
   * @returns boolean
   */
  isEncryptionEnabled(): boolean {
    return !!(
      this.keyId &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
    );
  }

  /**
   * Encrypt conversation messages for storage in tickets (without DB storage)
   * @param messages - Array of chat messages
   * @returns Promise<any[]> - Array of encrypted messages
   */
  async encryptConversation(messages: any[]): Promise<any[]> {
    try {
      const encryptedMessages = [];

      for (const message of messages) {
        if (message.content) {
          const encryptedContent = await this.encryptMessage(
            message.content,
            message.role || "user"
          );
          encryptedMessages.push({
            ...message,
            content: encryptedContent,
            encryptionInfo: {
              keyId: this.keyId,
              algorithm: "AWS-KMS",
              region: this.region,
              encryptedAt: new Date(),
            },
          });
        } else {
          encryptedMessages.push(message);
        }
      }

      return encryptedMessages;
    } catch (error) {
      console.error("❌ Conversation encryption failed:", error);
      throw new Error(
        `Conversation encryption failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Decrypt conversation messages from tickets
   * @param encryptedMessages - Array of encrypted messages
   * @returns Promise<any[]> - Array of decrypted messages
   */
  async decryptConversation(encryptedMessages: any[]): Promise<any[]> {
    try {
      const decryptedMessages = [];

      for (const message of encryptedMessages) {
        if (
          message.content &&
          typeof message.content === "object" &&
          message.content.encryptedContent
        ) {
          // This is an encrypted message from our new system
          const decryptedContent = await this.decryptMessage(message.content);
          decryptedMessages.push({
            ...message,
            content: decryptedContent,
          });
        } else if (typeof message.content === "string") {
          // This is already decrypted or was never encrypted
          decryptedMessages.push(message);
        } else {
          // Unknown format, keep as-is
          decryptedMessages.push(message);
        }
      }

      return decryptedMessages;
    } catch (error) {
      console.error("❌ Conversation decryption failed:", error);
      throw new Error(
        `Conversation decryption failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

// Export singleton instance
const chatEncryptionService = new ChatEncryptionService();
export default chatEncryptionService;
