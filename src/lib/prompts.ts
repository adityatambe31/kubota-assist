export interface SubPrompt {
  text: string;
  keywords: string[];
}

export interface MainPrompt {
  icon: string;
  title: string;
  subPrompts: SubPrompt[];
}

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
