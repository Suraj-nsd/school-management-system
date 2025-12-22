// src/shared/Certificates/GenerateResult.jsx
import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaDownload, FaSearch, FaUserGraduate, FaSchool } from "react-icons/fa";
import { supabase } from "../../supabaseClient";

export default function GenerateResult() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]); // raw rows from "Result" table
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedExamDate, setSelectedExamDate] = useState("");
  const [search, setSearch] = useState("");

  // School config (you can later move this to settings table if needed)
  const [meta, setMeta] = useState({
    schoolName: "Sunrise Public School",
    schoolAddress: "NH-28, Main Road, Patna, Bihar - 800001",
    examName: "Annual Examination 2024-25",
    academicYear: "2024-25",
    remark: "Keep it up!",
  });

  // Load students + results from Supabase
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [{ data: studentsData, error: sErr }, { data: resultData, error: rErr }] =
          await Promise.all([
            supabase.from("students").select("*").order("id", { ascending: true }),
            supabase.from("Result").select("*").order("exam_date", { ascending: true }),
          ]);

        if (sErr) throw sErr;
        if (rErr) throw rErr;

        setStudents(studentsData || []);
        setResults(resultData || []);
      } catch (err) {
        console.error("Error loading data for result certificate:", err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // Filtered students for search dropdown
  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter((s) => {
      const name = s.name?.toLowerCase() || "";
      const email = s.email?.toLowerCase() || "";
      const cls = s.class?.toLowerCase() || "";
      return name.includes(q) || email.includes(q) || cls.includes(q);
    });
  }, [students, search]);

  const selectedStudent = useMemo(
    () => students.find((s) => String(s.id) === String(selectedStudentId)),
    [students, selectedStudentId]
  );

  // All result rows for selected student
  const studentResults = useMemo(
    () =>
      results.filter(
        (r) => String(r.student_id) === String(selectedStudentId)
      ),
    [results, selectedStudentId]
  );

  // Get distinct exam dates for that student
  const availableExamDates = useMemo(() => {
    const dates = Array.from(
      new Set(studentResults.map((r) => r.exam_date || ""))
    ).filter(Boolean);
    return dates.sort();
  }, [studentResults]);

  // Results for selected exam date (subject-wise rows)
  const examRows = useMemo(
    () =>
      studentResults.filter(
        (r) => !selectedExamDate || r.exam_date === selectedExamDate
      ),
    [studentResults, selectedExamDate]
  );

  const calcTotals = () => {
    const totalMax = examRows.reduce(
      (sum, r) => sum + (Number(r.max_marks) || 0),
      0
    );
    const totalObt = examRows.reduce(
      (sum, r) => sum + (Number(r.marks_obtained) || 0),
      0
    );
    const percent =
      totalMax > 0 ? Math.round((totalObt / totalMax) * 10000) / 100 : 0;
    return { totalMax, totalObt, percent };
  };

  const handleGenerate = () => {
    if (!selectedStudent || examRows.length === 0) return;
    const { totalMax, totalObt, percent } = calcTotals();
    const doc = new jsPDF("p", "mm", "a4");

    // Border
    doc.setDrawColor(0, 74, 173);
    doc.setLineWidth(0.6);
    doc.rect(10, 10, 190, 277);

    // Header
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 74, 173);
    doc.setFontSize(18);
    doc.text(meta.schoolName || "School Name", 105, 25, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(meta.schoolAddress || "School Address", 105, 32, {
      align: "center",
    });

    // Exam title
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text(meta.examName || "Examination", 105, 42, { align: "center" });

    // Result title
    doc.setFontSize(15);
    doc.text("RESULT / MARKSHEET", 105, 54, { align: "center" });
    doc.setLineWidth(0.3);
    doc.line(70, 56, 140, 56);

    // Student info
    const cls = selectedStudent.class || "";
    const name = selectedStudent.name || "";
    const father = selectedStudent.father_name || selectedStudent.father || "";
    const mother = selectedStudent.mother_name || selectedStudent.mother || "";
    const rollNo = selectedStudent.roll_no || selectedStudent.roll || selectedStudent.id;

    const examDate =
      selectedExamDate ||
      (examRows[0] && examRows[0].exam_date) ||
      "";

    doc.setFontSize(10);
    doc.text(`Student Name : ${name || "______________________"}`, 20, 66);
    doc.text(`Father's Name : ${father || "________________"}`, 20, 72);
    doc.text(`Mother's Name : ${mother || "________________"}`, 20, 78);

    doc.text(`Class : ${cls || "____"}`, 135, 66);
    doc.text(`Roll No. : ${rollNo || "____"}`, 135, 72);
    doc.text(`Academic Year : ${meta.academicYear || "____-____"}`, 20, 84);
    if (examDate) {
      doc.text(`Exam Date : ${examDate}`, 135, 78);
    }

    // Subjects table
    const head = [["S.No", "Subject ID", "Max Marks", "Marks Obtained", "Grade"]];
    const body = examRows.map((r, idx) => [
      idx + 1,
      r.subject_id || "",
      r.max_marks || "",
      r.marks_obtained || "",
      r.grade || "",
    ]);

    body.push([
      "",
      "Total",
      totalMax.toString(),
      totalObt.toString(),
      "",
    ]);

    doc.autoTable({
      startY: 92,
      head,
      body,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 74, 173] },
    });

    let y = doc.lastAutoTable.finalY + 8;

    // Summary
    doc.setFontSize(11);
    doc.text(`Total Marks: ${totalObt} / ${totalMax}`, 20, y);
    y += 6;
    doc.text(`Percentage: ${totalMax ? percent.toFixed(2) + " %" : "-"}`, 20, y);
    y += 6;
    doc.text(`Result: ${percent >= 33 ? "Pass" : "Fail"}`, 20, y);
    y += 6;
    doc.text(`Remarks: ${meta.remark || "-"}`, 20, y);

    // Signatures
    doc.text("Class Teacher", 30, 260);
    doc.text("Exam Incharge", 105, 260, { align: "center" });
    doc.text("Principal", 180, 260, { align: "right" });

    const fileName = `Result_${name || "student"}.pdf`;
    doc.save(fileName);
  };

  const { totalMax, totalObt, percent } = calcTotals();

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
            Loading result data…
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
            Certificates
          </div>
          <h2 className="mb-1 fw-bold" style={{ fontSize: "1.3rem" }}>
            Result Certificate
          </h2>
          <p className="mb-0" style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            Select a student & exam from backend marks and download a marksheet.
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
          <FaSchool size={26} />
        </div>
      </div>

      <div className="row g-4">
        {/* Left: Controls */}
        <div className="col-12 col-lg-7">
          <div
            className="bg-white rounded-4 shadow-sm p-3 p-md-4"
            style={{ border: "1px solid rgba(148,163,184,0.35)" }}
          >
            <h5 className="fw-bold mb-3" style={{ color: "#004aad" }}>
              School & Exam Details
            </h5>
            <div className="row g-3 mb-3">
              <div className="col-12">
                <label className="form-label small fw-semibold">
                  School Name
                </label>
                <input
                  className="form-control"
                  name="schoolName"
                  value={meta.schoolName}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, schoolName: e.target.value }))
                  }
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">
                  School Address
                </label>
                <input
                  className="form-control"
                  name="schoolAddress"
                  value={meta.schoolAddress}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, schoolAddress: e.target.value }))
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Exam Name
                </label>
                <input
                  className="form-control"
                  name="examName"
                  value={meta.examName}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, examName: e.target.value }))
                  }
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">
                  Academic Year
                </label>
                <input
                  className="form-control"
                  name="academicYear"
                  value={meta.academicYear}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, academicYear: e.target.value }))
                  }
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-semibold">
                  Remark
                </label>
                <input
                  className="form-control"
                  name="remark"
                  value={meta.remark}
                  onChange={(e) =>
                    setMeta((m) => ({ ...m, remark: e.target.value }))
                  }
                  placeholder="Keep it up!"
                />
              </div>
            </div>

            <h5 className="fw-bold mb-3 mt-2" style={{ color: "#004aad" }}>
              Select Student
            </h5>
            <div className="row g-3 mb-3">
              <div className="col-12">
                <label className="form-label small fw-semibold">
                  Search by name, email, class
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <FaSearch className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type to filter students..."
                  />
                </div>
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">
                  Student
                </label>
                <select
                  className="form-select"
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    setSelectedExamDate("");
                  }}
                >
                  <option value="">Choose student</option>
                  {filteredStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.class ? `(${s.class})` : ""} –{" "}
                      {s.email || "N/A"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedStudent && (
              <>
                <h5 className="fw-bold mb-3 mt-2" style={{ color: "#004aad" }}>
                  Exam & Marks
                </h5>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">
                      Exam Date
                    </label>
                    <select
                      className="form-select"
                      value={selectedExamDate}
                      onChange={(e) => setSelectedExamDate(e.target.value)}
                    >
                      <option value="">All exams for this student</option>
                      {availableExamDates.map((d) => (
                        <option key={d} value={d}>
                          {new Date(d).toLocaleDateString("en-IN")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">
                      Summary
                    </label>
                    <div className="border rounded px-3 py-2 bg-light">
                      <div style={{ fontSize: "0.78rem" }}>
                        Total: {totalObt} / {totalMax}
                      </div>
                      <div style={{ fontSize: "0.78rem" }}>
                        Percentage:{" "}
                        {totalMax ? `${percent.toFixed(2)} %` : "-"}
                      </div>
                      <div style={{ fontSize: "0.78rem" }}>
                        Result: {totalMax ? (percent >= 33 ? "Pass" : "Fail") : "-"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-primary d-flex align-items-center gap-2"
                    disabled={examRows.length === 0}
                    onClick={handleGenerate}
                    style={{
                      borderRadius: 999,
                      paddingInline: "1.5rem",
                      background:
                        "linear-gradient(135deg, #004aad 0%, #0077ff 70%)",
                      borderColor: "transparent",
                      fontWeight: 600,
                    }}
                  >
                    <FaDownload />
                    Download Result PDF
                  </button>
                </div>
              </>
            )}

            {!selectedStudent && (
              <p className="text-muted small mt-3 mb-0">
                Select a student to view available exam records and generate
                marksheet.
              </p>
            )}
          </div>
        </div>

        {/* Right: Preview */}
        <div className="col-12 col-lg-5">
          <div
            className="bg-white rounded-4 shadow-sm p-3 p-md-4 h-100"
            style={{
              border: "1px dashed rgba(148,163,184,0.7)",
              backgroundImage:
                "linear-gradient(135deg, rgba(0,74,173,0.03), rgba(0,119,255,0.03))",
            }}
          >
            <h6 className="fw-bold mb-3" style={{ color: "#004aad" }}>
              Preview (Summary)
            </h6>
            <div
              className="border rounded-4 p-3 bg-white"
              style={{ minHeight: 260, fontSize: "0.8rem" }}
            >
              <div className="text-center mb-2">
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "0.95rem",
                    color: "#111827",
                  }}
                >
                  {meta.schoolName}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                  {meta.examName}
                </div>
                <hr className="mt-2 mb-2" />
              </div>

              <p className="mb-1">
                <strong>Student:</strong>{" "}
                {selectedStudent?.name || "__________"}
              </p>
              <p className="mb-1">
                <strong>Class:</strong>{" "}
                {selectedStudent?.class || "___"}
              </p>
              <p className="mb-1">
                <strong>Total:</strong> {totalObt} / {totalMax}
              </p>
              <p className="mb-1">
                <strong>Percentage:</strong>{" "}
                {totalMax ? `${percent.toFixed(2)} %` : "—"}
              </p>
              <p className="mb-1">
                <strong>Result:</strong>{" "}
                {totalMax ? (percent >= 33 ? "Pass" : "Fail") : "—"}
              </p>
              <p className="mb-1">
                <strong>Remark:</strong> {meta.remark}
              </p>

              <div className="mt-4 d-flex justify-content-between">
                <span style={{ fontSize: "0.7rem" }}>Class Teacher</span>
                <span style={{ fontSize: "0.7rem" }}>Exam Incharge</span>
                <span style={{ fontSize: "0.7rem" }}>Principal</span>
              </div>
            </div>

            {!selectedStudent && (
              <p className="text-muted small mt-3 mb-0">
                Preview updates automatically when you choose a student and exam.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
