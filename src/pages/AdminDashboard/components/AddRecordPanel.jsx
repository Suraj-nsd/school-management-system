// src/shared/pages/AdminDashboard/components/AddRecordPanel.jsx
import React from "react";

export default function AddRecordPanel({ prettyTable, children }) {
  return (
    <div
      className="mb-4"
      style={{
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: "1.5rem",
        boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
        border: "1px solid rgba(148,163,184,0.4)",
      }}
    >
      <h5
        className="mb-3 fw-bold"
        style={{ color: "#004aad", fontSize: "1rem" }}
      >
        Add New {prettyTable}
      </h5>
      {children}
    </div>
  );
}
