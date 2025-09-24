# 🎯 Jira Integration Setup Instructions

## 📝 What You Need to Update in .env.local

Replace the placeholder values in your `.env.local` file:

```bash
# Jira Integration Settings
JIRA_API_KEY=ATATT3xFfGF05Vf19HDe4fsyw9Fnms7DoLLvz8cfiyOaMqDfo6Lvz-x_CwuBW9KPRvUW4nbOpyJLj0u-155Kb1HsEg9eZJrGVJ3k3P9K6qHlyKfEWEo1tKYnfq0P0p4QuVwvQYONOpSvBQJ67JBF0bjQ2z9bRGwGW6C5_rlLHwIP8e13bSeUbPQ=4FA91194
JIRA_EMAIL=your-actual-email@company.com           # ⚠️ CHANGE THIS
JIRA_DOMAIN=your-domain.atlassian.net               # ⚠️ CHANGE THIS
JIRA_PROJECT_KEY=SUP                                # ⚠️ CHANGE THIS IF DIFFERENT
```

## 🧪 Test Steps

1. **First, test the connection:**

   ```bash
   curl http://localhost:3000/api/jira-test
   ```

2. **Then create a test ticket:**

   ```bash
   curl -X POST http://localhost:3000/api/jira-test
   ```

3. **Try the full flow:**
   - Go to your app
   - Use the chatbot
   - Create a support ticket
   - Check if it appears in both MongoDB AND Jira!

## 🎯 What Happens Now

When someone submits a ticket:

1. ✅ **MongoDB** gets the ticket (like before)
2. 🎯 **Jira** gets a copy automatically
3. 📧 **User sees** both ticket numbers
4. 🎉 **IT team** can work in Jira like normal

## 🚨 Troubleshooting

If something doesn't work:

1. Check your browser console (F12)
2. Check your terminal logs
3. Make sure your Jira credentials are correct
4. Test the `/api/jira-test` endpoint first

## 🎯 What the IT Team Will See in Jira

- **Summary**: `[TICKET-123456] Login Issue`
- **Description**: Professional format with attempted solutions
- **Labels**: `support-ticket`, `auto-generated`, `login`
- **Issue Type**: Automatically mapped (Bug, Story, Task)
- **Priority**: Mapped from your app

Perfect! You're all set! 🚀
