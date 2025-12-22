// src/shared/pages/AdminDashboard/components/EditRecordModal.jsx
import React from "react";
import { FaTimes, FaSave } from "react-icons/fa";

export default function EditRecordModal({
  editRow,
  onClose,
  onChangeField,
  onSave,
  getPkFieldsForTable,
}) {
  if (!editRow) return null;

  const pkFields = getPkFieldsForTable(editRow.table);

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
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content border-0"
          style={{
            borderRadius: 18,
            boxShadow: "0 18px 45px rgba(15,23,42,0.35)",
          }}
        >
          <div
            className="modal-header text-white border-0"
            style={{
              background:
                "linear-gradient(135deg, #004aad 0%, #0077ff 60%, #37a4ff 100%)",
              borderRadius: "18px 18px 0 0",
            }}
          >
            <h5 className="modal-title fw-bold">
              Edit{" "}
              {editRow.table.charAt(0).toUpperCase() +
                editRow.table.slice(1).replace(/_/g, " ")}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              aria-label="Close"
              onClick={onClose}
            ></button>
          </div>
          <div
            className="modal-body"
            style={{
              maxHeight: "60vh",
              overflowY: "auto",
              padding: "1.1rem 1.25rem 1rem",
            }}
          >
            <div className="row">
              {Object.entries(editRow.row).map(
                ([key, value]) =>
                  !["created_at", "updated_at"].includes(key) && (
                    <div className="col-md-6 mb-3" key={key}>
                      <label
                        htmlFor={`edit-${key}`}
                        className="form-label fw-semibold text-capitalize"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {key.replace(/_/g, " ")}
                      </label>
                      <input
                        id={`edit-${key}`}
                        type={key === "id" ? "number" : "text"}
                        className="form-control"
                        value={value ?? ""}
                        onChange={(e) =>
                          onChangeField(key, e.target.value)
                        }
                        placeholder={`Enter ${key.replace(/_/g, " ")}`}
                        disabled={pkFields.includes(key)}
                      />
                    </div>
                  )
              )}
            </div>
          </div>
          <div
            className="modal-footer border-0"
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "0 0 18px 18px",
            }}
          >
            <button
              type="button"
              className="btn btn-light"
              onClick={onClose}
              style={{ borderRadius: 999 }}
            >
              <FaTimes className="me-2" />
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onSave}
              style={{
                borderRadius: 999,
                background:
                  "linear-gradient(135deg, #004aad 0%, #0077ff 70%)",
                borderColor: "transparent",
              }}
            >
              <FaSave className="me-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
