import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search } from "lucide-react";

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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-gray-50 rounded-xl shadow">
      <div className="flex items-center gap-2 w-full md:w-auto">
        <Search className="text-gray-500" />
        <Input
          type="text"
          placeholder="Search by name, ID or destination"
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full md:w-64"
        />
      </div>

      {/* Facility and Status Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={selectedFacility}
          onChange={(e) => onFacilityChange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm"
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

        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1 text-sm w-[200px]"
        >
          <option value="">All Statuses</option>
          {Array.isArray(statuses) && statuses.length > 0 ? (
            statuses.map((status) => (
              status.isActive && (
                <option key={status._id} value={status.code || status.name.toLowerCase()}>
                  {status.name}
                </option>
              )
            ))
          ) : (
            // Fallback static list
            <>
              <option value="pending">Pending</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="processing">Processing</option>
              <option value="out-for-delivery">Out For Delivery</option>
              <option value="pickup-scheduled">Pickup Scheduled</option>
              <option value="picked-up">Picked Up</option>
              <option value="arrived-at-hub">Arrived at Hub</option>
              <option value="departed-from-hub">Departed from Hub</option>
              <option value="on-hold">On Hold</option>
              <option value="customs-clearance">Customs Clearance</option>
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
