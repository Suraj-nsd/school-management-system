// src/shared/pages/AdminDashboard/AdminDashboard.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { FaEdit, FaTrash } from "react-icons/fa";

import { supabase } from "../../supabaseClient";
import { ResultModule } from "../../shared/shared/ResultModule";
import {
  initialDataState,
  fetchAll,
  updateRecord,
  deleteRecord,
  insertRecord,
  columnsByTable,
} from "./AdminDashboardLogic";
import { useAuth } from "../Auth/AuthContext";

// 🔹 NEW small components
import AdminHeader from "./components/AdminHeader";
import AddRecordPanel from "./components/AddRecordPanel";
import AdminTableToolbar from "./components/AdminTableToolbar";
import AdminDataTable from "./components/AdminDataTable";
import EditRecordModal from "./components/EditRecordModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import SnackbarToast from "./components/SnackbarToast";
import UserForm from "./components/UserForm";
import StudentAdmissionForm from "./components/StudentAdmissionForm";

// ---- PK helpers (match AdminDashboardLogic.js schema) ----
const PRIMARY_KEYS = {
  users: ["id"],
  profiles: ["id"],
  students: ["student_id"],
  teachers: ["teacher_code"],
  subjects: ["code"],
  classes: ["name"],
  class_schedules: ["class_name", "subject_code", "day_of_week", "start_time"],
  attendance: ["student_id", "attendance_date"],
  exams: ["exam_id"],
  exam_terms: ["term_name", "session_year"],
  exam_subject_marks: ["student_id", "term_name", "session_year", "subject_code"],
  co_scholastic_grades: ["student_id", "term_name", "session_year"],
  fees: ["fee_id"],
  monthly_fee_structure: ["fee_code"],
  student_fee_records: ["record_id"],
  bus_routes: ["route_name"],
  library_books: ["isbn"],
  notifications: ["notification_id"],
  parent_guardians: ["student_id", "relationship", "name"],
  scholar_register_entries: ["student_id", "academic_year"],
  student_subjects: ["student_id", "subject_code"],
  student_transfer_certificates: ["student_id", "tc_number"],
  salaries: ["teacher_code", "month"],
};

const getPkFieldsForTable = (table) => PRIMARY_KEYS[table] || ["id"];

const getPkFilter = (table, row) => {
  const keys = getPkFieldsForTable(table);
  const filter = {};
  keys.forEach((k) => {
    if (row[k] !== undefined) {
      filter[k] = row[k];
    }
  });
  return filter;
};

