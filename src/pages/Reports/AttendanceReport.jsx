// src/shared/components/Reports/AttendanceReport.jsx
import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  FaDownload,
  FaSearch,
  FaClipboardCheck,
  FaCalendar,
} from "react-icons/fa";
import { supabase } from "../../supabaseClient";

export default function AttendanceReport() {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [studentSearch, setStudentSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("attendance")
          .select("*")
          .order("attendance_date", { ascending: false });

        if (error) throw error;
        setAttendance(data || []);
      } catch (err) {
        console.error("Error loading attendance:", err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  const filteredRows = useMemo(() => {
    return attendance.filter((row) => {
      const statusOk =
        statusFilter === "all" ||
        (row.status || "").toLowerCase() === statusFilter;

      const studentStr = String(row.student_id || "").toLowerCase();
      const searchOk = studentStr.includes(studentSearch.toLowerCase());

      let dateOk = true;
      if (fromDate) {
        dateOk =
          dateOk &&
          new Date(row.attendance_date) >= new Date(fromDate);
      }
      if (toDate) {
        dateOk =
          dateOk &&
          new Date(row.attendance_date) <= new Date(toDate);
      }

      return statusOk && searchOk && dateOk;
    });
  }, [attendance, statusFilter, studentSearch, fromDate, toDate]);

  const presentCount = filteredRows.filter(
    (r) => (r.status || "").toLowerCase() === "present"
  ).length;
  const absentCount = filteredRows.filter(
    (r) => (r.status || "").toLowerCase() === "absent"
  ).length;
  const totalCount = filteredRows.length;

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "present")
      return (
        <span className="badge bg-success">
          Present
        </span>
      );
    if (s === "absent")
      return (
        <span className="badge bg-danger">
          Absent
        </span>
      );
    if (s === "leave")
      return (
        <span className="badge bg-warning text-dark">
          Leave
        </span>
      );
    return (
      <span className="badge bg-secondary">
        {status || "-"}
      </span>
    );
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Attendance Report", 105, 18, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const rangeText =
      (fromDate ? `From ${formatDate(fromDate)} ` : "") +
      (toDate ? `To ${formatDate(toDate)}` : "");
    if (rangeText.trim()) {
      doc.text(rangeText.trim(), 105, 24, { align: "center" });
    }

    const body = filteredRows.map((r, idx) => [
      idx + 1,
      r.student_id || "",
      formatDate(r.attendance_date),
      (r.status || "").toUpperCase(),
      r.remarks || "",
    ]);

    doc.autoTable({
      startY: 30,
      head: [["S.No", "Student ID", "Date", "Status", "Remarks"]],
      body,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 74, 173] },
    });

    doc.save("attendance_report.pdf");
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, #e0edff 0, #f3f4f6 40%, #e5e7eb 100%)",
        }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          ></div>
          <div className="mt-3 fs-5 text-muted fw-semibold">
            Loading attendance…
          </div>
        </div>
      </div>
    );
  }

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
            Reports
          </div>
          <h2 className="mb-1 fw-bold" style={{ fontSize: "1.3rem" }}>
            Attendance Report
          </h2>
          <p className="mb-0" style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            Filter and export student attendance from the attendance table.
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
          <FaClipboardCheck size={26} />
        </div>
      </div>

      {/* Filters + Summary */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-8">
          <div
            className="bg-white rounded-4 shadow-sm p-3 p-md-4"
            style={{ border: "1px solid rgba(148,163,184,0.35)" }}
          >
            <h6 className="fw-bold mb-3" style={{ color: "#004aad" }}>
              Filters
            </h6>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Student ID
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <FaSearch className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search by ID"
                  />
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Status
                </label>
                <select
                  className="form-select form-select-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Date Range
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light">
                    <FaCalendar className="text-muted" />
                  </span>
                  <input
                    type="date"
                    className="form-control"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                  <input
                    type="date"
                    className="form-control"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                onClick={handleDownloadPDF}
                disabled={filteredRows.length === 0}
                style={{
                  borderRadius: 999,
                  paddingInline: "1rem",
                  background:
                    "linear-gradient(135deg, #004aad 0%, #0077ff 70%)",
                  borderColor: "transparent",
                }}
              >
                <FaDownload size={12} />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="col-12 col-lg-4">
          <div className="row g-3">
            <div className="col-4">
              <div
                className="bg-white rounded-4 shadow-sm p-2 text-center"
                style={{ border: "1px solid rgba(148,163,184,0.35)" }}
              >
                <div
                  className="small text-muted text-uppercase"
                  style={{ fontSize: "0.65rem" }}
                >
                  Total
                </div>
                <div className="fw-bold" style={{ fontSize: "1.1rem" }}>
                  {totalCount}
                </div>
              </div>
            </div>
            <div className="col-4">
              <div
                className="bg-white rounded-4 shadow-sm p-2 text-center"
                style={{ border: "1px solid rgba(148,163,184,0.35)" }}
              >
                <div
                  className="small text-muted text-uppercase"
                  style={{ fontSize: "0.65rem" }}
                >
                  Present
                </div>
                <div
                  className="fw-bold text-success"
                  style={{ fontSize: "1.1rem" }}
                >
                  {presentCount}
                </div>
              </div>
            </div>
            <div className="col-4">
              <div
                className="bg-white rounded-4 shadow-sm p-2 text-center"
                style={{ border: "1px solid rgba(148,163,184,0.35)" }}
              >
                <div
                  className="small text-muted text-uppercase"
                  style={{ fontSize: "0.65rem" }}
                >
                  Absent
                </div>
                <div
                  className="fw-bold text-danger"
                  style={{ fontSize: "1.1rem" }}
                >
                  {absentCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-4 shadow-sm p-3 p-md-4"
        style={{ border: "1px solid rgba(148,163,184,0.35)" }}
      >
        <div className="table-responsive" style={{ maxHeight: "65vh" }}>
          <table className="table align-middle mb-0">
            <thead
              className="text-white position-sticky top-0"
              style={{
                background:
                  "linear-gradient(135deg, #004aad 0%, #0077ff 60%, #37a4ff 100%)",
                zIndex: 10,
              }}
            >
              <tr>
                <th style={{ fontSize: "0.75rem" }}>S.No</th>
                <th style={{ fontSize: "0.75rem" }}>Student ID</th>
                <th style={{ fontSize: "0.75rem" }}>Date</th>
                <th style={{ fontSize: "0.75rem" }}>Status</th>
                <th style={{ fontSize: "0.75rem" }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-5 text-muted"
                  >
                    <FaSearch
                      size={36}
                      className="mb-2"
                      style={{ opacity: 0.2 }}
                    />
                    <div className="fw-semibold">No attendance records</div>
                    <small>Adjust filters to see more data.</small>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr key={row.id || idx}>
                    <td>{idx + 1}</td>
                    <td>{row.student_id}</td>
                    <td>{formatDate(row.attendance_date)}</td>
                    <td>{statusBadge(row.status)}</td>
                    <td>{row.remarks || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
