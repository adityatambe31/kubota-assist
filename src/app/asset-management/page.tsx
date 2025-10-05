"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AssetTable from "./components/AssetTable";
import { AssetFilters } from "./components/AssetFilters";
import { Asset } from "./utils/csvParser";
import { Package, Plus, RefreshCw, BarChart3, AlertCircle } from "lucide-react";

interface ApiResponse {
  success: boolean;
  data: Asset[];
  total: number;
  totalInDatabase?: number;
  assetTypes?: number;
  assetTypeCounts?: { _id: string; count: number }[];
  availableDepartments?: string[];
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  error?: string;
}

export default function AssetManagementPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [dbStats, setDbStats] = useState({ totalInDatabase: 0, assetTypes: 0 });
  const [availableDepartments, setAvailableDepartments] = useState<string[]>(
    []
  );
  const [assetTypeCounts, setAssetTypeCounts] = useState<
    { _id: string; count: number }[]
  >([]);
  const [assetTypeFilter, setAssetTypeFilter] = useState("all");

  // Check if user has access (you can modify this logic as needed)
  const userRole = user?.publicMetadata?.role as string;
  const hasAccess = userRole === "super_admin" || userRole === "staff";

  // Fetch assets from API
  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (departmentFilter !== "all")
        params.append("department", departmentFilter);
      if (assetTypeFilter !== "all")
        params.append("assetType", assetTypeFilter);

      const response = await fetch(
        `/asset-management/api?${params.toString()}`
      );
      const result: ApiResponse = await response.json();

      if (result.success) {
        setAssets(result.data);
        // Update database statistics if available
        if (result.totalInDatabase && result.assetTypes) {
          setDbStats({
            totalInDatabase: result.totalInDatabase,
            assetTypes: result.assetTypes,
          });
        }
        // Update available departments from API
        if (result.availableDepartments) {
          setAvailableDepartments(result.availableDepartments);
        }
        // Update asset type counts
        if (result.assetTypeCounts) {
          setAssetTypeCounts(result.assetTypeCounts);
        }
      } else {
        setError(result.error || "Failed to load assets");
        setAssets([]);
      }
    } catch (err) {
      setError("Network error: Failed to fetch assets");
      setAssets([]);
      console.error("Error fetching assets:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch assets on component mount and when filters change
  useEffect(() => {
    fetchAssets();
  }, [searchTerm, statusFilter, departmentFilter, assetTypeFilter]);

  // Calculate statistics and available departments
  const stats = useMemo(() => {
    const total = assets.length;
    const active = assets.filter((asset) => asset.status === "Active").length;
    const maintenance = assets.filter(
      (asset) => asset.status === "Maintenance"
    ).length;
    const inactive = assets.filter(
      (asset) => asset.status === "Inactive"
    ).length;
    const retired = assets.filter((asset) => asset.status === "Retired").length;

    return { total, active, maintenance, inactive, retired };
  }, [assets]);

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleDepartmentChange = (department: string) => {
    setDepartmentFilter(department);
  };

  const handleAssetTypeChange = (assetType: string) => {
    setAssetTypeFilter(assetType);
  };
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDepartmentFilter("all");
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!isSignedIn) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Authentication Required
            </h2>
            <p className="text-gray-600 mt-2">
              Please sign in to access the Asset Management system.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Access control check
  if (!hasAccess) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
            <p className="text-gray-600 mt-2">
              You don't have permission to access the Asset Management system.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-gray-600 mt-2">
            Manage and track your Kubota equipment and assets (
            {dbStats.totalInDatabase.toLocaleString()} total assets,{" "}
            {dbStats.assetTypes} categories)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={fetchAssets}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Asset Type Progress Bars */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Asset Types Distribution
          </CardTitle>
          <CardDescription>
            Click on any asset type to filter the results
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assetTypeCounts
              .sort((a, b) => b.count - a.count)
              .map((item) => {
                const percentage =
                  dbStats.totalInDatabase > 0
                    ? Math.round((item.count / dbStats.totalInDatabase) * 100)
                    : 0;
                const isActive = assetTypeFilter === item._id;

                return (
                  <div
                    key={item._id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      isActive
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() =>
                      handleAssetTypeChange(isActive ? "all" : item._id)
                    }
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900">{item._id}</h3>
                      <span className="text-sm text-gray-600">
                        {percentage}%
                      </span>
                    </div>
                    <Progress value={percentage} className="mb-2" />
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{item.count} assets</span>
                      <span>of {dbStats.totalInDatabase}</span>
                    </div>
                  </div>
                );
              })}
          </div>

          {assetTypeFilter !== "all" && (
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => handleAssetTypeChange("all")}
                className="text-sm"
              >
                Clear Filter - Show All Asset Types
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Assets Database
          </CardTitle>
          <CardDescription>
            Search and filter through your asset inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AssetFilters
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusChange={handleStatusChange}
            departmentFilter={departmentFilter}
            onDepartmentChange={handleDepartmentChange}
            onClearFilters={handleClearFilters}
            totalAssets={stats.total}
            filteredCount={assets.length}
            availableDepartments={availableDepartments}
          />

          {error ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-red-900 mb-2">
                Error Loading Assets
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchAssets} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : (
            <AssetTable assets={assets} isLoading={loading} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
