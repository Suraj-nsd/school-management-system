import React, { useState, useMemo } from "react";
import Sidebar from "../components/Common/Sidebar";
import UniversalDashboard from "./UniversalDashboard";

export default function UniversalLayout({ role = "admin" }) {
  const [activeTable, setActiveTable] = useState("");

  // Role-based color themes (optional aesthetic)
  const theme = useMemo(() => {
    switch (role) {
      case "teacher":
        return { gradient: "linear-gradient(135deg, #007bff, #00b4d8)", label: "Teacher Dashboard" };
      case "student":
        return { gradient: "linear-gradient(135deg, #28a745, #8fd19e)", label: "Student Dashboard" };
      default:
        return { gradient: "linear-gradient(135deg, #6f42c1, #9b59b6)", label: "Admin Dashboard" };
    }
  }, [role]);

  return (
    <div className="d-flex">
      <Sidebar
        activeTable={activeTable}
        onSelectTable={setActiveTable}
        role={role}
      />

      <div
        className="flex-grow-1"
        style={{
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          overflowX: "hidden",
        }}
      >
        {/* Top header bar */}
        <div
          className="p-3 shadow-sm text-white fw-semibold"
          style={{
            background: theme.gradient,
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div className="container-fluid d-flex justify-content-between align-items-center">
            <span className="fs-5">{theme.label}</span>
            <small>{new Date().toLocaleString("en-IN")}</small>
          </div>
        </div>

        {/* Main universal dashboard */}
        <div className="p-3">
          <UniversalDashboard role={role} />
        </div>
      </div>
    </div>
  );
}
