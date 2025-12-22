import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import RequireRole from "./pages/Auth/RequireRole";

import Login from "./pages/Login/Login";
import Homepage from "./pages/Homepage";
import AdminSignUp from "./pages/AdminSignUp";
import AdminCreateUser from "./pages/AdminCreateUser";
import Navigation from "./pages/Tempelate/Navigation";

import AdminDashboard from "./pages/AdminDashboard/AdminDashboardss";
import DashboardHome from "./shared/pages/DashboardHome/DashboardHome";
import Sidebar from "./shared/components/Common/Sidebar";
import Topbar from "./shared/components/Common/Topbar";

import GenerateTc from "../src/pages/Certificates/GenerateTc";
import GenerateIdCard from "../src/pages/Certificates/GenerateIdCard";
import GenerateResult from "../src/pages/Certificates/GenerateResult";

import AttendanceReport from "./pages/Reports/AttendanceReport";
import ResultReport from "./pages/Reports/ResultReport";
import FeeReport from "./pages/Reports/FeeReport";

// QR scan attendance page
import MarkAttendanceScan from "../src/shared/pages/Attendance/MarkAttendanceScan";

// Simple placeholder for History / Logs (Admin only)
function HistoryLogs() {
  return (
    <div>
      <h2>History / Logs</h2>
      <p>Audit logs and activity history will appear here.</p>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <>
      <Navigation />
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<AdminCreateUser />} />

        {/* ================= ADMIN ROUTES ================= */}
        <Route
          path="/admin/*"
          element={
            <RequireRole role="admin">
              <AdminLayout />
            </RequireRole>
          }
        >
          {/* /admin -> dashboard */}
          <Route index element={<DashboardHome />} />

          {/* /admin/dashboard */}
          <Route path="dashboard" element={<DashboardHome />} />

          {/* Default manage (first enabled table) */}
          <Route
            path="manage"
            element={
              <AdminDashboard
                role="admin"
                title="Admin Panel"
                enabledTables={{
                  users: true,
                  profiles: true,
                  students: true,
                  teachers: true,
                  subjects: true,
                  classes: true,
                  class_schedules: true,
                  attendance: true,
                  exams: true,
                  exam_terms: true,
                  exam_subject_marks: true,
                  co_scholastic_grades: true,
                  fees: true,
                  monthly_fee_structure: true,
                  student_fee_records: true,
                  bus_routes: true,
                  library_books: true,
                  notifications: true,
                  parent_guardians: true,
                  scholar_register_entries: true,
                  student_subjects: true,
                  student_transfer_certificates: true,
                  salaries: true,
                }}
              />
            }
          />

          {/* Per-table manage via URL param */}
          <Route
            path="manage/:table"
            element={
              <AdminDashboard
                role="admin"
                title="Admin Panel"
                enabledTables={{
                  users: true,
                  profiles: true,
                  students: true,
                  teachers: true,
                  subjects: true,
                  classes: true,
                  class_schedules: true,
                  attendance: true,
                  exams: true,
                  exam_terms: true,
                  exam_subject_marks: true,
                  co_scholastic_grades: true,
                  fees: true,
                  monthly_fee_structure: true,
                  student_fee_records: true,
                  bus_routes: true,
                  library_books: true,
                  notifications: true,
                  parent_guardians: true,
                  scholar_register_entries: true,
                  student_subjects: true,
                  student_transfer_certificates: true,
                  salaries: true,
                }}
              />
            }
          />

          {/* Certificates */}
          <Route path="certificates/tc" element={<GenerateTc />} />
          <Route path="certificates/idcard" element={<GenerateIdCard />} />
          <Route path="certificates/result" element={<GenerateResult />} />

          {/* Reports */}
          <Route path="reports" element={<AttendanceReport />} />
          <Route path="reports/attendance" element={<AttendanceReport />} />
          <Route
            path="reports/result"
            element={<ResultReport role="admin" title="Admin Result Report" />}
          />
          <Route path="reports/fees" element={<FeeReport />} />
          <Route path="reports/history" element={<HistoryLogs />} />

          {/* QR Attendance Scan (ADMIN) */}
          <Route
            path="scan-attendance"
            element={<MarkAttendanceScan role="admin" />}
          />
        </Route>

        {/* ================= TEACHER ROUTES ================= */}
        <Route
          path="/teacher/*"
          element={
            <RequireRole role="teacher">
              <TeacherLayout />
            </RequireRole>
          }
        >
          {/* /teacher -> dashboard */}
          <Route index element={<DashboardHome />} />

          {/* /teacher/dashboard */}
          <Route path="dashboard" element={<DashboardHome />} />

          {/* Default manage */}
          <Route
            path="manage"
            element={
              <AdminDashboard
                role="teacher"
                title="Teacher Panel"
                enabledTables={{
                  users: false,
                  profiles: false,
                  students: true,
                  teachers: false, // set true if you want
                  subjects: true,
                  classes: true,
                  class_schedules: true,
                  attendance: true,
                  exams: false,
                  exam_terms: false,
                  exam_subject_marks: true,
                  co_scholastic_grades: true,
                  fees: false,
                  monthly_fee_structure: false,
                  student_fee_records: false,
                  bus_routes: false,
                  library_books: true,
                  notifications: false,
                  parent_guardians: false,
                  scholar_register_entries: false,
                  student_subjects: true,
                  student_transfer_certificates: false,
                  salaries: false,
                }}
              />
            }
          />

          {/* Per-table manage driven by Sidebar */}
          <Route
            path="manage/:table"
            element={
              <AdminDashboard
                role="teacher"
                title="Teacher Panel"
                enabledTables={{
                  users: false,
                  profiles: false,
                  students: true,
                  teachers: false,
                  subjects: true,
                  classes: true,
                  class_schedules: true,
                  attendance: true,
                  exams: false,
                  exam_terms: false,
                  exam_subject_marks: true,
                  co_scholastic_grades: true,
                  fees: false,
                  monthly_fee_structure: false,
                  student_fee_records: false,
                  bus_routes: false,
                  library_books: true,
                  notifications: false,
                  parent_guardians: false,
                  scholar_register_entries: false,
                  student_subjects: true,
                  student_transfer_certificates: false,
                  salaries: false,
                }}
              />
            }
          />

          {/* Certificates (to match Sidebar) */}
          <Route path="certificates/tc" element={<GenerateTc />} />
          <Route path="certificates/idcard" element={<GenerateIdCard />} />
          <Route path="certificates/result" element={<GenerateResult />} />

          {/* Reports */}
          <Route path="reports" element={<AttendanceReport />} />
          <Route path="reports/attendance" element={<AttendanceReport />} />
          <Route
            path="reports/result"
            element={
              <ResultReport role="teacher" title="Teacher Result Report" />
            }
          />
          {/* optional: <Route path="reports/fees" element={<FeeReport />} /> */}
        </Route>

        {/* ================= STUDENT ROUTES ================= */}
        <Route
          path="/student/*"
          element={
            <RequireRole role="student">
              <StudentLayout />
            </RequireRole>
          }
        >
          {/* /student -> dashboard */}
          <Route index element={<DashboardHome />} />

          {/* /student/dashboard */}
          <Route path="dashboard" element={<DashboardHome />} />

          {/* Student manage (self-related tables) */}
          <Route
            path="manage"
            element={
              <AdminDashboard
                role="student"
                title="Student Panel"
                enabledTables={{
                  users: false,
                  profiles: true,
                  students: true, // their own data
                  teachers: false,
                  subjects: true,
                  classes: false,
                  class_schedules: false,
                  attendance: true,
                  exams: false,
                  exam_terms: false,
                  exam_subject_marks: true,
                  co_scholastic_grades: false,
                  fees: true,
                  monthly_fee_structure: false,
                  student_fee_records: true,
                  bus_routes: false,
                  library_books: true,
                  notifications: false,
                  parent_guardians: false,
                  scholar_register_entries: false,
                  student_subjects: false,
                  student_transfer_certificates: false,
                  salaries: false,
                }}
              />
            }
          />

          {/* Per-table manage via URL param (student) */}
          <Route
            path="manage/:table"
            element={
              <AdminDashboard
                role="student"
                title="Student Panel"
                enabledTables={{
                  users: false,
                  profiles: true,
                  students: true,
                  teachers: false,
                  subjects: true,
                  classes: false,
                  class_schedules: false,
                  attendance: true,
                  exams: false,
                  exam_terms: false,
                  exam_subject_marks: true,
                  co_scholastic_grades: false,
                  fees: true,
                  monthly_fee_structure: false,
                  student_fee_records: true,
                  bus_routes: false,
                  library_books: true,
                  notifications: false,
                  parent_guardians: false,
                  scholar_register_entries: false,
                  student_subjects: false,
                  student_transfer_certificates: false,
                  salaries: false,
                }}
              />
            }
          />

          {/* Reports (attendance + result only) */}
          <Route path="reports" element={<AttendanceReport />} />
          <Route path="reports/attendance" element={<AttendanceReport />} />
          <Route
            path="reports/result"
            element={<ResultReport role="student" title="My Result" />}
          />
        </Route>

        {/* Admin can also create users directly */}
        <Route
          path="/admin-create-user"
          element={
            <RequireRole role="admin">
              <AdminSignUp />
            </RequireRole>
          }
        />
      </Routes>
    </>
  );
}

