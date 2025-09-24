/**
 * Jira Integration Service
 * Creates tickets in Jira when support tickets are submitted
 */

export interface JiraTicketData {
  summary: string;
  description: string;
  priority: "Lowest" | "Low" | "Medium" | "High" | "Highest";
  issueType: string;
  labels?: string[];
}

export interface JiraResponse {
  success: boolean;
  issueKey?: string;
  issueId?: string;
  url?: string;
  error?: string;
}

class JiraService {
  private baseUrl: string;
  private authHeader: string;
  private projectKey: string;

  constructor() {
    // Get environment variables
    const jiraEmail = process.env.JIRA_EMAIL;
    const jiraApiKey = process.env.JIRA_API_KEY;
    const jiraDomain = process.env.JIRA_DOMAIN;
    this.projectKey = process.env.JIRA_PROJECT_KEY || "BTS";

    if (!jiraEmail || !jiraApiKey || !jiraDomain) {
      throw new Error("Missing Jira configuration in environment variables");
    }

    this.baseUrl = `https://${jiraDomain}/rest/api/3`;

    // Create base64 encoded auth header (email:api_token)
    const credentials = `${jiraEmail}:${jiraApiKey}`;
    this.authHeader = `Basic ${Buffer.from(credentials).toString("base64")}`;
  }

  /**
   * Create a new issue in Jira
   */
  async createIssue(ticketData: JiraTicketData): Promise<JiraResponse> {
    try {
      // Map priority levels to Jira priority names
      const priorityMap: Record<string, string> = {
        low: "Low",
        medium: "Medium",
        high: "High",
        urgent: "Highest",
      };

      const jiraPriority =
        priorityMap[ticketData.priority.toLowerCase()] || "Medium";

      // Prepare Jira issue payload
      const issuePayload = {
        fields: {
          project: {
            key: this.projectKey,
          },
          summary: ticketData.summary,
          description: {
            type: "doc",
            version: 1,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: ticketData.description,
                  },
                ],
              },
            ],
          },
          issuetype: {
            name: ticketData.issueType || "Task",
          },
          priority: {
            name: jiraPriority,
          },
          labels: ticketData.labels || ["auto-generated", "chatbot"],
        },
      };

      console.log(
        "Creating Jira issue with payload:",
        JSON.stringify(issuePayload, null, 2)
      );

      // Make API call to Jira
      const response = await fetch(`${this.baseUrl}/issue`, {
        method: "POST",
        headers: {
          Authorization: this.authHeader,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(issuePayload),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log("✅ Jira issue created successfully:", responseData);
        return {
          success: true,
          issueKey: responseData.key,
          issueId: responseData.id,
          url: `https://${process.env.JIRA_DOMAIN}/browse/${responseData.key}`,
        };
      } else {
        console.error("❌ Failed to create Jira issue:", responseData);
        return {
          success: false,
          error: responseData.errorMessages?.join(", ") || "Unknown error",
        };
      }
    } catch (error) {
      console.error("❌ Error creating Jira issue:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Test Jira connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/myself`, {
        headers: {
          Authorization: this.authHeader,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const userData = await response.json();
        return {
          success: true,
          message: `Connected as ${userData.displayName} (${userData.emailAddress})`,
        };
      } else {
        return {
          success: false,
          message: `Connection failed: ${response.status} ${response.statusText}`,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Connection error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      };
    }
  }

  /**
   * Map our ticket categories to Jira issue types
   */
  private mapCategoryToIssueType(category: string): string {
    const categoryMap: Record<string, string> = {
      login: "Story",
      hardware: "Story",
      vpn: "Story",
      application: "Story",
      email: "Story",
      printer: "Story",
      teams: "Story",
      performance: "Story",
    };

    return categoryMap[category] || "Story";
  }

  /**
   * Create Jira ticket from our support ticket data
   */
  async createTicketFromSupportData(ticketData: {
    category: string;
    subject: string;
    description: string;
    priority: string;
    ticketId: string;
  }): Promise<JiraResponse> {
    const jiraTicketData: JiraTicketData = {
      summary: ticketData.subject,
      description: ticketData.description,
      priority: this.mapPriority(ticketData.priority),
      issueType: this.mapCategoryToIssueType(ticketData.category),
      labels: ["support-ticket", "auto-generated", ticketData.category],
    };

    return this.createIssue(jiraTicketData);
  }

  private mapPriority(
    priority: string
  ): "Lowest" | "Low" | "Medium" | "High" | "Highest" {
    const priorityMap: Record<
      string,
      "Lowest" | "Low" | "Medium" | "High" | "Highest"
    > = {
      low: "Low",
      medium: "Medium",
      high: "High",
      urgent: "Highest",
    };

    return priorityMap[priority.toLowerCase()] || "Medium";
  }
}

export const jiraService = new JiraService();
