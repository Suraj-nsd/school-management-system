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
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaPlus,
  FaSearch,
  FaSortUp,
  FaSortDown,
  FaSort,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
} from "react-icons/fa";

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

  // USER FORM
  const {
    control: controlUser,
    handleSubmit: handleSubmitUser,
    reset: resetUser,
    formState: { errors: errorsUser, isSubmitting: isSubmittingUser },
  } = useForm({
    defaultValues: { username: "", password: "", role: "student" },
  });

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
  const renderForm = () => {
    switch (currentTable) {
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

      case "students":
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
              Admission Form
            </h4>
            {/* keep your full admission form fields here */}
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
        {/* Page header ribbon */}
        <div
          className="rounded-4 shadow-sm mb-4 text-white"
          style={{
            padding: "1.25rem 1.5rem",
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
              {title}
            </div>
            <h2 className="mb-1 fw-bold" style={{ fontSize: "1.3rem" }}>
              {prettyTable}
            </h2>
            <p
              className="mb-0"
              style={{ fontSize: "0.85rem", opacity: 0.85 }}
            >
              Manage {prettyTable} records · Total:{" "}
              {tableInstance.getFilteredRowModel().rows.length} items
            </p>
          </div>
          <button
            className="btn btn-light fw-semibold d-flex align-items-center gap-2"
            onClick={() => setShowAddForm((prev) => !prev)}
            type="button"
            disabled={role === "student"}
            style={{
              borderRadius: 999,
              paddingInline: "1.2rem",
              paddingBlock: "0.5rem",
              boxShadow: "0 4px 12px rgba(15,23,42,0.35)",
              fontSize: "0.9rem",
            }}
          >
            <FaPlus />
            <span>Add New</span>
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div
            className="mb-4"
            style={{
              backgroundColor: "#fff",
              borderRadius: 18,
              padding: "1.5rem",
              boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
              border: "1px solid rgba(148,163,184,0.4)",
            }}
          >
            <h5
              className="mb-3 fw-bold"
              style={{ color: "#004aad", fontSize: "1rem" }}
            >
              Add New {prettyTable}
            </h5>
            {renderForm()}
          </div>
        )}

        {/* Result module (if you still use "Result" table somewhere) */}
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

        {/* Search + Table Card */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 18,
            padding: "1.25rem 1.25rem 1rem",
            boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
            border: "1px solid rgba(148,163,184,0.4)",
          }}
        >
          {/* Search */}
          <div className="mb-3">
            <div
              className="input-group"
              style={{
                borderRadius: 999,
                overflow: "hidden",
                boxShadow: "0 4px 10px rgba(15,23,42,0.06)",
              }}
            >
              <span
                className="input-group-text border-0"
                style={{
                  backgroundColor: "#f3f4ff",
                  color: "#6b7280",
                }}
              >
                <FaSearch />
              </span>
              <input
                type="search"
                className="form-control border-0"
                placeholder={`Search in ${prettyTable}…`}
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                autoComplete="off"
                style={{
                  fontSize: "0.95rem",
                  backgroundColor: "#f9fafb",
                }}
              />
            </div>
            <small className="text-muted mt-2 d-block">
              Showing {tableInstance.getRowModel().rows.length} of{" "}
              {tableInstance.getFilteredRowModel().rows.length} records
            </small>
          </div>

          {/* Data Grid */}
          <div
            className="table-responsive"
            style={{
              maxHeight: "60vh",
              overflowY: "auto",
              borderRadius: 14,
              border: "1px solid rgba(209,213,219,0.8)",
            }}
          >
            <table className="table align-middle mb-0">
              <thead
                className="text-white position-sticky top-0"
                style={{
                  background:
                    "linear-gradient(135deg, #004aad 0%, #0077ff 60%, #37a4ff 100%)",
                  zIndex: 10,
                }}
              >
                {tableInstance.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        style={{
                          width: header.column.columnDef.size,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          fontSize: "0.75rem",
                          letterSpacing: "0.06em",
                          cursor: header.column.getCanSort()
                            ? "pointer"
                            : "default",
                          userSelect: "none",
                          borderBottom: "none",
                          paddingBlock: "0.6rem",
                          whiteSpace: "nowrap",
                        }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="d-flex align-items-center gap-2">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                          {header.column.getCanSort() && (
                            <span>
                              {
                                {
                                  asc: <FaSortUp />,
                                  desc: <FaSortDown />,
                                }[header.column.getIsSorted()] || (
                                  <FaSort className="opacity-50" />
                                )
                              }
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {tableInstance.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="text-center py-5 text-muted"
                    >
                      <div>
                        <FaSearch
                          size={40}
                          className="mb-3"
                          style={{ opacity: 0.2 }}
                        />
                        <p className="mb-0 fw-semibold">No data found</p>
                        <small>Try adjusting your search criteria</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tableInstance.getRowModel().rows.map((row) => (
                    <React.Fragment key={row.id}>
                      <tr
                        onClick={() =>
                          setExpandedRow((prev) =>
                            prev === row.id ? null : row.id
                          )
                        }
                        style={{
                          transition: "background-color 0.18s",
                          cursor: "pointer",
                          backgroundColor:
                            expandedRow === row.id
                              ? "rgba(219,234,254,0.7)"
                              : "transparent",
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            style={{
                              verticalAlign: "middle",
                              fontSize: "0.86rem",
                              borderTop: "1px solid rgba(229,231,235,0.8)",
                            }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>

                      {expandedRow === row.id && (
                        <tr>
                          <td
                            colSpan={columns.length}
                            className="bg-light"
                            style={{
                              padding: "1rem 1.25rem 1.1rem",
                              borderTop: "1px solid rgba(209,213,219,0.8)",
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <h6
                                className="fw-bold mb-0"
                                style={{ color: "#004aad" }}
                              >
                                Details · {row.original.name || "Record"}
                              </h6>
                              <button
                                className="btn btn-outline-primary btn-sm"
                                onClick={() =>
                                  handleDownloadPDF(row.original)
                                }
                                type="button"
                                style={{ borderRadius: 999 }}
                              >
                                <FaDownload className="me-2" />
                                Download PDF
                              </button>
                            </div>

                            <div className="row">
                              {Object.entries(row.original).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="col-md-6 mb-2"
                                    style={{ fontSize: "0.85rem" }}
                                  >
                                    <strong className="text-capitalize">
                                      {key.replace(/_/g, " ")}:
                                    </strong>{" "}
                                    <span>
                                      {value === null
                                        ? "—"
                                        : value.toString()}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">Rows per page:</span>
              <select
                className="form-select form-select-sm"
                value={tableInstance.getState().pagination.pageSize}
                onChange={(e) =>
                  tableInstance.setPageSize(Number(e.target.value))
                }
                style={{ width: 90, borderRadius: 999 }}
              >
                {[5, 10, 20, 50, 100].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className="text-muted small">
                Page {tableInstance.getState().pagination.pageIndex + 1} of{" "}
                {tableInstance.getPageCount()}
              </span>
              <div className="btn-group">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => tableInstance.previousPage()}
                  disabled={!tableInstance.getCanPreviousPage()}
                  style={{ borderRadius: "999px 0 0 999px" }}
                >
                  <FaChevronLeft />
                </button>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => tableInstance.nextPage()}
                  disabled={!tableInstance.getCanNextPage()}
                  style={{ borderRadius: "0 999px 999px 0" }}
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editRow && (
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
          onClick={() => setEditRow(null)}
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
                  onClick={() => setEditRow(null)}
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
                              handleEditChange(key, e.target.value)
                            }
                            placeholder={`Enter ${key.replace(/_/g, " ")}`}
                            disabled={getPkFieldsForTable(editRow.table).includes(
                              key
                            )}
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
                  onClick={() => setEditRow(null)}
                  style={{ borderRadius: 999 }}
                >
                  <FaTimes className="me-2" />
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleEditSave}
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
      )}

      {/* Delete Modal */}
      {confirmDelete.open && (
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
          onClick={() =>
            setConfirmDelete({
              open: false,
              table: "",
              filter: null,
            })
          }
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
                  onClick={() =>
                    setConfirmDelete({
                      open: false,
                      table: "",
                      filter: null,
                    })
                  }
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
                  onClick={() =>
                    setConfirmDelete({
                      open: false,
                      table: "",
                      filter: null,
                    })
                  }
                  style={{ borderRadius: 999 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  style={{ borderRadius: 999 }}
                >
                  <FaTrash className="me-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div
          className={`toast align-items-center text-white border-0 show position-fixed top-0 start-50 translate-middle-x mt-3 shadow-lg`}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={{
            zIndex: 1200,
            borderRadius: 999,
            backgroundColor:
              snackbar.severity === "success" ? "#16a34a" : "#dc2626",
          }}
        >
          <div className="d-flex">
            <div className="toast-body fw-semibold">
              {snackbar.message}
            </div>
            <button
              type="button"
              className="btn-close btn-close-white me-2 m-auto"
              aria-label="Close"
              onClick={() =>
                setSnackbar((prev) => ({
                  ...prev,
                  open: false,
                }))
              }
            ></button>
          </div>
        </div>
      )}
    </div>
  );
}
