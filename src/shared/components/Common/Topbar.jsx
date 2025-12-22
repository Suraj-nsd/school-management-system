import React from "react";
import { FaUserCircle } from "react-icons/fa";

export default function Topbar({ username = "Admin" }) {
  return (
    <div
      className="d-flex justify-content-between align-items-center px-4 py-2 shadow-sm"
      style={{ background: "white", marginLeft: "240px" }}
    >
      <h5 className="mb-0 text-primary fw-bold">Welcome, {username}</h5>
      <FaUserCircle size={28} className="text-secondary" />
    </div>
  );
}
