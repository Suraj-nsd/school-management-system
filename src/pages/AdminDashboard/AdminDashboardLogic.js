// src/shared/pages/AdminDashboard/AdminDashboardLogic.js 
import { supabase } from "../../supabaseClient";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper();

export const initialDataState = {
  users: [],
  profiles: [],
  students: [],
  teachers: [],
  subjects: [],
  classes: [],
  class_schedules: [],
  attendance: [],
  exams: [],
  exam_terms: [],
  exam_subject_marks: [],
  co_scholastic_grades: [],
  fees: [],
  monthly_fee_structure: [],
  student_fee_records: [],
  bus_routes: [],
  library_books: [],
  notifications: [],
  parent_guardians: [],
  scholar_register_entries: [],
  student_subjects: [],
  student_transfer_certificates: [],
  salaries: [],
};

// Fetch all tables data with error handling
// Map of default order column per table (only where it exists)
const TABLE_ORDER_FIELD = {
  users: "id",
  profiles: "created_at",
  students: "created_at",
  teachers: "created_at",
  subjects: "code",
  classes: "name",
  class_schedules: "created_at",
  attendance: "attendance_date",
  exams: "exam_id",
  exam_terms: "term_name",
  exam_subject_marks: "created_at",
  co_scholastic_grades: "created_at",
  fees: "fee_id",
  monthly_fee_structure: "fee_code",
  student_fee_records: "record_id",
  bus_routes: "route_name",
  library_books: "added_date",
  notifications: "created_at",
  parent_guardians: "created_at",
  scholar_register_entries: "created_at",
  student_subjects: "enrolled_date",
  student_transfer_certificates: "created_at",
  salaries: "month",
};

// Fetch all tables data with error handling
export async function fetchAll(tables) {
  try {
    const results = await Promise.all(
      tables.map(async (table) => {
        // Build base query
        let query = supabase.from(table).select("*");

        // Add ordering if we have a known column
        const orderField = TABLE_ORDER_FIELD[table];
        if (orderField) {
          query = query.order(orderField, { ascending: true });
        }

        const { data, error } = await query;

        if (error) {
          console.error(`Error fetching ${table}:`, error.message);
          throw error;
        }

        return data ?? [];
      })
    );

    const newData = {};
    tables.forEach((table, i) => {
      newData[table] = results[i];
    });

    return newData;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error(error.message || "Failed to fetch data");
  }
}


// Update record
export async function updateRecord(table, row, pkFields = ["id"]) {
  try {
    let query = supabase.from(table).update(row);

    // Build composite PK filter if needed
    pkFields.forEach((field) => {
      if (row[field] !== undefined) {
        query = query.eq(field, row[field]);
      }
    });

    const { error } = await query;
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error updating record:", error);
    throw new Error(error.message || "Failed to update record");
  }
}

// Delete record
export async function deleteRecord(table, filter) {
  // filter: { id } or composite key like { student_id, attendance_date }
  try {
    let query = supabase.from(table).delete();

    Object.entries(filter || {}).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { error } = await query;
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error deleting record:", error);
    throw new Error(error.message || "Failed to delete record");
  }
}

// Insert record
export async function insertRecord(table, values) {
  try {
    const { error } = await supabase.from(table).insert([values]);
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error inserting record:", error);
    throw new Error(error.message || "Failed to insert record");
  }
}

// Status badge renderer for attendance
const renderAttendanceStatus = (status) => {
  const statusLower = status?.toLowerCase() || "";
  let color = "#6c757d";

  if (statusLower === "present") color = "#28a745";
  else if (statusLower === "absent") color = "#dc3545";
  else if (statusLower === "leave") color = "#fd7e14";

  return (
    <div className="d-flex align-items-center gap-2">
      <span
        style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          backgroundColor: color,
          display: "inline-block",
          boxShadow: `0 0 0 3px ${color}20`,
        }}
      ></span>
      <span className="fw-semibold text-capitalize">{status || "-"}</span>
    </div>
  );
};

const renderBooleanBadge = (value, labels = ["Yes", "No"]) => {
  const isTrue = Boolean(value);
  return (
    <span className={`badge ${isTrue ? "bg-success" : "bg-secondary"}`}>
      {isTrue ? labels[0] : labels[1]}
    </span>
  );
};

