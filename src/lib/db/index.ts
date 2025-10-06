// MongoDB exports
export { connectDB } from "./mongodb/connection";
export { findSolutionsByCategory, searchSolutions } from "./mongodb/queries";

// MongoDB Models
export { ITIssue } from "./mongodb/models/ITIssue";
export { SupportTicket } from "./mongodb/models/SupportTicket";
export { default as EncryptedConvo } from "./mongodb/models/EncryptedConvo";

// JIRA exports
export { jiraService } from "./jira/client";

// Snowflake exports (when implemented)
// export { connectSnowflake } from "./snowflake/connection";
