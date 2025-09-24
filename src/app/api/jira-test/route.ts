import { NextRequest, NextResponse } from "next/server";
import { jiraService } from "@/lib/jira";

export async function GET(req: NextRequest) {
  try {
    console.log("🧪 Testing Jira connection...");

    const result = await jiraService.testConnection();

    if (result.success) {
      console.log("✅ Jira connection successful");
      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } else {
      console.log("❌ Jira connection failed");
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("❌ Jira test error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("🧪 Creating test Jira ticket...");

    const result = await jiraService.createIssue({
      summary: "Test ticket from Kubota Assistant",
      description:
        "This is a test ticket created from the Kubota IT Assistant application to verify Jira integration is working correctly.",
      priority: "Medium",
      issueType: "Task",
      labels: ["test", "kubota-assistant"],
    });

    if (result.success) {
      console.log("✅ Test Jira ticket created successfully");
      return NextResponse.json({
        success: true,
        message: `Test ticket created: ${result.issueKey}`,
        issueKey: result.issueKey,
        url: result.url,
      });
    } else {
      console.log("❌ Test Jira ticket creation failed");
      return NextResponse.json(
        {
          success: false,
          message: result.error,
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("❌ Jira test ticket error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
