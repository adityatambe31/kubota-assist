export interface SubPrompt {
  text: string;
  keywords: string[];
}

export interface MainPrompt {
  icon: string;
  title: string;
  subPrompts: SubPrompt[];
}

export const GEMINI_SYSTEM_PROMPT = `You are an IT Support Assistant for Kubota. Your role is to help employees with their IT-related issues by finding and explaining solutions from our database.

DATABASE INTERACTION RULES:
1. You will receive solutions from our IT support database in this format:
   - Solution Title
   - Step-by-step instructions
   - Category (if available)

2. MATCHING SOLUTIONS:
   - Analyze the user's query and provided solutions carefully
   - Look for keyword matches and semantic relevance
   - Consider the issue category (login, access, VPN, etc.)
   - Match partial solutions if they help solve part of the problem

3. RESPONSE FORMAT REQUIREMENTS:
   Your response must be structured exactly like this:

   ### Issue Summary
   [Brief description of the user's issue]

   ### Solution Steps
   Based on our database, here's how to solve your issue:

   **Prerequisites:**
   - [List any required preparations or warnings]

   **Step-by-Step Instructions:**
   1. [First step]
   2. [Second step]
   3. [Third step]
   ...

   **Additional Notes:**
   - [Any important warnings or considerations]
   - [Additional context from the database]

   ### Need More Help?
   If these steps don't resolve your issue, please contact IT support.

4. CRITICAL RULES:
   - NEVER create new solutions or suggest alternatives
   - ONLY use and explain solutions from the provided database
   - Structure MUST follow the format above with proper markdown formatting
   - If NO matching solutions found, respond with:
     ### No Direct Solution Found
     I don't find a matching solution in our database. Please create a support ticket.

5. CATEGORIES TO CONSIDER:
   - Login Issues (credentials, access denied)
   - Network Access (VPN, remote connectivity)
   - Software Installation
   - Hardware Problems
   - Access Requests
   - System Errors

Remember: You are ONLY allowed to use solutions from the database. Your role is to match and explain existing solutions, not create new ones.`;

export const SOLUTION_TEMPLATE = `
USER QUERY:
[query]

DATABASE SOLUTIONS:
[Each solution formatted as:]
SOLUTION N:
Title: [title]
Category: [category]
Steps:
1. [step]
2. [step]
...

TASK:
1. Review the user's query carefully
2. Check if any database solutions match the issue
3. If matches found: Explain how to apply the solution(s) step by step
4. If no matches: Recommend creating a support ticket
`;

export const SUPPORT_PROMPTS: MainPrompt[] = [
  {
    icon: "🔑",
    title: "Login / Password Reset Issues",
    subPrompts: [
      {
        text: "I'm locked out of my account",
        keywords: ["locked", "lockout", "can't login", "locked out"],
      },
      {
        text: "I need to reset my password",
        keywords: ["forgot", "password", "reset", "change password"],
      },
      {
        text: "My account is disabled or expired",
        keywords: ["disabled", "expired", "inactive"],
      },
    ],
  },
  {
    icon: "💻",
    title: "New Laptop / Hardware / Software Requests",
    subPrompts: [
      {
        text: "I need a new or replacement laptop",
        keywords: ["new laptop", "replacement", "broken", "hardware"],
      },
      {
        text: "I need software installed",
        keywords: ["software", "install", "program"],
      },
      {
        text: "I need hardware accessories",
        keywords: ["accessories", "mouse", "keyboard", "monitor"],
      },
    ],
  },
  {
    icon: "🌐",
    title: "VPN / Remote Access Issues",
    subPrompts: [
      {
        text: "I can't connect to VPN",
        keywords: ["vpn", "connect", "remote access", "connection"],
      },
      {
        text: "VPN keeps disconnecting",
        keywords: ["vpn disconnect", "unstable", "dropping"],
      },
      {
        text: "VPN is very slow",
        keywords: ["vpn slow", "laggy", "performance"],
      },
    ],
  },
  {
    icon: "📂",
    title: "Application Issues",
    subPrompts: [
      {
        text: "I'm having issues with an application",
        keywords: ["application", "software", "program", "as400", "dealerlink"],
      },
      {
        text: "Application is not responding",
        keywords: ["frozen", "crash", "not responding", "hang"],
      },
      {
        text: "I need access to an application",
        keywords: ["access", "permission", "license"],
      },
    ],
  },
  {
    icon: "📧",
    title: "Email / Outlook Problems",
    subPrompts: [
      {
        text: "Outlook is not working properly",
        keywords: ["outlook", "email", "not working", "issues"],
      },
      {
        text: "I'm not receiving emails",
        keywords: ["not receiving", "missing emails", "delayed"],
      },
      {
        text: "I can't send emails",
        keywords: ["can't send", "sending failed", "outbox"],
      },
    ],
  },
  {
    icon: "🖨️",
    title: "Printer / Peripheral Issues",
    subPrompts: [
      {
        text: "I can't print documents",
        keywords: ["print", "printer", "not printing", "print failed"],
      },
      {
        text: "Printer is not detected",
        keywords: ["printer not found", "not detected", "missing"],
      },
      {
        text: "Scanner is not working",
        keywords: ["scanning", "scanner", "scan failed"],
      },
    ],
  },
  {
    icon: "📞",
    title: "Microsoft Teams / Phone Issues",
    subPrompts: [
      {
        text: "Teams calls are not working",
        keywords: ["teams", "calls", "audio", "voice"],
      },
      {
        text: "Issues with Teams meetings",
        keywords: ["meetings", "conference", "video"],
      },
      {
        text: "Teams is slow or crashing",
        keywords: ["teams slow", "teams crash", "not responding"],
      },
    ],
  },
  {
    icon: "🔄",
    title: "Windows Updates / System Performance",
    subPrompts: [
      {
        text: "My computer is running slow",
        keywords: ["slow", "performance", "laggy", "freezing"],
      },
      {
        text: "Windows updates are failing",
        keywords: ["updates", "windows update", "failed"],
      },
      {
        text: "System is not responding",
        keywords: ["not responding", "frozen", "crash"],
      },
    ],
  },
];
