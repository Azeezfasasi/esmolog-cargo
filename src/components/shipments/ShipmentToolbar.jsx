import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search, Filter } from "lucide-react";

// The props have been updated to match the parent component
const ShipmentToolbar = ({
  searchQuery,
  onSearch,
  onStatusChange,
  onExport,
  selectedStatus,
  onFacilityChange,
  selectedFacility,
  facilities = [],
  statuses = [],
}) => {
  return (
    <div className="relative flex flex-col gap-3 sm:gap-4 p-2 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-orange-200 shadow-sm">
      <div className="absolute -top-3 left-4 right-4 h-1 rounded-full bg-gradient-to-r from-orange-600 via-orange-600 to-orange-500 opacity-20" />
      <div className="flex items-center gap-2 w-full">
        <Search className="text-gray-500 flex-shrink-0" />
        <Input
          type="text"
          placeholder="Search by name, ID or destination"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full text-sm"
        />
      </div>

      {/* Facility and Status Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
        <select
          value={selectedFacility}
          onChange={(e) => onFacilityChange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 sm:py-1 text-sm w-full sm:w-auto flex-1 sm:flex-initial"
        >
          <option value="">All Facilities</option>
          {Array.isArray(facilities) && facilities.length > 0 ? (
            facilities.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}{f.count != null ? ` (${f.count})` : ''}
              </option>
            ))
          ) : (
            // Fallback static list if no dynamic facilities provided
            <>
              <option value="Atlanta">Atlanta</option>
              <option value="Indianapolis">Indianapolis</option>
              <option value="New York">New York</option>
              <option value="New jersey">New jersey</option>
              <option value="Maryland">Maryland</option>
              <option value="Dallas">Dallas</option>
              <option value="Houston">Houston</option>
              <option value="United States of America">United States of America</option>
              <option value="Canada">Canada</option>
              <option value="Ontario">Ontario</option>
              <option value="Calgary">Calgary</option>
              <option value="Edmonton">Edmonton</option>
              <option value="United Kingdom">United Kingdom</option>
            </>
          )}
        </select>

        <Button variant="outline" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </div>
    </div>
  );
};

export default ShipmentToolbar;