// Format date helper
const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Format datetime helper
const formatDateTime = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Helper column for serial numbers (no DB field)
const serialColumn = columnHelper.display({
  id: "serial",
  header: "S.No",
  size: 70,
  cell: (info) => info.row.index + 1,
  enableSorting: false,
});

// Column definitions
export const columnsByTable = {
  // ========== USERS ==========
  users: [
    serialColumn,
    columnHelper.accessor("id", {
      header: "ID",
      size: 80,
    }),
    columnHelper.accessor("username", {
      header: "Username",
      size: 180,
      enableSorting: true,
    }),
    columnHelper.accessor("full_name", {
      header: "Full Name",
      size: 200,
    }),
    columnHelper.accessor("email", {
      header: "Email",
      size: 240,
    }),
    columnHelper.accessor("role", {
      header: "Role",
      size: 130,
      enableSorting: true,
      cell: (info) => (
        <span
          className={`badge ${
            info.getValue() === "admin"
              ? "bg-danger"
              : info.getValue() === "teacher"
              ? "bg-primary"
              : "bg-success"
          }`}
        >
          {info.getValue()?.toUpperCase() || "-"}
        </span>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: "Created At",
      size: 180,
      cell: (info) => formatDateTime(info.getValue()),
    }),
  ],

  // ========== PROFILES (auth-linked) ==========
  profiles: [
    serialColumn,
    columnHelper.accessor("id", {
      header: "User UUID",
      size: 260,
    }),
    columnHelper.accessor("username", {
      header: "Username",
      size: 180,
    }),
    columnHelper.accessor("full_name", {
      header: "Full Name",
      size: 220,
    }),
    columnHelper.accessor("role", {
      header: "Role",
      size: 130,
      cell: (info) => (
        <span
          className={`badge ${
            info.getValue() === "admin"
              ? "bg-danger"
              : info.getValue() === "teacher"
              ? "bg-primary"
              : "bg-success"
          }`}
        >
          {info.getValue()?.toUpperCase() || "-"}
        </span>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: "Created At",
      size: 180,
      cell: (info) => formatDateTime(info.getValue()),
    }),
  ],

  // ========== STUDENTS ==========
  students: [
    serialColumn,
    columnHelper.accessor("student_id", {
      header: "Student ID",
      size: 160,
    }),
    columnHelper.accessor("roll_number", {
      header: "Roll No.",
      size: 110,
    }),
    columnHelper.accessor("name", {
      header: "Name",
      size: 200,
      enableSorting: true,
    }),
    columnHelper.accessor("class_name", {
      header: "Class",
      size: 130,
      cell: (info) => (
        <span className="badge bg-info text-dark">
          {info.getValue() || "-"}
        </span>
      ),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      size: 240,
    }),
    columnHelper.accessor("phone_number", {
      header: "Phone",
      size: 160,
    }),
    columnHelper.accessor("village", {
      header: "Village",
      size: 160,
    }),
    columnHelper.accessor("division", {
      header: "Division",
      size: 120,
    }),
    columnHelper.accessor("bus_enabled", {
      header: "Bus",
      size: 100,
      cell: (info) => renderBooleanBadge(info.getValue(), ["Enabled", "No"]),
    }),
    columnHelper.accessor("is_verified", {
      header: "Verified",
      size: 120,
      cell: (info) =>
        renderBooleanBadge(info.getValue(), ["Verified", "Pending"]),
    }),
    columnHelper.accessor("dob", {
      header: "DOB",
      size: 130,
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("admission_date", {
      header: "Admission",
      size: 140,
      cell: (info) => formatDate(info.getValue()),
    }),
  ],

  // ========== TEACHERS ==========
  teachers: [
    serialColumn,
    columnHelper.accessor("teacher_code", {
      header: "Teacher Code",
      size: 130,
    }),
    columnHelper.accessor("name", {
      header: "Name",
      size: 200,
    }),
    columnHelper.accessor("email", {
      header: "Email",
      size: 240,
    }),
    columnHelper.accessor("subject_code", {
      header: "Subject Code",
      size: 140,
      cell: (info) => (
        <code className="bg-light px-2 py-1 rounded">
          {info.getValue() || "-"}
        </code>
      ),
    }),
    columnHelper.accessor("dob", {
      header: "DOB",
      size: 130,
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("qualification", {
      header: "Qualification",
      size: 200,
    }),
    columnHelper.accessor("experience_years", {
      header: "Experience",
      size: 120,
      cell: (info) => `${info.getValue() || 0} yrs`,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: 120,
      cell: (info) => {
        const value = info.getValue();
        const isActive = value?.toLowerCase() === "active";
        return (
          <span className={`badge ${isActive ? "bg-success" : "bg-secondary"}`}>
            {value || "-"}
          </span>
        );
      },
    }),
    columnHelper.accessor("salary", {
      header: "Salary",
      size: 130,
      cell: (info) =>
        info.getValue() != null ? (
          <strong>₹{Number(info.getValue()).toLocaleString("en-IN")}</strong>
        ) : (
          "-"
        ),
    }),
    columnHelper.accessor("created_at", {
      header: "Created At",
      size: 180,
      cell: (info) => formatDateTime(info.getValue()),
    }),
  ],

  // ========== SUBJECTS ==========
  subjects: [
    serialColumn,
    columnHelper.accessor("code", {
      header: "Code",
      size: 130,
      cell: (info) => (
        <code className="bg-light px-2 py-1 rounded">
          {info.getValue() || "-"}
        </code>
      ),
    }),
    columnHelper.accessor("name", {
      header: "Subject Name",
      size: 260,
    }),
    columnHelper.accessor("credits", {
      header: "Credits",
      size: 100,
    }),
    columnHelper.accessor("active", {
      header: "Active",
      size: 110,
      cell: (info) => renderBooleanBadge(info.getValue()),
    }),
    columnHelper.accessor("description", {
      header: "Description",
      size: 320,
    }),
  ],

  // ========== CLASSES ==========
  classes: [
    serialColumn,
    columnHelper.accessor("name", {
      header: "Class Name",
      size: 180,
    }),
    columnHelper.accessor("class_level", {
      header: "Level",
      size: 120,
    }),
    columnHelper.accessor("class_teacher_code", {
      header: "Class Teacher Code",
      size: 160,
    }),
    columnHelper.accessor("created_at", {
      header: "Created At",
      size: 180,
      cell: (info) => formatDateTime(info.getValue()),
    }),
  ],

  // ========== CLASS SCHEDULES ==========
  class_schedules: [
    serialColumn,
    columnHelper.accessor("class_name", {
      header: "Class",
      size: 140,
    }),
    columnHelper.accessor("subject_code", {
      header: "Subject Code",
      size: 140,
    }),
    columnHelper.accessor("teacher_code", {
      header: "Teacher Code",
      size: 140,
    }),
    columnHelper.accessor("day_of_week", {
      header: "Day",
      size: 130,
    }),
    columnHelper.accessor("start_time", {
      header: "Start Time",
      size: 130,
    }),
    columnHelper.accessor("end_time", {
      header: "End Time",
      size: 130,
    }),
    columnHelper.accessor("created_at", {
      header: "Created At",
      size: 180,
      cell: (info) => formatDateTime(info.getValue()),
    }),
  ],

  // ========== ATTENDANCE ==========
  attendance: [
    serialColumn,
    columnHelper.accessor("student_id", {
      header: "Student ID",
      size: 160,
    }),
    columnHelper.accessor("attendance_date", {
      header: "Date",
      size: 140,
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: 150,
      cell: (info) => renderAttendanceStatus(info.getValue()),
    }),
    columnHelper.accessor("remarks", {
      header: "Remarks",
      size: 220,
    }),
    columnHelper.accessor("created_at", {
      header: "Created At",
      size: 180,
      cell: (info) => formatDateTime(info.getValue()),
    }),
  ],

  // ========== EXAMS ==========
  exams: [
    serialColumn,
    columnHelper.accessor("exam_id", {
      header: "Exam ID",
      size: 100,
    }),
    columnHelper.accessor("name", {
      header: "Exam Name",
      size: 260,
    }),
    columnHelper.accessor("start_date", {
      header: "Start Date",
      size: 140,
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("end_date", {
      header: "End Date",
      size: 140,
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("description", {
      header: "Description",
      size: 260,
    }),
    columnHelper.accessor("created_at", {
      header: "Created At",
      size: 180,
      cell: (info) => formatDateTime(info.getValue()),
    }),
  ],

  // ========== EXAM TERMS ==========
  exam_terms: [
    serialColumn,
    columnHelper.accessor("term_name", {
      header: "Term",
      size: 180,
    }),
    columnHelper.accessor("session_year", {
      header: "Session Year",
      size: 140,
    }),
  ],

  // ========== EXAM SUBJECT MARKS ==========
  exam_subject_marks: [
    serialColumn,
    columnHelper.accessor("student_id", {
      header: "Student ID",
      size: 160,
    }),
    columnHelper.accessor("term_name", {
      header: "Term",
      size: 140,
    }),
    columnHelper.accessor("session_year", {
      header: "Session",
      size: 120,
    }),
    columnHelper.accessor("subject_code", {
      header: "Subject Code",
      size: 140,
    }),
    columnHelper.accessor("max_marks", {
      header: "Max",
      size: 100,
    }),
    columnHelper.accessor("obtained_marks", {
      header: "Marks",
      size: 100,
      cell: (info) => <strong>{info.getValue() ?? "-"}</strong>,
    }),
    columnHelper.accessor("grade", {
      header: "Grade",
      size: 100,
      cell: (info) => {
        const grade = info.getValue();
        const colorMap = {
          A: "success",
          B: "primary",
          C: "warning",
          D: "danger",
          F: "dark",
        };
        return (
          <span className={`badge bg-${colorMap[grade] || "secondary"}`}>
            {grade || "-"}
          </span>
        );
      },
    }),
    columnHelper.accessor("result", {
      header: "Result",
      size: 120,
    }),
    columnHelper.accessor("created_at", {
      header: "Created At",
      size: 180,
      cell: (info) => formatDateTime(info.getValue()),
    }),
  ],

  // ========== CO-SCHOLASTIC GRADES ==========
  co_scholastic_grades: [
    serialColumn,
    columnHelper.accessor("student_id", {
      header: "Student ID",
      size: 160,
    }),
    columnHelper.accessor("term_name", {
      header: "Term",
      size: 140,
    }),
    columnHelper.accessor("session_year", {
      header: "Session",
      size: 120,
    }),
    columnHelper.accessor("work_education", {
      header: "Work Edu.",
      size: 140,
    }),
    columnHelper.accessor("arts_education", {
      header: "Arts Edu.",
      size: 140,
    }),
    columnHelper.accessor("physical_education", {
      header: "Physical Edu.",
      size: 160,
    }),
    columnHelper.accessor("behaviour_values", {
      header: "Behaviour",
      size: 180,
    }),
    columnHelper.accessor("regularity", {
      header: "Regularity",
      size: 140,
    }),
    columnHelper.accessor("attitude_teachers", {
      header: "Attitude (Teachers)",
      size: 200,
    }),
    columnHelper.accessor("created_at", {
      header: "Created At",
      size: 180,
      cell: (info) => formatDateTime(info.getValue()),
    }),
  ],

  // ========== FEES ==========
  fees: [
    serialColumn,
    columnHelper.accessor("fee_id", {
      header: "Fee ID",
      size: 100,
    }),
    columnHelper.accessor("student_id", {
      header: "Student ID",
      size: 160,
    }),
    columnHelper.accessor("fee_type", {
      header: "Fee Type",
      size: 160,
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      size: 140,
      cell: (info) =>
        info.getValue() != null ? (
          <strong>₹{Number(info.getValue()).toLocaleString("en-IN")}</strong>
        ) : (
          "-"
        ),
    }),
    columnHelper.accessor("due_date", {
      header: "Due Date",
      size: 140,
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("payment_date", {
      header: "Payment Date",
      size: 150,
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: 120,
      cell: (info) => {
        const value = info.getValue();
        const map = {
          Paid: "success",
          Unpaid: "danger",
          Partial: "warning",
        };
        return (
          <span className={`badge bg-${map[value] || "secondary"}`}>
            {value || "-"}
          </span>
        );
      },
    }),
    columnHelper.accessor("remarks", {
      header: "Remarks",
      size: 220,
    }),
  ],

  // ========== MONTHLY FEE STRUCTURE ==========
  monthly_fee_structure: [
    serialColumn,
    columnHelper.accessor("fee_code", {
      header: "Fee Code",
      size: 100,
    }),
    columnHelper.accessor("month_name", {
      header: "Month",
      size: 140,
    }),
    columnHelper.accessor("fee_description", {
      header: "Description",
      size: 260,
    }),
    columnHelper.accessor("base_fee", {
      header: "Base Fee",
      size: 140,
      cell: (info) =>
        info.getValue() != null ? (
          <strong>₹{Number(info.getValue()).toLocaleString("en-IN")}</strong>
        ) : (
          "-"
        ),
    }),
    columnHelper.accessor("bus_fee", {
      header: "Bus Fee",
      size: 140,
      cell: (info) =>
        info.getValue() != null ? (
          <strong>₹{Number(info.getValue()).toLocaleString("en-IN")}</strong>
        ) : (
          "-"
        ),
    }),
  ],

  // ========== STUDENT FEE RECORDS ==========
  student_fee_records: [
    serialColumn,
    columnHelper.accessor("record_id", {
      header: "Record ID",
      size: 110,
    }),
    columnHelper.accessor("student_id", {
      header: "Student ID",
      size: 160,
    }),
    columnHelper.accessor("fee_code", {
      header: "Fee Code",
      size: 120,
    }),
    columnHelper.accessor("paid_amount", {
      header: "Paid",
      size: 120,
      cell: (info) =>
        info.getValue() != null ? (
          <strong>₹{Number(info.getValue()).toLocaleString("en-IN")}</strong>
        ) : (
          "-"
        ),
    }),
    columnHelper.accessor("discount", {
      header: "Discount",
      size: 120,
      cell: (info) =>
        info.getValue() != null ? (
          <strong>₹{Number(info.getValue()).toLocaleString("en-IN")}</strong>
        ) : (
          "-"
        ),
    }),
    columnHelper.accessor("fine", {
      header: "Fine",
      size: 100,
      cell: (info) =>
        info.getValue() != null ? (
          <strong>₹{Number(info.getValue()).toLocaleString("en-IN")}</strong>
        ) : (
          "-"
        ),
    }),
    columnHelper.accessor("due_amount", {
      header: "Due",
      size: 120,
      cell: (info) =>
        info.getValue() != null ? (
          <strong>₹{Number(info.getValue()).toLocaleString("en-IN")}</strong>
        ) : (
          "-"
        ),
    }),
    columnHelper.accessor("payment_date", {
      header: "Payment Date",
      size: 150,
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("receipt_number", {
      header: "Receipt No.",
      size: 140,
    }),
  ],

  // ========== BUS ROUTES ==========
  bus_routes: [
    serialColumn,
    columnHelper.accessor("route_name", {
      header: "Route Name",
      size: 220,
    }),
    columnHelper.accessor("village", {
      header: "Village",
      size: 220,
    }),
    columnHelper.accessor("bus_charge", {
      header: "Bus Charge",
      size: 140,
      cell: (info) =>
        info.getValue() != null ? (
          <strong>₹{Number(info.getValue()).toLocaleString("en-IN")}</strong>
        ) : (
          "-"
        ),
    }),
    columnHelper.accessor("created_at", {
      header: "Created At",
      size: 180,
      cell: (info) => formatDateTime(info.getValue()),
    }),
  ],

  // ========== LIBRARY BOOKS ==========
  library_books: [
    serialColumn,
    columnHelper.accessor("isbn", {
      header: "ISBN",
      size: 180,
    }),
    columnHelper.accessor("title", {
      header: "Title",
      size: 260,
    }),
    columnHelper.accessor("author", {
      header: "Author",
      size: 200,
    }),
    columnHelper.accessor("published_year", {
      header: "Year",
      size: 100,
    }),
    columnHelper.accessor("category", {
      header: "Category",
      size: 160,
    }),
    columnHelper.accessor("copies_available", {
      header: "Available",
      size: 120,
    }),
    columnHelper.accessor("total_copies", {
      header: "Total",
      size: 100,
    }),
    columnHelper.accessor("added_date", {
      header: "Added Date",
      size: 140,
      cell: (info) => formatDate(info.getValue()),
    }),
  ],

  // ========== NOTIFICATIONS ==========
  notifications: [
    serialColumn,
    columnHelper.accessor("notification_id", {
      header: "ID",
      size: 80,
    }),
    columnHelper.accessor("title", {
      header: "Title",
      size: 260,
    }),
    columnHelper.accessor("message", {
      header: "Message",
      size: 360,
    }),
    columnHelper.accessor("recipient_type", {
      header: "Recipient Type",
      size: 160,
    }),
    columnHelper.accessor("recipient_id", {
      header: "Recipient ID",
      size: 160,
    }),
    columnHelper.accessor("is_read", {
      header: "Read",
      size: 100,
      cell: (info) => renderBooleanBadge(info.getValue(), ["Yes", "No"]),
    }),
    columnHelper.accessor("created_at", {
      header: "Created At",
      size: 180,
      cell: (info) => formatDateTime(info.getValue()),
    }),
  ],

  // ========== PARENT / GUARDIANS ==========
  parent_guardians: [
    serialColumn,
    columnHelper.accessor("student_id", {
      header: "Student ID",
      size: 160,
    }),
    columnHelper.accessor("name", {
      header: "Name",
      size: 220,
    }),
    columnHelper.accessor("relationship", {
      header: "Relationship",
      size: 160,
    }),
    columnHelper.accessor("phone_number", {
      header: "Phone",
      size: 160,
    }),
    columnHelper.accessor("email", {
      header: "Email",
      size: 220,
    }),
    columnHelper.accessor("address", {
      header: "Address",
      size: 260,
    }),
  ],

  // ========== SCHOLAR REGISTER ENTRIES ==========
  scholar_register_entries: [
    serialColumn,
    columnHelper.accessor("student_id", {
      header: "Student ID",
      size: 160,
    }),
    columnHelper.accessor("academic_year", {
      header: "Academic Year",
      size: 140,
    }),
    columnHelper.accessor("class_name", {
      header: "Class",
      size: 120,
    }),
    columnHelper.accessor("date_admission", {
      header: "Admission Date",
      size: 150,
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("date_promotion", {
      header: "Promotion Date",
      size: 150,
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("date_removal", {
      header: "Removal Date",
      size: 150,
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("cause_removal", {
      header: "Cause of Removal",
      size: 240,
    }),
    columnHelper.accessor("conduct", {
      header: "Conduct",
      size: 160,
    }),
    columnHelper.accessor("work", {
      header: "Work",
      size: 160,
    }),
    columnHelper.accessor("signature", {
      header: "Signature",
      size: 160,
    }),
  ],

  // ========== STUDENT SUBJECTS ==========
  student_subjects: [
    serialColumn,
    columnHelper.accessor("student_id", {
      header: "Student ID",
      size: 160,
    }),
    columnHelper.accessor("subject_code", {
      header: "Subject Code",
      size: 160,
    }),
    columnHelper.accessor("enrolled_date", {
      header: "Enrolled Date",
      size: 150,
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      size: 130,
      cell: (info) => {
        const value = info.getValue();
        let color = "secondary";
        if (value === "Active") color = "success";
        else if (value === "Inactive") color = "secondary";
        else if (value === "Completed") color = "primary";
        return <span className={`badge bg-${color}`}>{value || "-"}</span>;
      },
    }),
    columnHelper.accessor("remarks", {
      header: "Remarks",
      size: 220,
    }),
  ],

  // ========== STUDENT TRANSFER CERTIFICATES ==========
  student_transfer_certificates: [
    serialColumn,
    columnHelper.accessor("student_id", {
      header: "Student ID",
      size: 160,
    }),
    columnHelper.accessor("tc_number", {
      header: "TC Number",
      size: 160,
    }),
    columnHelper.accessor("admission_file_no", {
      header: "Admission File No",
      size: 180,
    }),
    columnHelper.accessor("withdrawal_file_no", {
      header: "Withdrawal File No",
      size: 180,
    }),
    columnHelper.accessor("register_number", {
      header: "Register No",
      size: 160,
    }),
    columnHelper.accessor("dob", {
      header: "DOB",
      size: 130,
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("dob_in_words", {
      header: "DOB (Words)",
      size: 260,
    }),
    columnHelper.accessor("prepared_by", {
      header: "Prepared By",
      size: 180,
    }),
    columnHelper.accessor("prepared_date", {
      header: "Prepared Date",
      size: 150,
      cell: (info) => formatDate(info.getValue()),
    }),
    columnHelper.accessor("head_of_institution", {
      header: "Head of Institution",
      size: 220,
    }),
  ],

  // ========== SALARIES ==========
  salaries: [
    serialColumn,
    columnHelper.accessor("teacher_code", {
      header: "Teacher Code",
      size: 160,
    }),
    columnHelper.accessor("month", {
      header: "Month",
      size: 140,
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      size: 160,
      cell: (info) =>
        info.getValue() != null ? (
          <strong>₹{Number(info.getValue()).toLocaleString("en-IN")}</strong>
        ) : (
          "-"
        ),
    }),
  ],
};

export const getTableNames = () => Object.keys(initialDataState);
