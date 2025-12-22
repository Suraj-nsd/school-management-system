// src/shared/pages/AdminDashboard/components/AdminHeader.jsx
import React from "react";
import { FaPlus } from "react-icons/fa";

export default function AdminHeader({
  title,
  prettyTable,
  totalCount,
  onToggleAdd,
  addDisabled,
}) {
  return (
    <div
      className="rounded-4 shadow-sm mb-4 text-white"
      style={{
        padding: "1.25rem 1.5rem",
        background:
          "linear-gradient(135deg, #004aad 0%, #0077ff 45%, #37a4ff 100%)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div>
        <div
          className="text-uppercase mb-1"
          style={{
            fontSize: "0.7rem",
            opacity: 0.8,
            letterSpacing: "0.15em",
          }}
        >
          {title}
        </div>
        <h2 className="mb-1 fw-bold" style={{ fontSize: "1.3rem" }}>
          {prettyTable}
        </h2>
        <p
          className="mb-0"
          style={{ fontSize: "0.85rem", opacity: 0.85 }}
        >
          Manage {prettyTable} records · Total: {totalCount} items
        </p>
      </div>
      <button
        className="btn btn-light fw-semibold d-flex align-items-center gap-2"
        onClick={onToggleAdd}
        type="button"
        disabled={addDisabled}
        style={{
          borderRadius: 999,
          paddingInline: "1.2rem",
          paddingBlock: "0.5rem",
          boxShadow: "0 4px 12px rgba(15,23,42,0.35)",
          fontSize: "0.9rem",
        }}
      >
        <FaPlus />
        <span>Add New</span>
      </button>
    </div>
  );
}
