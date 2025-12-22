// src/shared/pages/AdminDashboard/components/StudentAdmissionForm.jsx
import React from "react";

export default function StudentAdmissionForm({ onSubmit, children }) {
  return (
    <form
      onSubmit={onSubmit}
      className="p-4 border rounded bg-white"
      style={{
        borderRadius: 16,
        borderColor: "rgba(148,163,184,0.5)",
        boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
      }}
    >
      <h4
        className="mb-4 fw-bold text-center"
        style={{
          color: "#004aad",
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          fontSize: "0.9rem",
        }}
      >
        Admission Form
      </h4>

      {/* ✅ Put your actual fields as children */}
      {children}
    </form>
  );
}
