require("dotenv").config({ path: ".env.local" });
const { MongoClient } = require("mongodb");

// Add TicketType enum directly in the file to avoid import issues
const TicketType = {
  LOGIN_ISSUES: "Login / Password Reset Issues",
  HARDWARE_SOFTWARE: "New Laptop / Hardware / Software Requests",
  VPN_ACCESS: "VPN / Remote Access Issues",
  APPLICATION: "Application Issues",
  EMAIL: "Email / Outlook Problems",
  PRINTER: "Printer / Peripheral Issues",
  TEAMS: "Microsoft Teams / Phone Issues",
  SYSTEM: "Windows Updates / System Performance",
};

const sampleData = [
  // Login / Password Reset Issues
  {
    title: "Account Lockout Solution",
    description: "User locked out of their account",
    solution: [
      "Wait 30 minutes for automatic unlock",
      "Use the self-service password reset tool at reset.kubota.com",
      "Contact IT Service Desk if issues persist",
    ],
    keywords: ["locked", "lockout", "can't login", "locked out"],
    category: TicketType.LOGIN_ISSUES,
  },
  {
    title: "Password Reset Guide",
    description: "User needs to reset password",
    solution: [
      "Visit reset.kubota.com",
      "Click 'Forgot Password'",
      "Enter your email address",
      "Follow the instructions in the reset email",
    ],
    keywords: ["forgot", "password", "reset", "change password"],
    category: TicketType.LOGIN_ISSUES,
  },
  // Hardware/Software Requests
  {
    title: "New Device Request Process",
    description: "Request for new laptop or replacement device",
    solution: [
      "Submit request through ServiceNow portal",
      "Include justification for new device",
      "Get manager approval",
      "IT will contact for device setup",
    ],
    keywords: ["new laptop", "replacement", "broken", "hardware"],
    category: TicketType.HARDWARE_SOFTWARE,
  },
  // VPN Issues
  {
    title: "VPN Connection Troubleshooting",
    description: "Issues with VPN connection",
    solution: [
      "Ensure internet connection is stable",
      "Verify VPN client is up to date",
      "Check if your password hasn't expired",
      "Try disconnecting and reconnecting to VPN",
    ],
    keywords: ["vpn", "connect", "remote access", "connection"],
    category: TicketType.VPN_ACCESS,
  },
  // Application Issues
  {
    title: "Common Application Issues",
    description: "General application problems",
    solution: [
      "Close and restart the application",
      "Clear application cache",
      "Check for pending updates",
      "Verify network connectivity",
    ],
    keywords: ["application", "software", "program", "as400", "dealerlink"],
    category: TicketType.APPLICATION,
  },
  // Email/Outlook Issues
  {
    title: "Outlook Troubleshooting",
    description: "Problems with Outlook",
    solution: [
      "Check internet connection",
      "Verify Outlook is in online mode",
      "Clear Outlook cache",
      "Repair Office installation if needed",
    ],
    keywords: ["outlook", "email", "emails", "not receiving"],
    category: TicketType.EMAIL,
  },
  // Printer Issues
  {
    title: "Printer Connection Guide",
    description: "Printer connection problems",
    solution: [
      "Ensure printer is powered on and connected",
      "Check network connection",
      "Remove and re-add printer",
      "Install latest printer drivers",
    ],
    keywords: ["print", "printer", "scanning", "not detected"],
    category: TicketType.PRINTER,
  },
  // Teams Issues
  {
    title: "Teams Call Troubleshooting",
    description: "Issues with Teams calls or meetings",
    solution: [
      "Check microphone and speaker settings",
      "Verify internet connection speed",
      "Clear Teams cache",
      "Update Teams application",
    ],
    keywords: ["teams", "calls", "meetings", "audio"],
    category: TicketType.TEAMS,
  },
  // Windows Updates
  {
    title: "System Performance Issues",
    description: "Computer running slow or updates failing",
    solution: [
      "Restart computer",
      "Check disk space",
      "Run Windows updates",
      "Close unnecessary applications",
    ],
    keywords: ["slow", "performance", "updates", "windows"],
    category: TicketType.SYSTEM,
  },
];

async function seedDatabase() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    console.log("Attempting to connect to MongoDB...");
    await client.connect();
    console.log("Successfully connected to MongoDB!");

    const db = client.db("kubota_it_support");
    const collection = db.collection("itissues");

    // Clear existing data
    const deleteResult = await collection.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} existing documents`);

    // Insert new data
    const insertResult = await collection.insertMany(sampleData);
    console.log(
      `Successfully inserted ${insertResult.insertedCount} documents`
    );

    // Verify the data
    const count = await collection.countDocuments();
    console.log(`Total documents in collection: ${count}`);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1); // Exit with error code
  } finally {
    await client.close();
    console.log("Connection closed");
    process.exit(0);
  }
}

seedDatabase().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
