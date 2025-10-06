import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

async function seedHandbook() {
  const client = await MongoClient.connect(MONGODB_URI as string);
  const db = client.db("kubota_it_support");
  const collection = db.collection("handbook");

  // Clear existing data
  await collection.deleteMany({});

  // Seed data
  const entries = [
    {
      _id: new ObjectId("68c7006249f6d955b7dbe4ca"),
      section: "A. Introduction",
      title: "A. Introduction",
      content:
        "The sales handbook is a collection of policies, procedures, incentives...",
      language: "en",
    },
    {
      _id: "68c7006249f6d955b7dbe4cb",
      section: "A. Introduction",
      title: "A. Introduction",
      content:
        "Le manuel des ventes est un ensemble de politiques, de procedures...",
      language: "fr",
    },
    {
      _id: "68c7006249f6d955b7dbe4cc",
      section: "Area of Prime Responsibility (APR)",
      title: "Area of Prime Responsibility (APR)",
      content:
        "KCL dealers are assigned an APR which is their defined sales zone...",
      language: "en",
    },
    {
      _id: "68c7006249f6d955b7dbe4cd",
      section: "Area of Prime Responsibility (APR)",
      title: "Zone de responsabilité principale (ZRP)",
      content:
        "Les concessionnaires de KCL se voient attribuer une ZRP, qui est le...",
      language: "fr",
    },
    {
      _id: "68c7006249f6d955b7dbe4ce",
      section: "2.2 Penalty",
      title: "2.2 Penalty",
      content:
        "It should be noted that Territory Qualified Discounts, Keep Em Fresh...",
      language: "en",
    },
  ];

  // Remove _id to let MongoDB auto-generate
  const entriesWithoutId = entries.map(({ _id, ...entry }) => entry);
  await collection.insertMany(entriesWithoutId);
  console.log("Handbook data seeded successfully!");

  await client.close();
}

seedHandbook().catch(console.error);
