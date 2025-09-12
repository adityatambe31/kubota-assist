import { connectDB } from "../src/lib/mongodb";

async function testConnection() {
  try {
    await connectDB();
    console.log("Successfully connected to MongoDB! 🎉");
    process.exit(0);
  } catch (error) {
    console.error("Connection failed 😢:", error);
    process.exit(1);
  }
}

testConnection();
