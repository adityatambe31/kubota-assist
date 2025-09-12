import { connectDB } from "@/lib/mongodb";
import { ITIssue, TicketType } from "@/lib/models/ITIssue";

const sampleData = [
  {
    title: "VPN Connection Issues",
    description:
      "Unable to connect to VPN or experiencing frequent disconnections",
    solution: [
      "Check internet connection is stable",
      "Ensure VPN credentials are correct",
      "Restart VPN client",
      "Clear VPN cache",
    ],
    keywords: ["vpn", "connection", "network", "remote access"],
    category: TicketType.VPN_REQUEST, // Changed from 'Network' to match enum
  },
  {
    title: "Outlook Crashes",
    description: "Microsoft Outlook application keeps crashing or freezing",
    solution: [
      "Update Outlook to latest version",
      "Clear Outlook cache",
      "Repair Office installation",
    ],
    keywords: ["outlook", "email", "crash", "microsoft office"],
    category: TicketType.INCIDENT, // Changed from 'Software' to match enum
  },
  {
    title: "Account Locked Out",
    description: "User unable to login due to account lockout",
    solution: [
      "Verify user identity",
      "Reset account lockout",
      "Guide through password reset if needed",
    ],
    keywords: ["login", "password", "lockout", "reset", "unlock"],
    category: TicketType.LOGIN_ISSUES,
  },
  {
    title: "K-dash Access Request",
    description: "New user requesting access to K-dash platform",
    solution: [
      "Verify manager approval",
      "Check user role requirements",
      "Process K-dash access request",
      "Send access credentials",
    ],
    keywords: ["kdash", "access", "request", "new user"],
    category: TicketType.KDASH_ACCESS,
  },
];

async function seedDatabase() {
  try {
    await connectDB();
    await ITIssue.deleteMany({}); // Clear existing data
    await ITIssue.insertMany(sampleData);
    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
