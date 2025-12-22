// src/shared/pages/Attendance/MarkAttendanceScan.jsx
import React, { useState } from "react";
// import dynamic from "next/dynamic"; // ❌ remove if not using Next.js
// If you are in CRA/Vite, just use: import { QrReader } from "react-qr-reader";
import { QrReader } from "react-qr-reader";
import { supabase } from "../../../supabaseClient";
import { FaQrcode, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export default function MarkAttendanceScan({ role = "admin" }) {
  const [scanResult, setScanResult] = useState(null); // parsed JSON
  const [rawText, setRawText] = useState("");
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [isSaving, setIsSaving] = useState(false);

  const handleScan = async (result) => {
    if (!result?.text) return;
    try {
      setRawText(result.text);
      const parsed = JSON.parse(result.text);
      if (parsed.type !== "student_attendance") {
        setStatus({
          type: "error",
          msg: "QR is not a valid student attendance code.",
        });
        setScanResult(null);
        return;
      }
      setScanResult(parsed);
      setStatus({
        type: "info",
        msg: "QR scanned. Confirm to mark attendance.",
      });
    } catch (err) {
      console.error("Invalid QR JSON:", err);
      setStatus({
        type: "error",
        msg: "Invalid QR code format.",
      });
      setScanResult(null);
    }
  };

  const handleError = (err) => {
    console.error("QR scan error:", err);
    setStatus({
      type: "error",
      msg: "Camera / QR scan error. Check permissions.",
    });
  };

  const markAttendance = async () => {
    if (!scanResult?.student_id) return;
    try {
      setIsSaving(true);
      setStatus({ type: "", msg: "" });

      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const payload = {
        student_id: scanResult.student_id,
        attendance_date: today,
        status: "present",
        remarks: `QR scan by ${role}`,
      };

      const { error } = await supabase.from("attendance").insert([payload]);
      if (error) throw error;

      setStatus({
        type: "success",
        msg: `Attendance marked PRESENT for ${scanResult.name} (${scanResult.student_id})`,
      });
    } catch (err) {
      console.error("Error inserting attendance:", err.message);
      setStatus({
        type: "error",
        msg: err.message || "Failed to mark attendance",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const headerTitle =
    role === "teacher" ? "Teacher QR Attendance" : "Admin QR Attendance";

  return (
    <div
      className="container-fluid py-4 px-3 px-md-4"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f4f6fb 0%, #edf2ff 40%, #f9fafb 100%)",
      }}
    >
      {/* Header */}
      <div
        className="rounded-4 shadow-sm mb-4 text-white"
        style={{
          padding: "1.1rem 1.4rem",
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
            Attendance
          </div>
          <h2 className="mb-1 fw-bold" style={{ fontSize: "1.3rem" }}>
            {headerTitle}
          </h2>
          <p className="mb-0" style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            Scan student ID card QR and automatically mark today&apos;s attendance.
          </p>
        </div>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 18,
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FaQrcode size={26} />
        </div>
      </div>

      <div className="row g-4">
        {/* Scanner */}
        <div className="col-12 col-lg-6">
          <div
            className="bg-white rounded-4 shadow-sm p-3 p-md-4"
            style={{ border: "1px solid rgba(148,163,184,0.35)" }}
          >
            <h5 className="fw-bold mb-3" style={{ color: "#004aad" }}>
              Camera Scanner
            </h5>
            <div
              style={{
                maxWidth: 420,
                margin: "0 auto",
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid rgba(148,163,184,0.5)",
              }}
            >
              <QrReader
                constraints={{ facingMode: "environment" }}
                onResult={handleScan}
                onError={handleError}
                videoStyle={{ width: "100%", height: "100%", objectFit: "cover" }}
                containerStyle={{ width: "100%", paddingTop: "100%" }}
              />
            </div>
            <p className="text-muted small mt-2 mb-0">
              Point the camera at the QR on the student ID card. Make sure lighting is good.
            </p>
          </div>
        </div>

        {/* Details + confirm */}
        <div className="col-12 col-lg-6">
          <div
            className="bg-white rounded-4 shadow-sm p-3 p-md-4 h-100"
            style={{ border: "1px solid rgba(148,163,184,0.35)" }}
          >
            <h5 className="fw-bold mb-3" style={{ color: "#004aad" }}>
              Scan Details
            </h5>

            {status.msg && (
              <div
                className={`alert alert-${
                  status.type === "error"
                    ? "danger"
                    : status.type === "success"
                    ? "success"
                    : "info"
                } d-flex align-items-center`}
              >
                {status.type === "error" && (
                  <FaExclamationTriangle className="me-2" />
                )}
                {status.type === "success" && (
                  <FaCheckCircle className="me-2" />
                )}
                <span>{status.msg}</span>
              </div>
            )}

            {scanResult ? (
              <>
                <div className="border rounded-3 p-3 bg-light mb-3">
                  <div className="fw-semibold mb-1">
                    {scanResult.name} ({scanResult.student_id})
                  </div>
                  <div className="small text-muted">
                    Class: {scanResult.class || "N/A"}
                  </div>
                  <div className="small text-muted">
                    Session: {scanResult.session || "N/A"}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-success d-flex align-items-center gap-2"
                  onClick={markAttendance}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Mark Present for Today"}
                </button>
              </>
            ) : (
              <p className="text-muted small">
                Waiting for a valid student QR code. Once scanned, details will appear here for confirmation.
              </p>
            )}

            {rawText && (
              <details className="mt-3">
                <summary className="small text-muted">Raw QR text</summary>
                <pre
                  className="mt-1 small bg-dark text-white p-2 rounded"
                  style={{ maxHeight: 160, overflow: "auto" }}
                >
                  {rawText}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
