// require("dotenv").config({ path: ".env.local" });
// // const { MongoClient } = require("mongodb");

// async function testMongoConnection() {
//   try {
//     const client = new MongoClient(process.env.MONGODB_URI);
//     console.log("Attempting to connect to MongoDB...");

//     await client.connect();
//     console.log("Successfully connected to MongoDB!");

//     const db = client.db("kubota_it_support");
//     const collections = await db.listCollections().toArray();
//     console.log(
//       "Available collections:",
//       collections.map((c) => c.name)
//     );

//     await client.close();
//     console.log("Connection closed successfully");
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//   }
// }

// testMongoConnection();
