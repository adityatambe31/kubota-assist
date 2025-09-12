export interface ITIssue {
  id: string;
  title: string;
  description: string;
  solution: string[];
  keywords: string[];
  category: TicketType;
  createdAt: Date;
}

export enum TicketType {
  LOGIN_ISSUES = "login_issues",
  NEW_REQUEST = "new_request",
  INCIDENT = "incident",
  KDASH_ACCESS = "kdash_access",
  EXTERNAL_ACCESS = "external_access",
  VPN_REQUEST = "vpn_request",
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
