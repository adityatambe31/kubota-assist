"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Asset } from "../utils/csvParser";
import { Search, Filter, X } from "lucide-react";

interface AssetFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentChange: (value: string) => void;
  onClearFilters: () => void;
  totalAssets: number;
  filteredCount: number;
  availableDepartments: string[];
}

const statusOptions: Array<{ value: string; label: string; count?: number }> = [
  { value: "all", label: "All Status" },
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Retired", label: "Retired" },
];

export const AssetFilters: React.FC<AssetFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  departmentFilter,
  onDepartmentChange,
  onClearFilters,
  totalAssets,
  filteredCount,
  availableDepartments,
}) => {
  const hasActiveFilters =
    searchTerm.length > 0 ||
    statusFilter !== "all" ||
    departmentFilter !== "all";

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets by name, serial, model, user, or location..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-[160px]">
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department Filter */}
          <div className="min-w-[160px]">
            <Select value={departmentFilter} onValueChange={onDepartmentChange}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by department" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {availableDepartments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          {hasActiveFilters ? (
            <span>
              Showing {filteredCount} of {totalAssets} assets
              {searchTerm && (
                <span className="ml-1">
                  matching "<strong>{searchTerm}</strong>"
                </span>
              )}
              {statusFilter !== "all" && (
                <span className="ml-1">
                  with status "<strong>{statusFilter}</strong>"
                </span>
              )}
              {departmentFilter !== "all" && (
                <span className="ml-1">
                  in "<strong>{departmentFilter}</strong>" department
                </span>
              )}
            </span>
          ) : (
            <span>Showing all {totalAssets} assets</span>
          )}
        </div>

        {hasActiveFilters && (
          <div className="text-xs">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
              <Filter className="h-3 w-3" />
              Filtered
            </span>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
              <Search className="h-3 w-3" />
              Search: "{searchTerm}"
              <button
                onClick={() => onSearchChange("")}
                className="ml-1 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {statusFilter !== "all" && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
              <Filter className="h-3 w-3" />
              Status: {statusFilter}
              <button
                onClick={() => onStatusChange("all")}
                className="ml-1 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {departmentFilter !== "all" && (
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
              <Filter className="h-3 w-3" />
              Department: {departmentFilter}
              <button
                onClick={() => onDepartmentChange("all")}
                className="ml-1 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
