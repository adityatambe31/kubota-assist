// Define ticket types as an enum for better type safety
export enum TicketType {
  LOGIN_ISSUES = "Login / Password Reset Issues",
  HARDWARE_SOFTWARE = "New Laptop / Hardware / Software Requests",
  VPN_ACCESS = "VPN / Remote Access Issues",
  APPLICATION = "Application Issues",
  EMAIL = "Email / Outlook Problems",
  PRINTER = "Printer / Peripheral Issues",
  TEAMS = "Microsoft Teams / Phone Issues",
  SYSTEM = "Windows Updates / System Performance",
}

export interface ChatMessage {
  role: "bot" | "user";
  content: string;
  solutions?: ITIssue[];
  ticketSuggestion?: TicketSuggestion;
}

export interface TicketSuggestion {
  suggestTicket: boolean;
  ticketType?: TicketType;
  ticketDescription?: string;
}

export interface HandbookEntry {
  title: string;
  solution: string[];
  category?: string;
}

export interface ITIssue {
  id: string;
  title: string;
  description: string;
  solution: string[];
  keywords: string[];
  category: TicketType;
  createdAt: Date;
}
