// Application constants
export const APP_CONFIG = {
  name: "Kubota Assist",
  description: "IT Support Assistant for Kubota",
  version: "1.0.0",
} as const;

// Session and timeout constants
export const SESSION_CONFIG = {
  timeout: 1000 * 60 * 30, // 30 minutes
  warningTime: 1000 * 60 * 5, // 5 minutes before timeout
  maxMessages: 100,
} as const;

// Database constants
export const DB_CONFIG = {
  collections: {
    itIssues: "itissues",
    supportTickets: "supporttickets",
    encryptedConversations: "encrypted_convo",
  },
  limits: {
    searchResults: 10,
    messageHistory: 50,
  },
} as const;

// Authentication constants
export const AUTH_CONFIG = {
  roles: {
    SUPER_ADMIN: "super_admin",
    STAFF: "staff",
    END_USER: "end_user",
  },
  redirects: {
    signIn: "/sign-in",
    signUp: "/sign-up",
    dashboard: "/",
    admin: "/admin",
    unauthorized: "/unauthorized",
  },
} as const;

// API endpoints
export const API_ENDPOINTS = {
  chat: "/api/chat",
  ticket: "/api/ticket",
  autoSave: "/api/auto-save-chat",
  retrieveConversation: "/api/retrieve-conversation",
  adminUsers: "/api/admin/users",
} as const;