export default function AdminDashboard({
  role = "admin",
  enabledTables,
  title = "Admin Panel",
  table,
}) {
  const { profile } = useAuth(); // optional
  const { table: routeTable } = useParams(); // /admin/manage/:table

  const [globalFilter, setGlobalFilter] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [data, setData] = useState(initialDataState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    table: "",
    filter: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // USER FORM (react-hook-form)
  const {
    control: controlUser,
    handleSubmit: handleSubmitUser,
    reset: resetUser,
    formState: { errors: errorsUser, isSubmitting: isSubmittingUser },
  } = useForm({
    defaultValues: { username: "", password: "", role: "student" },
  });

  // 🔹 PDF download for expanded row
  const handleDownloadPDF = useCallback((record) => {
    const doc = new jsPDF();
    const pdfTitle = record.name || "Record Details";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(pdfTitle, 14, 20);

    const pdfData = Object.entries(record).map(([key, value]) => [
      key.replace(/_/g, " ").toUpperCase(),
      value === null ? "—" : value.toString(),
    ]);

    doc.autoTable({
      startY: 30,
      head: [["Field", "Value"]],
      body: pdfData,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 74, 173] },
    });

    const fileName = `${pdfTitle.replace(/\s+/g, "_")}_details.pdf`;
    doc.save(fileName);
  }, []);

  const showSnackbar = useCallback((message, severity) => {
    setSnackbar({ open: true, message, severity });
    setTimeout(
      () =>
        setSnackbar({
          open: false,
          message: "",
          severity: "success",
        }),
      3000
    );
  }, []);

  // FETCH DATA
  const fetchAllData = useCallback(
    async () => {
      try {
        setLoading(true);
        const allTables = Object.keys(initialDataState);
        const tablesToLoad = enabledTables
          ? allTables.filter((t) => enabledTables[t])
          : allTables;

        const newData = await fetchAll(tablesToLoad);
        setData((prev) => ({ ...prev, ...newData }));
        setError(null);
      } catch (err) {
        const msg = err.message || "Failed to fetch data";
        setError(msg);
        showSnackbar(msg, "danger");
      } finally {
        setLoading(false);
      }
    },
    [enabledTables, showSnackbar]
  );

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // VISIBLE TABLES based on enabledTables
  const visibleTables = useMemo(() => {
    const all = Object.keys(data);
    if (!enabledTables) return all;
    return all.filter((t) => enabledTables[t]);
  }, [data, enabledTables]);

  // choose currentTable: URL param -> prop -> first visible
  const currentTable = useMemo(() => {
    if (routeTable && visibleTables.includes(routeTable)) return routeTable;
    if (table && visibleTables.includes(table)) return table;
    return visibleTables[0];
  }, [routeTable, table, visibleTables]);

  const rows = useMemo(
    () =>
      currentTable ? (data[currentTable] || []).map((row) => ({ ...row })) : [],
    [data, currentTable]
  );

  // ACTION column
  const actionColumn = useMemo(
    () => ({
      id: "actions",
      header: "",
      size: 110,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-sm"
            onClick={() =>
              setEditRow({
                table: currentTable,
                row: row.original,
              })
            }
            aria-label="Edit record"
            type="button"
            disabled={role === "student"}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(37,99,235,0.4)",
              color: "#1d4ed8",
              background: "rgba(219,234,254,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
            }}
          >
            <FaEdit size={12} />
          </button>
          <button
            className="btn btn-sm"
            onClick={() =>
              setConfirmDelete({
                open: true,
                table: currentTable,
                filter: getPkFilter(currentTable, row.original),
              })
            }
            aria-label="Delete record"
            type="button"
            disabled={role !== "admin"}
            style={{
              borderRadius: 999,
              border: "1px solid rgba(220,38,38,0.3)",
              color: "#b91c1c",
              background: "rgba(254,226,226,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 30,
              height: 30,
            }}
          >
            <FaTrash size={12} />
          </button>
        </div>
      ),
    }),
    [currentTable, role]
  );

  const columns = useMemo(() => {
    const baseColumns = columnsByTable[currentTable] || [];
    return [...baseColumns, actionColumn];
  }, [currentTable, actionColumn]);

  const tableInstance = useReactTable({
    data: rows,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleEditChange = useCallback((key, value) => {
    setEditRow((prev) =>
      !prev ? null : { ...prev, row: { ...prev.row, [key]: value } }
    );
  }, []);

  const handleEditSave = useCallback(async () => {
    if (!editRow) return;
    try {
      const pkFields = getPkFieldsForTable(editRow.table);
      await updateRecord(editRow.table, editRow.row, pkFields);
      setEditRow(null);
      showSnackbar("Record updated successfully", "success");
      await fetchAllData();
    } catch (err) {
      showSnackbar("Update error: " + err.message, "danger");
    }
  }, [editRow, showSnackbar, fetchAllData]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteRecord(confirmDelete.table, confirmDelete.filter || {});
      setConfirmDelete({ open: false, table: "", filter: null });
      showSnackbar("Record deleted successfully", "success");
      await fetchAllData();
    } catch (err) {
      showSnackbar("Delete error: " + err.message, "danger");
    }
  }, [confirmDelete, showSnackbar, fetchAllData]);

  const onSubmitUser = useCallback(
    async (values) => {
      try {
        await insertRecord("users", values);
        resetUser();
        setShowAddForm(false);
        showSnackbar("User created successfully", "success");
        await fetchAllData();
      } catch (err) {
        showSnackbar("Error: " + err.message, "danger");
      }
    },
    [resetUser, showSnackbar, fetchAllData]
  );

  // FORMS
  // FORMS
