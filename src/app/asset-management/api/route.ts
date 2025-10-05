import { NextRequest, NextResponse } from "next/server";
import { Asset } from "../../../lib/models/Asset";
import { connectDB } from "../../../lib/mongodb";

interface AssetQueryParams {
  search?: string;
  status?: string;
  department?: string;
  assetType?: string;
  page?: number;
  limit?: number;
}

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const department = searchParams.get("department");
    const assetType = searchParams.get("assetType");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

    // Build MongoDB query based on filters
    const query: any = {};

    // Text search across multiple fields
    if (search) {
      query.$text = { $search: search };
    }

    // Status filter
    if (status && status !== "all") {
      query.status = { $regex: new RegExp(status, "i") };
    }

    // Department filter
    if (department && department !== "all") {
      query.department = { $regex: new RegExp(department, "i") };
    }

    // Asset type filter
    if (assetType && assetType !== "all") {
      query.assetType = assetType;
    }

    // Execute query with pagination and sorting
    const [
      assets,
      totalCount,
      totalInDatabase,
      departmentStats,
      assetTypeStats,
      assetTypeCounts,
    ] = await Promise.all([
      Asset.find(query)
        .select({
          id: 1,
          assetTypeIcon: 1,
          assetName: 1,
          department: 1,
          assetModel: 1,
          userName: 1,
          serialNumber: 1,
          location: 1,
          datePurchased: 1,
          status: 1,
          assetType: 1,
        })
        .sort(search ? { score: { $meta: "textScore" } } : { assetName: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Asset.countDocuments(query),
      Asset.countDocuments(),

      // Get unique departments for filter dropdown
      Asset.distinct("department"),

      // Get asset type count
      Asset.distinct("assetType"),

      // Get asset type counts for progress bars
      Asset.aggregate([
        { $group: { _id: "$assetType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    // Transform the data to match frontend expectations
    const transformedAssets = assets.map((asset: any) => ({
      id: asset.id,
      assetTypeIcon: asset.assetTypeIcon,
      assetName: asset.assetName,
      department: asset.department,
      model: asset.assetModel, // Transform back to 'model' for frontend compatibility
      userName: asset.userName,
      serialNumber: asset.serialNumber,
      location: asset.location,
      datePurchased: asset.datePurchased,
      status: asset.status,
    }));

    return NextResponse.json({
      success: true,
      data: transformedAssets,
      total: totalCount,
      totalInDatabase: totalInDatabase,
      assetTypes: assetTypeStats.length,
      assetTypeCounts: assetTypeCounts,
      availableDepartments: departmentStats.sort(),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
      message: "Assets retrieved successfully from MongoDB",
    });
  } catch (error) {
    console.error("Error reading assets from MongoDB:", error);

    return NextResponse.json(
      {
        success: false,
        data: [],
        total: 0,
        error: "Failed to load assets from database",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();

    const body = await request.json();

    // Create new asset in MongoDB
    const newAsset = await Asset.create({
      ...body,
      // Ensure required fields are present
      status: body.status || "Active",
      assetType: body.assetType || "Other",
    });

    return NextResponse.json({
      success: true,
      message: "Asset created successfully in MongoDB",
      data: newAsset,
    });
  } catch (error) {
    console.error("Error creating asset in MongoDB:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create asset in database",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Asset ID is required for updates",
        },
        { status: 400 }
      );
    }

    // Update asset in MongoDB
    const updatedAsset = await Asset.findOneAndUpdate({ id: id }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedAsset) {
      return NextResponse.json(
        {
          success: false,
          error: "Asset not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Asset updated successfully",
      data: updatedAsset,
    });
  } catch (error) {
    console.error("Error updating asset in MongoDB:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update asset in database",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
