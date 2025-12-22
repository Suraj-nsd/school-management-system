// src/shared/components/Common/Sidebar.jsx

import React, { useState } from "react";
import {
  FaBars,
  FaChevronLeft,
  FaChevronDown,
  FaChevronUp,
  FaFolderOpen,
  FaCertificate,
  FaChartBar,
  FaUserShield,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaClipboardCheck,
  FaMoneyBillWave,
  FaFileAlt,
  FaHome,
  FaIdCard,
  FaFileSignature,
  FaHistory,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// NEW: use table names from AdminDashboardLogic (keeps things in sync)
import { getTableNames } from "../../../pages/AdminDashboard/AdminDashboardLogic";

export default function Sidebar({
  role = "admin",
  activeSection,
  setActiveSection,
  activeTable,
  onSelectTable,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState("manage");

  const navigate = useNavigate();

  // at top of Sidebar.jsx (below imports)
  const HEADER_HEIGHT = 61; // adjust if needed: 96, 104, 112 etc.

  // ---------- ROLE CONFIG (what each role can see) ----------
  // use schema-consistent table names (same as initialDataState / columnsByTable)
  const roleConfig = {
    admin: {
      tables: [
        "users",
        "profiles",
        "students",
        "teachers",
        "subjects",
        "classes",
        "class_schedules",
        "attendance",
        "exams",
        "exam_terms",
        "exam_subject_marks",
        "co_scholastic_grades",
        "fees",
        "monthly_fee_structure",
        "student_fee_records",
        "bus_routes",
        "library_books",
        "notifications",
        "parent_guardians",
        "scholar_register_entries",
        "student_subjects",
        "student_transfer_certificates",
        "salaries",
      ],
      showCertificates: true,
      showReports: true,
      showFeeReport: true,
      showHistory: true,
    },
    teacher: {
      // Teacher-focused subset
      tables: [
        "students",
        "teachers",
        "subjects",
        "classes",
        "class_schedules",
        "attendance",
        "exam_subject_marks",
        "co_scholastic_grades",
        "student_subjects",
      ],
      showCertificates: true, // allow TC/ID/Result generation
      showReports: true,
      showFeeReport: false,
      showHistory: false,
    },
    student: {
      // Restricted student view
      tables: [
        "students", // own profile view (filtered by backend)
        "subjects",
        "attendance",
        "exam_subject_marks",
        "fees",
        "student_fee_records",
        "library_books",
      ],
      showCertificates: false,
      showReports: true,
      showFeeReport: false,
      showHistory: false,
    },
  };

  const currentConfig = roleConfig[role] || roleConfig.admin;

  // Use the same tables as AdminDashboardLogic / initialDataState
  const tables = getTableNames();

  const toggleCollapse = () => setCollapsed((p) => !p);
  const toggleMobile = () => setIsMobileOpen((p) => !p);
  const toggleSection = (s) => setOpenSection((p) => (p === s ? "" : s));

  const tableIcons = {
    users: <FaUserShield size={14} />,
    profiles: <FaUserGraduate size={14} />,
    students: <FaUserGraduate size={14} />,
    teachers: <FaChalkboardTeacher size={14} />,
    subjects: <FaBook size={14} />,
    classes: <FaFolderOpen size={14} />,
    class_schedules: <FaClipboardCheck size={14} />,
    attendance: <FaClipboardCheck size={14} />,
    exams: <FaFileAlt size={14} />,
    exam_terms: <FaFileAlt size={14} />,
    exam_subject_marks: <FaFileAlt size={14} />,
    co_scholastic_grades: <FaFileAlt size={14} />,
    fees: <FaMoneyBillWave size={14} />,
    monthly_fee_structure: <FaMoneyBillWave size={14} />,
    student_fee_records: <FaMoneyBillWave size={14} />,
    bus_routes: <FaFolderOpen size={14} />,
    library_books: <FaBook size={14} />,
    notifications: <FaCertificate size={14} />,
    parent_guardians: <FaUserGraduate size={14} />,
    scholar_register_entries: <FaFileAlt size={14} />,
    student_subjects: <FaBook size={14} />,
    student_transfer_certificates: <FaFileSignature size={14} />,
    salaries: <FaMoneyBillWave size={14} />,
    default: <FaBook size={14} />,
  };

  const submenuButtonStyle = (isActive) => ({
    fontWeight: isActive ? "600" : "500",
    backgroundColor: isActive ? "rgba(0, 122, 255, 0.15)" : "transparent",
    color: isActive ? "#004aad" : "#1f2933",
    borderRadius: "8px",
    marginBottom: "4px",
    paddingLeft: "0.9rem",
    paddingRight: "0.75rem",
    border: isActive ? "1px solid rgba(0,122,255,0.5)" : "1px solid transparent",
    transition: "all 0.2s ease",
    fontSize: "0.85rem",
  });

  const normalized = (t) => t.toLowerCase().replace(/\s+/g, "_");

  // Only keep tables allowed for this role
  const filteredTables = tables.filter((t) =>
    currentConfig.tables
      .map((x) => normalized(x))
      .includes(normalized(t))
  );

  const basePath =
    role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student";

  // Helper: close mobile sidebar after navigation
  const closeOnMobile = () => {
    if (window.innerWidth < 768) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button (top-left) */}
      <button
        className="btn btn-light position-fixed start-0 d-md-none shadow-sm"
        onClick={toggleMobile}
        style={{
          top: HEADER_HEIGHT + 8, // push below header
          marginLeft: "0.5rem",
          zIndex: 1050,
          borderRadius: "50%",
          width: 44,
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.95)",
          border: "1px solid rgba(148,163,184,0.6)",
        }}
      >
        <FaBars color="#004aad" />
      </button>

      {/* Sidebar */}
      <div
        className={`position-fixed d-flex flex-column ${
          collapsed ? "collapsed" : ""
        } ${isMobileOpen ? "mobile-open" : ""}`}
        style={{
          width: collapsed ? 80 : 260,
          top: HEADER_HEIGHT,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          left: 0,
          zIndex: 1040,
          transition: "all 0.3s ease",
          background:
            "linear-gradient(180deg, #f5f7fb 0%, #eef2ff 40%, #e2edff 100%)",
          borderRight: "1px solid rgba(148,163,184,0.5)",
          boxShadow: "0 4px 18px rgba(15,23,42,0.15)",
        }}
      >
        {/* Collapse toggle + brand strip */}
        <div
          className="d-none d-md-flex align-items-center justify-content-between px-3"
          style={{
            height: 56,
            borderBottom: "1px solid rgba(148,163,184,0.4)",
            background:
              "linear-gradient(135deg, #004aad 0%, #0077ff 60%, #37a4ff 100%)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {!collapsed && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: 600,
                fontSize: "0.95rem",
                letterSpacing: "0.03em",
              }}
              onClick={toggleCollapse}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "8px",
                  background: "rgba(255,213,79,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                }}
              >
                SP
              </div>
              <span>School Portal</span>
            </div>
          )}

          <div
            className="d-flex align-items-center justify-content-center"
            style={{
              cursor: "pointer",
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
            }}
            onClick={toggleCollapse}
          >
            <FaChevronLeft
              style={{
                transform: collapsed ? "rotate(180deg)" : "rotate(0)",
                transition: "transform 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* MAIN MENU */}
        <ul
          className="list-group list-group-flush mt-2"
          style={{
            padding: "0.4rem 0.6rem 0.8rem",
            overflowY: "auto",
          }}
        >
          {/* Dashboard */}
          <button
            className="list-group-item list-group-item-action d-flex align-items-center gap-2 py-2 px-2"
            onClick={() => {
              setActiveSection?.("dashboard");
              navigate(`${basePath}/dashboard`);
              closeOnMobile();
            }}
            style={{
              justifyContent: collapsed ? "center" : "flex-start",
              border: "none",
              background:
                activeSection === "dashboard"
                  ? "rgba(0, 74, 173, 0.1)"
                  : "transparent",
              color: activeSection === "dashboard" ? "#004aad" : "#111827",
              borderRadius: "10px",
              marginBottom: "6px",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              fontWeight: activeSection === "dashboard" ? 600 : 500,
              boxShadow:
                activeSection === "dashboard"
                  ? "0 0 0 1px rgba(59,130,246,0.4)"
                  : "none",
              transition: "all 0.2s ease",
            }}
          >
            <FaHome size={16} />
            {!collapsed && (
              <span style={{ fontSize: "0.9rem" }}>Dashboard</span>
            )}
          </button>

          {/* Section label */}
          {!collapsed && (
            <li
              className="list-group-item border-0 px-1 pt-2 pb-1"
              style={{
                fontSize: "0.7rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#6b7280",
                background: "transparent",
              }}
            >
              Data & Certificates
            </li>
          )}

          {/* Manage Data */}
          <button
            className="list-group-item d-flex align-items-center justify-content-between gap-2 py-2 px-2"
            onClick={() => toggleSection("manage")}
            style={{
              border: "none",
              background:
                openSection === "manage"
                  ? "rgba(255,255,255,0.9)"
                  : "transparent",
              color: "#111827",
              borderRadius: "10px",
              marginBottom: "4px",
              boxShadow:
                openSection === "manage"
                  ? "0 1px 3px rgba(15,23,42,0.18)"
                  : "none",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <FaFolderOpen size={15} />
              {!collapsed && (
                <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                  Manage Data
                </span>
              )}
            </div>
            {!collapsed &&
              (openSection === "manage" ? (
                <FaChevronUp size={12} />
              ) : (
                <FaChevronDown size={12} />
              ))}
          </button>

          {/* Manage submenu */}
          {!collapsed && openSection === "manage" && (
            <ul className="list-group border-0 ps-2 mt-1">
              {filteredTables.map((table) => {
                const key = normalized(table);
                const isActive = normalized(activeTable || "") === key;
                const icon = tableIcons[key] || tableIcons.default;

                return (
                  <li
                    key={table}
                    className="list-group-item border-0 p-0 bg-transparent"
                  >
                    <button
                      className="w-100 d-flex align-items-center gap-2 py-2"
                      style={submenuButtonStyle(isActive)}
                      onClick={() => {
                        setActiveSection?.("manage");
                        onSelectTable?.(table);
                        navigate(`${basePath}/manage/${key}`);
                        closeOnMobile();
                      }}
                    >
                      {icon}
                      <span
                        className="text-capitalize"
                        style={{ fontSize: "0.8rem" }}
                      >
                        {table.replace(/_/g, " ")}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Certificates (Admin + Teacher only, based on config) */}
          {currentConfig.showCertificates && (
            <>
              <button
                className="list-group-item d-flex align-items-center justify-content-between gap-2 py-2 px-2 mt-2"
                onClick={() => {
                  setActiveSection?.("certificates");
                  toggleSection("certificates");
                }}
                style={{
                  border: "none",
                  background:
                    openSection === "certificates"
                      ? "rgba(255,255,255,0.9)"
                      : "transparent",
                  color: "#111827",
                  borderRadius: "10px",
                  marginBottom: "4px",
                  boxShadow:
                    openSection === "certificates"
                      ? "0 1px 3px rgba(15,23,42,0.18)"
                      : "none",
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  <FaCertificate size={15} />
                  {!collapsed && (
                    <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                      Certificates
                    </span>
                  )}
                </div>
                {!collapsed &&
                  (openSection === "certificates" ? (
                    <FaChevronUp size={12} />
                  ) : (
                    <FaChevronDown size={12} />
                  ))}
              </button>

              {!collapsed && openSection === "certificates" && (
                <ul className="list-group border-0 ps-2 mt-1">
                  <li className="list-group-item border-0 p-0 bg-transparent">
                    <button
                      className="w-100 d-flex align-items-center gap-2 py-2 px-2"
                      style={submenuButtonStyle(false)}
                      onClick={() => {
                        navigate(`${basePath}/certificates/tc`);
                        closeOnMobile();
                      }}
                    >
                      <FaFileSignature size={14} />
                      <span className="small" style={{ fontSize: "0.8rem" }}>
                        Transfer Certificate
                      </span>
                    </button>
                  </li>
                  <li className="list-group-item border-0 p-0 bg-transparent">
                    <button
                      className="w-100 d-flex align-items-center gap-2 py-2 px-2"
                      style={submenuButtonStyle(false)}
                      onClick={() => {
                        navigate(`${basePath}/certificates/idcard`);
                        closeOnMobile();
                      }}
                    >
                      <FaIdCard size={14} />
                      <span className="small" style={{ fontSize: "0.8rem" }}>
                        ID Card
                      </span>
                    </button>
                  </li>
                  <li className="list-group-item border-0 p-0 bg-transparent">
                    <button
                      className="w-100 d-flex align-items-center gap-2 py-2 px-2"
                      style={submenuButtonStyle(false)}
                      onClick={() => {
                        navigate(`${basePath}/certificates/result`);
                        closeOnMobile();
                      }}
                    >
                      <FaFileAlt size={14} />
                      <span className="small" style={{ fontSize: "0.8rem" }}>
                        Result Certificate
                      </span>
                    </button>
                  </li>
                </ul>
              )}
            </>
          )}

          {/* Reports */}
          {currentConfig.showReports && (
            <>
              <button
                className="list-group-item d-flex align-items-center justify-content-between gap-2 py-2 px-2 mt-2"
                onClick={() => {
                  setActiveSection?.("reports");
                  toggleSection("reports");
                }}
                style={{
                  border: "none",
                  background:
                    openSection === "reports"
                      ? "rgba(255,255,255,0.9)"
                      : "transparent",
                  color: "#111827",
                  borderRadius: "10px",
                  marginBottom: "4px",
                  boxShadow:
                    openSection === "reports"
                      ? "0 1px 3px rgba(15,23,42,0.18)"
                      : "none",
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  <FaChartBar size={15} />
                  {!collapsed && (
                    <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                      Reports
                    </span>
                  )}
                </div>
                {!collapsed &&
                  (openSection === "reports" ? (
                    <FaChevronUp size={12} />
                  ) : (
                    <FaChevronDown size={12} />
                  ))}
              </button>

              {!collapsed && openSection === "reports" && (
                <ul className="list-group border-0 ps-2 mt-1">
                  <li className="list-group-item border-0 p-0 bg-transparent">
                    <button
                      className="w-100 d-flex align-items-center gap-2 py-2 px-2"
                      style={submenuButtonStyle(false)}
                      onClick={() => {
                        navigate(`${basePath}/reports/attendance`);
                        closeOnMobile();
                      }}
                    >
                      <FaClipboardCheck size={14} />
                      <span className="small" style={{ fontSize: "0.8rem" }}>
                        Attendance Report
                      </span>
                    </button>
                  </li>

                  <li className="list-group-item border-0 p-0 bg-transparent">
                    <button
                      className="w-100 d-flex align-items-center gap-2 py-2 px-2"
                      style={submenuButtonStyle(false)}
                      onClick={() => {
                        navigate(`${basePath}/reports/result`);
                        closeOnMobile();
                      }}
                    >
                      <FaFileAlt size={14} />
                      <span className="small" style={{ fontSize: "0.8rem" }}>
                        Result Report
                      </span>
                    </button>
                  </li>

                  {currentConfig.showFeeReport && (
                    <li className="list-group-item border-0 p-0 bg-transparent">
                      <button
                        className="w-100 d-flex align-items-center gap-2 py-2 px-2"
                        style={submenuButtonStyle(false)}
                        onClick={() => {
                          navigate(`${basePath}/reports/fees`);
                          closeOnMobile();
                        }}
                      >
                        <FaMoneyBillWave size={14} />
                        <span
                          className="small"
                          style={{ fontSize: "0.8rem" }}
                        >
                          Fee Report
                        </span>
                      </button>
                    </li>
                  )}

                  {currentConfig.showHistory && (
                    <li className="list-group-item border-0 p-0 bg-transparent">
                      <button
                        className="w-100 d-flex align-items-center gap-2 py-2 px-2"
                        style={submenuButtonStyle(false)}
                        onClick={() => {
                          navigate(`${basePath}/reports/history`);
                          closeOnMobile();
                        }}
                      >
                        <FaHistory size={14} />
                        <span
                          className="small"
                          style={{ fontSize: "0.8rem" }}
                        >
                          History / Logs
                        </span>
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </>
          )}
        </ul>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none"
          onClick={() => setIsMobileOpen(false)}
          style={{ zIndex: 1039 }}
        ></div>
      )}
    </>
  );
}
