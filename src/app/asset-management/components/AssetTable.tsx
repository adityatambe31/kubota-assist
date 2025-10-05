"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Asset } from "../utils/csvParser";

interface AssetTableProps {
  assets: Asset[];
  isLoading: boolean;
}

const AssetTable = ({ assets, isLoading }: AssetTableProps) => {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (assets.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">
          <h3 className="text-lg font-medium mb-2">No assets found</h3>
          <p>Try adjusting your search criteria or add new assets.</p>
        </div>
      </Card>
    );
  }

  const getStatusColor = (status: Asset["status"]) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "Inactive":
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "Retired":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Icon</TableHead>
              <TableHead className="w-24">ID</TableHead>
              <TableHead>Asset Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>User Name</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date Purchased</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.id} className="hover:bg-gray-50">
                <TableCell className="text-center text-xl">
                  {asset.assetTypeIcon}
                </TableCell>
                <TableCell className="font-medium text-sm">
                  {asset.id}
                </TableCell>
                <TableCell className="font-medium">{asset.assetName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {asset.department}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {asset.model}
                </TableCell>
                <TableCell>{asset.userName}</TableCell>
                <TableCell className="font-mono text-sm">
                  {asset.serialNumber}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {asset.location}
                </TableCell>
                <TableCell className="text-sm">
                  {formatDate(asset.datePurchased)}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(asset.status)}>
                    {asset.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default AssetTable;
