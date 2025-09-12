# IT Support Chatbot Prototype – Project Documentation

## 1. Overview
The IT Support Chatbot is a prototype web-based tool designed to reduce IT support workload by providing users with self-service solutions before raising a support ticket.

- **Goal:** Allow employees to quickly resolve common IT issues by retrieving solutions from the IT handbook database.
- **Fallback:** If the issue is not resolved, the bot redirects the user to Jira for ticket creation.
- **Future:** Potential integration with Gemini AI for improved natural query handling, and ServiceNow as an additional ticketing option.

## 2. Architecture Components

### Frontend
- **Framework:** Next.js (React, TailwindCSS, shadcn components).
- **Hosting:** Hosted on Vercel.
- **User Interaction:** User interacts through a chat-style UI.

### Backend
- **Technology:** Node.js + TypeScript API.
- **Functionality:** Handles requests from the frontend, fetches solutions from MongoDB, connects to Jira (and later ServiceNow), and has optional integration with the Gemini AI API.

### Database
- **Type:** MongoDB Atlas.
- **Purpose:** Stores IT Handbook solutions (FAQ entries).
- **Security:** Encryption at rest enabled by default.

### Integrations
- **Jira REST API:** For ticket creation.
- **Gemini AI API:** Planned to help interpret natural queries.
- **ServiceNow:** Future alternative ticketing system.

### Data Flow
1. User enters a query in the chatbot UI.
2. Frontend sends the query to the Backend API.
3. Backend searches the MongoDB handbook database.
4. If a solution is found, it is returned to the user.
5. If no solution is found or the user is unsatisfied, the bot offers to create a ticket in Jira.
6. (Optional future) Gemini AI API helps improve query matching.

## 3. Tech Stack
- **Frontend:** Next.js, React, TailwindCSS, shadcn UI.
- **Backend:** Node.js, TypeScript.
- **Database:** MongoDB Atlas.
- **Hosting:** Vercel (Frontend + API).
- **Integrations:** 
  - Jira (REST API).
  - Gemini AI API (Google AI Studio).

## 4. Features (Prototype)
- Search IT Handbook solutions from MongoDB.
- Display solutions to users in the chatbot UI.
- Redirect to Jira ticket creation if unresolved.
- Secure communication over HTTPS.

## 5. Setup & Deployment

### Local Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   npm run dev
   ```

### Environment Variables
- **MONGODB_URI:** MongoDB Atlas connection string.
- **JIRA_API_KEY:** API key for Jira ticket creation.
- **GEMINI_API_KEY:** (future) Gemini API key.

### Deployment
- Deploy frontend/backend via Vercel.
- MongoDB Atlas handles database hosting.

## 6. Security & Compliance
- **Encryption:** HTTPS everywhere, MongoDB encryption at rest.
- **Authentication:** No SSO in prototype (planned future integration with Google Workspace/Azure AD).
- **Authorization:** Basic API key-based security.
- **Audit Logging:** Not yet implemented.

## 7. Limitations & Next Steps
- No Single Sign-On (SSO) authentication yet.
- No monitoring/logging.
- Only Jira supported (ServiceNow in the future).
- Gemini AI integration not fully built.

## 8. Appendix
- [Jira REST API docs](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)
- [MongoDB Atlas docs](https://docs.atlas.mongodb.com/)
- [Google Gemini API docs](https://developers.google.com/gemini)
