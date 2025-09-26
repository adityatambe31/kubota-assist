import { NextRequest, NextResponse } from "next/server";
import chatEncryptionService from "@/lib/services/ChatEncryptionService";

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Testing AWS KMS Chat Encryption...");

    // Test chat messages
    const testMessages = [
      {
        role: "user" as const,
        content: "Hello, I need help with my Kubota tractor. It won't start.",
      },
      {
        role: "assistant" as const,
        content:
          "I can help you troubleshoot your Kubota tractor. Let me ask you a few questions to diagnose the issue.",
      },
      {
        role: "user" as const,
        content:
          "The engine turns over but won't catch. The fuel gauge shows half full.",
      },
      {
        role: "assistant" as const,
        content:
          "Based on your description, this could be a fuel delivery issue. Let's check the fuel filter first. When was it last replaced?",
      },
    ];

    // Store encrypted conversation
    const sessionId = `aws-kms-test-${Date.now()}`;

    console.log(
      `💾 Storing encrypted conversation with session ID: ${sessionId}`
    );
    const savedConversation =
      await chatEncryptionService.storeEncryptedConversation(
        sessionId,
        testMessages,
        {
          conversationTitle: "AWS KMS Test - Tractor Troubleshooting",
          userId: "test-user",
          category: "technical-support",
        }
      );

    console.log("✅ Conversation stored successfully!");

    // Retrieve without decryption (secure)
    console.log("📊 Retrieving conversation metadata (without decryption)...");
    const encryptedView = await chatEncryptionService.retrieveConversation(
      sessionId,
      false
    );

    // Retrieve with decryption (authorized access)
    console.log("🔓 Retrieving conversation with decryption...");
    const decryptedView = await chatEncryptionService.retrieveConversation(
      sessionId,
      true
    );

    return NextResponse.json({
      success: true,
      message: "AWS KMS Chat Encryption Test Completed Successfully!",
      results: {
        encryption: {
          sessionId: savedConversation.sessionId,
          conversationTitle: savedConversation.conversationTitle,
          totalMessages: savedConversation.metadata?.totalMessages,
          encryptionAlgorithm: savedConversation.encryptionInfo?.algorithm,
          keyId: savedConversation.encryptionInfo?.keyId,
          encryptedAt: savedConversation.encryptionInfo?.encryptedAt,
        },
        encryptedView: {
          sessionId: encryptedView.sessionId,
          note: encryptedView.note,
          sampleEncryptedMessage: encryptedView.messages?.[0],
        },
        decryptedView: {
          sessionId: decryptedView.sessionId,
          note: decryptedView.note,
          firstMessage: decryptedView.messages?.[0],
          totalDecryptedMessages: decryptedView.messages?.length,
        },
      },
      instructions: {
        storage:
          "Messages are encrypted using AWS KMS and stored in MongoDB collection: encrypted_convo",
        security:
          "Decryption only occurs when explicitly requested with proper authorization",
        usage:
          "Use AutoSaveChatService.saveCompletedChatSession() to automatically store chat sessions",
      },
    });
  } catch (error) {
    console.error("❌ AWS KMS Test Failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "AWS KMS Test Failed",
        message: error instanceof Error ? error.message : "Unknown error",
        instructions: {
          checkEnvironment:
            "Verify AWS_KMS_KEY_ID, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY are set",
          checkMongoDB: "Verify MongoDB connection is working",
          checkPermissions: "Verify AWS IAM permissions for KMS operations",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    info: "AWS KMS Chat Encryption Test Endpoint",
    usage: "POST to this endpoint to test encrypted chat storage",
    features: [
      "AWS KMS encryption/decryption",
      "MongoDB encrypted storage",
      "Secure message handling",
      "Auto-save integration ready",
    ],
  });
}
