// src/shared/pages/AdminDashboard/components/DeleteConfirmModal.jsx
import React from "react";

export default function DeleteConfirmModal({ open, onCancel, onConfirm }) {
  if (!open) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      style={{
        backgroundColor: "rgba(15,23,42,0.55)",
        zIndex: 1050,
        backdropFilter: "blur(2px)",
      }}
      onClick={onCancel}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content border-0"
          style={{
            borderRadius: 16,
            boxShadow: "0 18px 45px rgba(15,23,42,0.35)",
          }}
        >
          <div
            className="modal-header border-0"
            style={{
              background:
                "linear-gradient(135deg, #dc2626 0%, #ef4444 60%, #f97373 100%)",
              color: "#fff",
              borderRadius: "16px 16px 0 0",
            }}
          >
            <h5 className="modal-title fw-bold">Confirm Delete</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onCancel}
            ></button>
          </div>
          <div className="modal-body">
            <p className="mb-0">
              Are you sure you want to delete this record? This action
              cannot be undone.
            </p>
          </div>
          <div
            className="modal-footer border-0"
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "0 0 16px 16px",
            }}
          >
            <button
              type="button"
              className="btn btn-light"
              onClick={onCancel}
              style={{ borderRadius: 999 }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={onConfirm}
              style={{ borderRadius: 999 }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
