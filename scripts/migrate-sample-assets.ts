#!/usr/bin/env node

/**
 * MongoDB Sample Asset Migration Script
 *
 * This script imports sample asset data (3 from each type) into MongoDB.
 * Run with: npx tsx scripts/migrate-sample-assets.ts
 */

import { readFileSync } from "fs";
import { join } from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Asset } from "../src/lib/models/Asset";
import {
  parseJsonAssets,
  JsonAssetData,
} from "../src/app/asset-management/utils/jsonParser";

// Load environment variables
dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Please add your MongoDB URI to .env.local");
  process.exit(1);
}

async function connectToMongoDB() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

async function migrateSampleAssets() {
  console.log("🚀 Starting sample asset migration...");

  try {
    // Read sample JSON file
    const jsonPath = join(
      process.cwd(),
      "src/app/asset-management/data/sample_assets.json"
    );
    console.log(`📄 Reading sample JSON file from: ${jsonPath}`);

    const jsonContent = readFileSync(jsonPath, "utf-8");
    const jsonData: JsonAssetData = JSON.parse(jsonContent);

    console.log(
      `📊 Found ${jsonData.conversion_info.total_assets} sample assets in ${jsonData.conversion_info.asset_types_count} categories`
    );

    // Parse assets using existing parser
    const assets = parseJsonAssets(jsonData);
    console.log(`🔄 Parsed ${assets.length} assets`);

    // Clear existing assets
    console.log("🗑️  Clearing existing assets...");
    await Asset.deleteMany({});

    // Prepare assets for MongoDB with asset type information
    const mongoAssets: any[] = [];
    Object.entries(jsonData.assets_by_type).forEach(
      ([assetType, assetList]) => {
        assetList.forEach((asset) => {
          // Find the corresponding parsed asset
          const parsedAsset = assets.find((a) => a.id === asset.id);
          if (parsedAsset) {
            mongoAssets.push({
              ...parsedAsset,
              assetType: assetType, // Add the original asset type
            });
          }
        });
      }
    );

    console.log(`💾 Inserting ${mongoAssets.length} assets into MongoDB...`);

    // Insert all assets at once since it's a small dataset
    const insertedAssets = await Asset.insertMany(mongoAssets);
    console.log(`✅ Successfully inserted ${insertedAssets.length} assets!`);

    // Verify insertion
    const totalInDB = await Asset.countDocuments();
    console.log(`✅ Migration completed! ${totalInDB} assets now in MongoDB`);

    // Display statistics
    const statusStats = await Asset.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const departmentStats = await Asset.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const assetTypeStats = await Asset.aggregate([
      { $group: { _id: "$assetType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    console.log("\n📈 Migration Statistics:");
    console.log("\n📊 Status Distribution:");
    statusStats.forEach((stat) => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });

    console.log("\n🏢 Top Departments:");
    departmentStats.forEach((stat) => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });

    console.log("\n📦 Asset Types:");
    assetTypeStats.forEach((stat) => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

async function main() {
  await connectToMongoDB();
  await migrateSampleAssets();
  await mongoose.disconnect();
  console.log("✅ Disconnected from MongoDB");
  console.log("🎉 Sample asset migration completed successfully!");
}

// Run the migration
main().catch((error) => {
  console.error("❌ Migration script failed:", error);
  process.exit(1);
});
