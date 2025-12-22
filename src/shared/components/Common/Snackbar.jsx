import React from "react";

export default function Snackbar({ open, message, severity = "success", onClose }) {
  if (!open) return null;
  const bg = severity === "success" ? "bg-success" : "bg-danger";
  return (
    <div
      className={`toast show position-fixed top-0 start-50 translate-middle-x mt-3 text-white ${bg}`}
      role="alert"
      style={{ zIndex: 9999, minWidth: "300px" }}
    >
      <div className="d-flex justify-content-between p-3">
        <div>{message}</div>
        <button className="btn-close btn-close-white" onClick={onClose}></button>
      </div>
    </div>
  );
}
