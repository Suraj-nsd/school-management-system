import { supabase } from "./supabaseClient";

// Fetch students with role = 'student'
export async function fetchStudents() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("role", "student")
    .order("full_name", { ascending: true });
  if (error) throw error;
  return data;
}



// Fetch attendance for a student within optional date range
export async function fetchAttendance(studentId, startDate, endDate) {
  let query = supabase
    .from("attendance")
    .select("*")
    .eq("student_id", studentId)
    .order("date", { ascending: false });

  if (startDate) query = query.gte("date", startDate);
  if (endDate) query = query.lte("date", endDate);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Fetch test results for a student within optional date range
export async function fetchTestResults(studentId, startDate, endDate) {
  let query = supabase
    .from("test_results")
    .select("*")
    .eq("student_id", studentId)
    .order("test_date", { ascending: false });

  if (startDate) query = query.gte("test_date", startDate);
  if (endDate) query = query.lte("test_date", endDate);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Add or update attendance record (upsert)
export async function upsertAttendance(record) {
  const { data, error } = await supabase
    .from("attendance")
    .upsert(record, { onConflict: "student_id,date" });
  if (error) throw error;
  return data;
}

// Add or update test result record (upsert)
export async function upsertTestResult(record) {
  const { data, error } = await supabase
    .from("test_results")
    .upsert(record, { onConflict: "student_id,test_date,subject" });
  if (error) throw error;
  return data;
}
