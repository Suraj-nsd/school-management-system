import React from "react";
import { supabase } from "../supabaseClient";
import { ResultCard } from "./ResultCard";
import { ResultForm } from "./ResultForm";

export function ResultModule({
  studentId,         // optional: show one student's consolidated card
  schoolMeta,        // optional: { name, address, phone }
  allowEdit = true,  // toggle for teacher/admin
}) {
  const [students, setStudents] = React.useState([]);
  const [subjects, setSubjects] = React.useState([]);
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [selectedStudentId, setSelectedStudentId] = React.useState(studentId || "");
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const [{ data: sd }, { data: subd }] = await Promise.all([
        supabase.from("students").select("id,name,email,class").order("id", { ascending: true }),
        supabase.from("subjects").select("id,name,code").order("id", { ascending: true }),
      ]);
      setStudents(sd || []);
      setSubjects(subd || []);

      if (studentId || selectedStudentId) {
        const targetId = studentId || selectedStudentId;
        const { data: rd } = await supabase
          .from("Result")
          .select("id,student_id,subject_id,marks_obtained,max_marks,grade,remarks,exam_date")
          .eq("student_id", targetId)
          .order("exam_date", { ascending: true });
        setResults(rd || []);
      } else {
        setResults([]);
      }
      setError("");
    } catch (e) {
      setError(e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [studentId, selectedStudentId]);

  React.useEffect(() => { load(); }, [load]);

  const submitResult = async (payload) => {
    try {
      setSaving(true);
      // Upsert on unique (student_id, subject_id, exam_date) if you create such constraint, otherwise insert
      const { error } = await supabase.from("Result").insert([payload]);
      if (error) throw error;
      await load();
      alert("Result saved");
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const currentStudent = React.useMemo(
    () => students.find(s => s.id === (studentId || selectedStudentId)),
    [students, studentId, selectedStudentId]
  );

  const resultRows = React.useMemo(() => {
    return results.map(r => ({
      ...r,
      subject: subjects.find(su => su.id === r.subject_id) || null,
    }));
  }, [results, subjects]);

  return (
    <div className="bg-white rounded shadow-sm p-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
        <h5 className="mb-0 fw-bold">Result Manager</h5>
        <div className="d-flex gap-2">
          {!studentId && (
            <select
              className="form-select"
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(Number(e.target.value))}
              style={{ minWidth: 240 }}
            >
              <option value="">Select Student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} • {s.class}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-muted">Loading…</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          {allowEdit && (
            <div className="mb-4">
              <h6 className="fw-semibold mb-3">Add/Update Result</h6>
              <ResultForm
                students={studentId ? students.filter(s => s.id === studentId) : students}
                subjects={subjects}
                onSubmit={submitResult}
                submitting={saving}
              />
            </div>
          )}

          {currentStudent && (
            <ResultCard
              school={schoolMeta}
              student={currentStudent}
              results={resultRows}
            />
          )}
        </>
      )}
    </div>
  );
}
