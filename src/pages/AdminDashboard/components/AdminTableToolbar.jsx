// src/shared/pages/AdminDashboard/components/AdminTableToolbar.jsx
import React from "react";
import { FaSearch } from "react-icons/fa";

export default function AdminTableToolbar({
  prettyTable,
  globalFilter,
  onGlobalFilterChange,
  visibleCount,
  totalCount,
}) {
  return (
    <div className="mb-3">
      <div
        className="input-group"
        style={{
          borderRadius: 999,
          overflow: "hidden",
          boxShadow: "0 4px 10px rgba(15,23,42,0.06)",
        }}
      >
        <span
          className="input-group-text border-0"
          style={{
            backgroundColor: "#f3f4ff",
            color: "#6b7280",
          }}
        >
          <FaSearch />
        </span>
        <input
          type="search"
          className="form-control border-0"
          placeholder={`Search in ${prettyTable}…`}
          value={globalFilter ?? ""}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          autoComplete="off"
          style={{
            fontSize: "0.95rem",
            backgroundColor: "#f9fafb",
          }}
        />
      </div>
      <small className="text-muted mt-2 d-block">
        Showing {visibleCount} of {totalCount} records
      </small>
    </div>
  );
}
