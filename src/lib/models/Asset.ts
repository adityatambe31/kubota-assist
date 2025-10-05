import mongoose, { Document, Schema } from "mongoose";

export interface IAsset extends Document {
  id: string;
  assetTypeIcon: string;
  assetName: string;
  department: string;
  assetModel: string; // Renamed from 'model' to avoid conflict with Document.model
  userName: string;
  serialNumber: string;
  location: string;
  datePurchased: string;
  status: "Active" | "Inactive" | "Maintenance" | "Retired";
  assetType: string; // Original asset type from JSON
  createdAt: Date;
  updatedAt: Date;
}

const AssetSchema = new Schema<IAsset>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    assetTypeIcon: {
      type: String,
      required: true,
    },
    assetName: {
      type: String,
      required: true,
      index: true,
    },
    department: {
      type: String,
      required: true,
      index: true,
    },
    assetModel: {
      type: String,
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
      index: true,
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    location: {
      type: String,
      required: true,
      index: true,
    },
    datePurchased: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Maintenance", "Retired"],
      default: "Active",
      index: true,
    },
    assetType: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search functionality
AssetSchema.index({
  assetName: "text",
  department: "text",
  assetModel: "text",
  userName: "text",
  serialNumber: "text",
  location: "text",
  id: "text",
});

// Create compound indexes for common queries
AssetSchema.index({ department: 1, status: 1 });
AssetSchema.index({ assetType: 1, status: 1 });
AssetSchema.index({ status: 1, department: 1, assetType: 1 });

export const Asset =
  mongoose.models.Asset || mongoose.model<IAsset>("Asset", AssetSchema);
