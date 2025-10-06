import { NextRequest, NextResponse } from "next/server";
import chatEncryptionService from "@/lib/security/awsEncryption";

export async function POST(request: NextRequest) {
  try {
    const { sessionId, decrypt = false } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId required" },
        { status: 400 }
      );
    }

    console.log(
      `🔍 Retrieving conversation: ${sessionId}, decrypt: ${decrypt}`
    );

    const conversation = await chatEncryptionService.retrieveConversation(
      sessionId,
      decrypt
    );

    return NextResponse.json({
      success: true,
      conversation,
      message: decrypt
        ? "Conversation decrypted successfully"
        : "Encrypted conversation metadata retrieved",
    });
  } catch (error: any) {
    console.error("❌ Error retrieving conversation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    info: "Retrieve Encrypted Conversation",
    usage: 'POST with {"sessionId": "your-session-id", "decrypt": true/false}',
  });
}
