import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    console.log("🔍 Debug: Environment variables loaded");

    const jiraEmail = process.env.JIRA_EMAIL;
    const jiraApiKey = process.env.JIRA_API_KEY;
    const jiraDomain = process.env.JIRA_DOMAIN;
    const jiraProjectKey = process.env.JIRA_PROJECT_KEY;

    console.log("JIRA_EMAIL:", jiraEmail);
    console.log("JIRA_DOMAIN:", jiraDomain);
    console.log("JIRA_PROJECT_KEY:", jiraProjectKey);
    console.log("JIRA_API_KEY length:", jiraApiKey?.length);
    console.log("JIRA_API_KEY starts with:", jiraApiKey?.substring(0, 10));

    if (!jiraEmail || !jiraApiKey || !jiraDomain) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing environment variables",
          details: {
            hasEmail: !!jiraEmail,
            hasApiKey: !!jiraApiKey,
            hasDomain: !!jiraDomain,
          },
        },
        { status: 400 }
      );
    }

    // Test the base64 encoding
    const credentials = `${jiraEmail}:${jiraApiKey}`;
    const authHeader = `Basic ${Buffer.from(credentials).toString("base64")}`;

    console.log("Auth credentials length:", credentials.length);
    console.log("Auth header preview:", authHeader.substring(0, 30) + "...");

    // Test connection to Jira
    const baseUrl = `https://${jiraDomain}/rest/api/3`;
    console.log("Testing URL:", `${baseUrl}/myself`);

    const response = await fetch(`${baseUrl}/myself`, {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const responseText = await response.text();
    console.log("Response body:", responseText);

    if (response.ok) {
      const userData = JSON.parse(responseText);
      return NextResponse.json({
        success: true,
        message: `Connected as ${userData.displayName} (${userData.emailAddress})`,
        userData,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `Connection failed: ${response.status} ${response.statusText}`,
          details: {
            status: response.status,
            statusText: response.statusText,
            body: responseText,
          },
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      {
        success: false,
        message: `Debug error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        error: error instanceof Error ? error.stack : error,
      },
      { status: 500 }
    );
  }
}