const renderForm = () => {
  switch (currentTable) {
    // 👉 USERS TABLE (same idea as before)
    case "users":
      if (role !== "admin") {
        return (
          <p className="text-muted fst-italic mb-0">
            Only admin can create users.
          </p>
        );
      }

      return (
        <form onSubmit={handleSubmitUser(onSubmitUser)} noValidate>
          <div className="mb-3">
            <label htmlFor="username" className="form-label fw-semibold">
              Username
            </label>
            <Controller
              name="username"
              control={controlUser}
              rules={{ required: "Username required" }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  className={`form-control ${
                    errorsUser.username ? "is-invalid" : ""
                  }`}
                  id="username"
                  placeholder="Enter username"
                />
              )}
            />
            <div className="invalid-feedback">
              {errorsUser.username?.message}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <Controller
              name="password"
              control={controlUser}
              rules={{
                required: "Password required",
                minLength: {
                  value: 6,
                  message: "Min length 6",
                },
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="password"
                  className={`form-control ${
                    errorsUser.password ? "is-invalid" : ""
                  }`}
                  id="password"
                  placeholder="Enter password"
                />
              )}
            />
            <div className="invalid-feedback">
              {errorsUser.password?.message}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="role" className="form-label fw-semibold">
              Role
            </label>
            <Controller
              name="role"
              control={controlUser}
              render={({ field }) => (
                <select {...field} className="form-select" id="role">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              )}
            />
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary flex-grow-1"
              disabled={isSubmittingUser}
              style={{
                background:
                  "linear-gradient(135deg, #004aad 0%, #0077ff 70%)",
                borderColor: "transparent",
                borderRadius: 10,
                fontWeight: 600,
              }}
            >
              {isSubmittingUser ? "Creating…" : "Create User"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowAddForm(false)}
              style={{ borderRadius: 10 }}
            >
              Cancel
            </button>
          </div>
        </form>
      );

    // 👉 STUDENTS TABLE – Add New Student
    case "students":
      return (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.target);
            const values = Object.fromEntries(form.entries());

            // convert "" to null
            Object.keys(values).forEach((key) => {
              if (values[key] === "") values[key] = null;
            });

            try {
              // optional: unique email check
              if (values.email) {
                const { data: existing, error: checkError } = await supabase
                  .from("students")
                  .select("email")
                  .eq("email", values.email)
                  .maybeSingle();

                if (checkError) throw checkError;
                if (existing) {
                  showSnackbar(
                    "A student with this email already exists!",
                    "danger"
                  );
                  return;
                }
              }

              await insertRecord("students", values);
              showSnackbar("Student added successfully", "success");
              e.target.reset();
              setShowAddForm(false);
              await fetchAllData();
            } catch (err) {
              showSnackbar("Insert error: " + err.message, "danger");
            }
          }}
          className="p-4 border rounded bg-white"
          style={{
            borderRadius: 16,
            borderColor: "rgba(148,163,184,0.5)",
            boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
          }}
        >
          <h4
            className="mb-4 fw-bold text-center"
            style={{
              color: "#004aad",
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              fontSize: "0.9rem",
            }}
          >
            Add New Student
          </h4>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Student ID</label>
              <input
                name="student_id"
                className="form-control"
                placeholder="AUTO / manual"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Full Name</label>
              <input
                name="name"
                className="form-control"
                placeholder="Student name"
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Class</label>
              <input
                name="class_name"
                className="form-control"
                placeholder="e.g. 5, 6, 10"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Section</label>
              <input
                name="section"
                className="form-control"
                placeholder="A / B / C"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Roll No.</label>
              <input
                name="roll_number"
                className="form-control"
                placeholder="Roll number"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Date of Birth</label>
              <input name="dob" type="date" className="form-control" />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Gender</label>
              <select name="gender" className="form-select">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                name="email"
                type="email"
                className="form-control"
                placeholder="Email"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">
                Parent Phone Number
              </label>
              <input
                name="phone"
                className="form-control"
                placeholder="10-digit number"
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Address</label>
              <textarea
                name="address"
                className="form-control"
                rows={2}
                placeholder="Full address"
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label fw-semibold">Admission Date</label>
              <input
                name="admission_date"
                type="date"
                className="form-control"
              />
            </div>

            <div className="col-md-3 mb-3">
              <label className="form-label fw-semibold">Status</label>
              <select name="status" className="form-select">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Student
            </button>
          </div>
        </form>
      );

    // 👉 TEACHERS TABLE – Add New Teacher
    case "teachers":
      return (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.target);
            const values = Object.fromEntries(form.entries());

            Object.keys(values).forEach((key) => {
              if (values[key] === "") values[key] = null;
            });

            try {
              // optional: unique email check for teachers
              if (values.email) {
                const { data: existing, error: checkError } = await supabase
                  .from("teachers")
                  .select("email")
                  .eq("email", values.email)
                  .maybeSingle();

                if (checkError) throw checkError;
                if (existing) {
                  showSnackbar(
                    "A teacher with this email already exists!",
                    "danger"
                  );
                  return;
                }
              }

              await insertRecord("teachers", values);
              showSnackbar("Teacher added successfully", "success");
              e.target.reset();
              setShowAddForm(false);
              await fetchAllData();
            } catch (err) {
              showSnackbar("Insert error: " + err.message, "danger");
            }
          }}
          className="p-4 border rounded bg-white"
          style={{
            borderRadius: 16,
            borderColor: "rgba(148,163,184,0.5)",
            boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
          }}
        >
          <h4
            className="mb-4 fw-bold text-center"
            style={{
              color: "#004aad",
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              fontSize: "0.9rem",
            }}
          >
            Add New Teacher
          </h4>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Teacher Code</label>
              <input
                name="teacher_code"
                className="form-control"
                placeholder="Unique code"
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Full Name</label>
              <input
                name="name"
                className="form-control"
                placeholder="Teacher name"
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Primary Subject</label>
              <input
                name="subject"
                className="form-control"
                placeholder="e.g. Math, English"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                name="email"
                type="email"
                className="form-control"
                placeholder="Email"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Phone</label>
              <input
                name="phone"
                className="form-control"
                placeholder="Phone number"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Date of Joining</label>
              <input
                name="hire_date"
                type="date"
                className="form-control"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Gender</label>
              <select name="gender" className="form-select">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Salary</label>
              <input
                name="salary"
                type="number"
                step="0.01"
                className="form-control"
                placeholder="Monthly salary"
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label fw-semibold">Status</label>
              <select name="status" className="form-select">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="col-md-12 mb-3">
              <label className="form-label fw-semibold">Address</label>
              <textarea
                name="address"
                className="form-control"
                rows={2}
                placeholder="Full address"
              />
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Teacher
            </button>
          </div>
        </form>
      );

    default:
      return (
        <p className="text-muted fst-italic mb-0">
          Adding records for this table is not yet supported.
        </p>
      );
  }
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
            Loading data…
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, #fee2e2 0, #fef2f2 40%, #fee2e2 100%)",
        }}
      >
        <div
          className="shadow p-4 rounded-3"
          style={{
            maxWidth: 480,
            backgroundColor: "#fff",
            borderLeft: "4px solid #dc2626",
          }}
        >
          <h4 className="fw-bold mb-2" style={{ color: "#b91c1c" }}>
            Something went wrong
          </h4>
          <p className="mb-3 text-muted">{error}</p>
          <button
            className="btn btn-danger"
            onClick={fetchAllData}
            style={{ borderRadius: 10 }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const prettyTable =
    currentTable &&
    currentTable.charAt(0).toUpperCase() +
      currentTable.slice(1).replace(/_/g, " ");

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f4f6fb 0%, #edf2ff 40%, #f9fafb 100%)",
      }}
    >
      <div className="container-fluid py-4 px-3 px-md-4">
        {/* 🔹 Header component */}
        <AdminHeader
          title={title}
          prettyTable={prettyTable}
          totalCount={tableInstance.getFilteredRowModel().rows.length}
          onToggleAdd={() => setShowAddForm((prev) => !prev)}
          addDisabled={role === "student"}
        />

        {/* 🔹 Add Form panel */}
        {showAddForm && (
          <AddRecordPanel prettyTable={prettyTable}>
            {renderForm()}
          </AddRecordPanel>
        )}

        {/* 🔹 Result module */}
        {currentTable === "Result" && (
          <div
            className="mb-4"
            style={{
              backgroundColor: "#fff",
              borderRadius: 18,
              padding: "1.25rem",
              boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
              border: "1px solid rgba(148,163,184,0.3)",
            }}
          >
            <ResultModule allowEdit={role !== "student"} />
          </div>
        )}

        {/* 🔹 Search + Table Card */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 18,
            padding: "1.25rem 1.25rem 1rem",
            boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
            border: "1px solid rgba(148,163,184,0.4)",
          }}
        >
          <AdminTableToolbar
            prettyTable={prettyTable}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            visibleCount={tableInstance.getRowModel().rows.length}
            totalCount={tableInstance.getFilteredRowModel().rows.length}
          />

          <AdminDataTable
            tableInstance={tableInstance}
            columnsLength={columns.length}
            expandedRow={expandedRow}
            onRowToggle={(id) =>
              setExpandedRow((prev) => (prev === id ? null : id))
            }
            onDownloadPDF={handleDownloadPDF}
          />
        </div>
      </div>

      {/* 🔹 Edit Modal */}
      <EditRecordModal
        editRow={editRow}
        onClose={() => setEditRow(null)}
        onChangeField={handleEditChange}
        onSave={handleEditSave}
        getPkFieldsForTable={getPkFieldsForTable}
      />

      {/* 🔹 Delete Modal */}
      <DeleteConfirmModal
        open={confirmDelete.open}
        onCancel={() =>
          setConfirmDelete({ open: false, table: "", filter: null })
        }
        onConfirm={handleDelete}
      />

      {/* 🔹 Snackbar */}
      <SnackbarToast
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() =>
          setSnackbar((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />
    </div>
  );
}
