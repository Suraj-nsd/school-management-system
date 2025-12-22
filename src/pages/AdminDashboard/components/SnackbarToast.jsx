// src/shared/pages/AdminDashboard/components/SnackbarToast.jsx
import React from "react";

export default function SnackbarToast({
  open,
  message,
  severity = "success",
  onClose,
}) {
  if (!open) return null;

  return (
    <div
      className={`toast align-items-center text-white border-0 show position-fixed top-0 start-50 translate-middle-x mt-3 shadow-lg`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        zIndex: 1200,
        borderRadius: 999,
        backgroundColor: severity === "success" ? "#16a34a" : "#dc2626",
      }}
    >
      <div className="d-flex">
        <div className="toast-body fw-semibold">{message}</div>
        <button
          type="button"
          className="btn-close btn-close-white me-2 m-auto"
          aria-label="Close"
          onClick={onClose}
        ></button>
      </div>
    </div>
  );
}