/* ============== ADMIN LAYOUT ============== */
function AdminLayout() {
  const [activeSection, setActiveSection] = React.useState("dashboard");
  const [activeTable, setActiveTable] = React.useState("");

  return (
    <div className="d-flex">
      <Sidebar
        role="admin"
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        activeTable={activeTable}
        onSelectTable={setActiveTable}
      />
      <div style={{ flex: 1, marginLeft: "240px" }}>
        <div className="">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

/* ============== TEACHER LAYOUT ============== */
function TeacherLayout() {
  const [activeSection, setActiveSection] = React.useState("dashboard");
  const [activeTable, setActiveTable] = React.useState("");

  return (
    <div className="d-flex">
      <Sidebar
        role="teacher"
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        activeTable={activeTable}
        onSelectTable={setActiveTable}
      />
      <div style={{ flex: 1, marginLeft: "240px" }}>
        <div className="">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

/* ============== STUDENT LAYOUT ============== */
function StudentLayout() {
  const [activeSection, setActiveSection] = React.useState("dashboard");
  const [activeTable, setActiveTable] = React.useState("");

  return (
    <div className="d-flex">
      <Sidebar
        role="student"
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        activeTable={activeTable}
        onSelectTable={setActiveTable}
      />
      <div style={{ flex: 1, marginLeft: "240px" }}>
        <div className="">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
