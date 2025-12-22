// src/shared/Certificates/GenerateResult.jsx
import React, { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  FaDownload,
  FaSearch,
  FaUserGraduate,
  FaSchool,
} from "react-icons/fa";
import QRCode from "qrcode"; // ✅ npm install qrcode
import { supabase } from "../../supabaseClient";

// Central school defaults (no random city now)
const SCHOOL_DEFAULTS = {
  schoolName: "Sunrise Public School",
  // You told me earlier this should be the real location
  schoolAddress: "Sunrise Public School, Barhalganj, Gorakhpur, Uttar Pradesh",
  examName: "Annual Examination 2024-25",
  academicYear: "2024-25",
  remark: "Keep it up!",
};

export default function GenerateResult() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]); // raw rows from "Result" table

  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedExamDate, setSelectedExamDate] = useState("");

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");

  // School config (can later come from a settings table)
  const [meta, setMeta] = useState(SCHOOL_DEFAULTS);
  const getStudentKey = (s) => String(s.student_id ?? s.id)

  // Load students + results from Supabase
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

       const [
  { data: studentsData, error: sErr },
  { data: resultData, error: rErr },
] = await Promise.all([
  supabase
    .from("students")
    .select("*")
    .order("student_id", { ascending: true }), // or "id" if you really have id
  supabase
    .from("Result")
    .select("*")
    .order("exam_date", { ascending: true }),
]);

        if (sErr) throw sErr;
        if (rErr) throw rErr;

        setStudents(studentsData || []);
        setResults(resultData || []);

        // Try to auto-fill exam meta from first row if available
        if ((resultData || []).length > 0) {
          const first = resultData[0];
          setMeta((prev) => ({
            ...prev,
            examName: first.exam_name || prev.examName,
            academicYear: first.session_year || prev.academicYear,
          }));
        }
      } catch (err) {
        console.error("Error loading data for result certificate:", err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // 🔹 Unique class & section options from students table
  const classOptions = useMemo(() => {
    const set = new Set();
    students.forEach((s) => {
      const cls = s.class || s.class_name;
      if (cls) set.add(cls);
    });
    return Array.from(set).sort();
  }, [students]);

  const sectionOptions = useMemo(() => {
    const set = new Set();
    students.forEach((s) => {
      const sec = s.section || s.section_name;
      if (sec) set.add(sec);
    });
    return Array.from(set).sort();
  }, [students]);

  // 🔹 Filtered students for search dropdown
  const filteredStudents = useMemo(() => {
    let list = [...students];

    // Filter by class & section first
    if (classFilter) {
      list = list.filter(
        (s) => (s.class || s.class_name || "") === classFilter
      );
    }
    if (sectionFilter) {
      list = list.filter(
        (s) => (s.section || s.section_name || "") === sectionFilter
      );
    }

    // Search text
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => {
        const name = s.name?.toLowerCase() || "";
        const email = s.email?.toLowerCase() || "";
        const cls = (s.class || s.class_name || "").toLowerCase();
        const roll =
          (String(s.roll_no || s.roll || s.id || "") || "").toLowerCase();
        const phone = (s.phone || s.parent_phone || "").toLowerCase();
        return (
          name.includes(q) ||
          email.includes(q) ||
          cls.includes(q) ||
          roll.includes(q) ||
          phone.includes(q)
        );
      });
    }

    return list;
  }, [students, search, classFilter, sectionFilter]);

  const selectedStudent = useMemo(
  () => students.find((s) => getStudentKey(s) === String(selectedStudentId)),
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

  // 🔹 Generate PDF with QR
  const handleGenerate = async () => {
    if (!selectedStudent || examRows.length === 0) return;
    const { totalMax, totalObt, percent } = calcTotals();
    const doc = new jsPDF("p", "mm", "a4");

    const cls = selectedStudent.class || selectedStudent.class_name || "";
    const name = selectedStudent.name || "";
    const father = selectedStudent.father_name || selectedStudent.father || "";
    const mother = selectedStudent.mother_name || selectedStudent.mother || "";
    const rollNo =
      selectedStudent.roll_no || selectedStudent.roll || selectedStudent.id;
    const section =
      selectedStudent.section || selectedStudent.section_name || "";
    const examDate =
      selectedExamDate || (examRows[0] && examRows[0].exam_date) || "";

    // 🔹 QR code data (verification URL - use current origin as base if possible)
    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "https://sunrise-school.in";

    const verifyUrl = `${origin}/verify?sid=${
      selectedStudent.student_id || selectedStudent.id
    }&exam=${encodeURIComponent(examDate || "")}`;

    let qrDataUrl = null;
    try {
      qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: 256,
        margin: 1,
      });
    } catch (e) {
      console.error("QR generation error:", e);
    }

    // ====== BRAND FRAME / BORDER ======
    doc.setDrawColor(0, 74, 173);
    doc.setLineWidth(0.6);
    doc.rect(10, 10, 190, 277); // outer border

    // Soft background band at top
    doc.setFillColor(230, 239, 255);
    doc.rect(10, 10, 190, 28, "F");

    // ====== HEADER ======
    // Logo placeholder
    doc.setDrawColor(0, 74, 173);
    doc.setLineWidth(0.4);
    doc.circle(25, 24, 8);
    doc.setFontSize(10);
    doc.setTextColor(0, 74, 173);
    doc.text("SPS", 25, 24, { align: "center", baseline: "middle" });

    // School name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 74, 173);
    doc.text(meta.schoolName || "School Name", 105, 22, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(meta.schoolAddress || "School Address", 105, 28, {
      align: "center",
    });

    // Exam title + academic year
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(meta.examName || "Examination", 105, 36, { align: "center" });
    doc.setFontSize(10);
    doc.text(
      `Academic Year: ${meta.academicYear || "____-____"}`,
      105,
      42,
      { align: "center" }
    );

    // Result title
    doc.setFontSize(14);
    doc.text("MARKSHEET / RESULT CERTIFICATE", 105, 52, {
      align: "center",
    });
    doc.setLineWidth(0.3);
    doc.line(55, 54, 155, 54);

    // ====== STUDENT INFO BOX ======
    doc.setFillColor(245, 248, 255);
    doc.roundedRect(14, 58, 182, 26, 2, 2, "F");

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.text(`Student Name : ${name || "______________________"}`, 18, 64);
    doc.text(`Father's Name : ${father || "________________"}`, 18, 70);
    doc.text(`Mother's Name : ${mother || "________________"}`, 18, 76);

    doc.text(`Class : ${cls || "____"}`, 120, 64);
    doc.text(`Section : ${section || "-"}`, 120, 70);
    doc.text(`Roll No. : ${rollNo || "____"}`, 120, 76);

    if (examDate) {
      doc.text(`Exam Date : ${examDate}`, 18, 82);
    }

    // ====== SUBJECT TABLE ======
    const head = [["S.No", "Subject", "Max Marks", "Marks Obtained", "Grade"]];
    const body = examRows.map((r, idx) => [
      idx + 1,
      r.subject_id || r.subject_name || "",
      r.max_marks || "",
      r.marks_obtained || "",
      r.grade || "",
    ]);

    // Total row highlighted
    body.push(["", "Total", totalMax.toString(), totalObt.toString(), ""]);

    doc.autoTable({
      startY: 90,
      head,
      body,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [0, 74, 173],
        textColor: [255, 255, 255],
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.row.index === body.length - 1) {
          // last row = total
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [235, 243, 255];
        }
      },
    });

    let y = doc.lastAutoTable.finalY + 8;

    // ====== SUMMARY BOX ======
    doc.setFillColor(245, 248, 255);
    doc.roundedRect(14, y - 4, 100, 28, 2, 2, "F");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    doc.text(`Total Marks: ${totalObt} / ${totalMax}`, 18, y);
    y += 6;
    doc.text(
      `Percentage: ${totalMax ? percent.toFixed(2) + " %" : "-"}`,
      18,
      y
    );
    y += 6;
    doc.text(
      `Result: ${totalMax ? (percent >= 33 ? "Pass" : "Fail") : "-"}`,
      18,
      y
    );
    y += 6;
    doc.text(`Remarks: ${meta.remark || "-"}`, 18, y);

    // ====== QR CODE AREA ======
    if (qrDataUrl) {
      const qrSize = 32; // mm
      const qrX = 170 - qrSize; // right side
      const qrY = 210;

      doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      doc.text("Scan to verify", qrX + qrSize / 2, qrY + qrSize + 5, {
        align: "center",
      });
    }

    // ====== SIGNATURE LINES ======
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    doc.text("Class Teacher", 35, 268, { align: "center" });
    doc.text("Exam Incharge", 105, 268, { align: "center" });
    doc.text("Principal", 175, 268, { align: "center" });

    // small underline
    doc.setLineWidth(0.2);
    doc.line(20, 262, 50, 262);
    doc.line(90, 262, 120, 262);
    doc.line(160, 262, 190, 262);

    const safeName = name || "student";
    const fileName = `Result_${safeName.replace(/\s+/g, "_")}.pdf`;
    doc.save(fileName);
  };

  const { totalMax, totalObt, percent } = calcTotals();

  // Simple helpers for UI chips
  const totalStudents = students.length;
  const totalResultRows = results.length;
  const distinctExamDates = useMemo(
    () =>
      Array.from(new Set(results.map((r) => r.exam_date || ""))).filter(Boolean)
        .length,
    [results]
  );

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
            Result Marksheet with QR
          </h2>
          <p
            className="mb-0"
            style={{ fontSize: "0.85rem", opacity: 0.85 }}
          >
            Search a student, choose an exam and download a QR-enabled
            marksheet.
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

      {/* Small top stats using data (no hard-coded counts) */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-md-4">
          <div className="bg-white rounded-4 shadow-sm p-3 d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{ width: 40, height: 40, background: "#eff6ff" }}
            >
              <FaUserGraduate className="text-primary" />
            </div>
            <div>
              <div className="text-muted small">Students</div>
              <div className="fw-bold">{totalStudents}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="bg-white rounded-4 shadow-sm p-3 d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{ width: 40, height: 40, background: "#ecfdf3" }}
            >
              <span role="img" aria-label="exam">
                📝
              </span>
            </div>
            <div>
              <div className="text-muted small">Distinct Exam Dates</div>
              <div className="fw-bold">{distinctExamDates}</div>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-4">
          <div className="bg-white rounded-4 shadow-sm p-3 d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-3"
              style={{ width: 40, height: 40, background: "#fff7ed" }}
            >
              <span role="img" aria-label="rows">
                📄
              </span>
            </div>
            <div>
              <div className="text-muted small">Result Rows</div>
              <div className="fw-bold">{totalResultRows}</div>
            </div>
          </div>
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
              {/* Filters row: class & section */}
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Class
                </label>
                <select
                  className="form-select"
                  value={classFilter}
                  onChange={(e) => {
                    setClassFilter(e.target.value);
                    setSelectedStudentId("");
                    setSelectedExamDate("");
                  }}
                >
                  <option value="">All</option>
                  {classOptions.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Section
                </label>
                <select
                  className="form-select"
                  value={sectionFilter}
                  onChange={(e) => {
                    setSectionFilter(e.target.value);
                    setSelectedStudentId("");
                    setSelectedExamDate("");
                  }}
                >
                  <option value="">All</option>
                  {sectionOptions.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Search (name, roll, email, phone)
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
                    placeholder="Type to filter..."
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
  {filteredStudents.map((s) => {
    const key = getStudentKey(s); // student_id OR id
    return (
      <option key={key} value={key}>
        {s.name}{" "}
        {(s.class || s.class_name) &&
          `(${s.class || s.class_name}${
            s.section || s.section_name
              ? "-" + (s.section || s.section_name)
              : ""
          })`}{" "}
        – {s.roll_no || s.roll || "Roll N/A"}
      </option>
    );
  })}
</select>

              </div>
            </div>

            {selectedStudent && (
              <>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  <span className="badge rounded-pill text-bg-primary">
                    ID: {selectedStudent.id}
                  </span>
                  {(selectedStudent.student_id || selectedStudent.scholar_no) && (
                    <span className="badge rounded-pill text-bg-secondary">
                      Scholar:{" "}
                      {selectedStudent.student_id || selectedStudent.scholar_no}
                    </span>
                  )}
                  {selectedStudent.village && (
                    <span className="badge rounded-pill text-bg-light text-muted border">
                      Village: {selectedStudent.village}
                    </span>
                  )}
                </div>

                <h5
                  className="fw-bold mb-3 mt-2"
                  style={{ color: "#004aad" }}
                >
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
                        Percentage: {totalMax ? `${percent.toFixed(2)} %` : "-"}
                      </div>
                      <div
                        style={{ fontSize: "0.78rem" }}
                        className={
                          totalMax
                            ? percent >= 33
                              ? "text-success"
                              : "text-danger"
                            : ""
                        }
                      >
                        Result:{" "}
                        {totalMax
                          ? percent >= 33
                            ? "Pass"
                            : "Fail"
                          : "-"}
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
                  {meta.schoolAddress}
                </div>
                <div style={{ fontSize: "0.7rem", color: "#4b5563" }}>
                  {meta.examName} ({meta.academicYear})
                </div>
                <hr className="mt-2 mb-2" />
              </div>

              <p className="mb-1">
                <strong>Student:</strong>{" "}
                {selectedStudent?.name || "__________"}
              </p>
              <p className="mb-1">
                <strong>Class:</strong>{" "}
                {selectedStudent
                  ? (selectedStudent.class || selectedStudent.class_name || "___") +
                    (selectedStudent.section || selectedStudent.section_name
                      ? " - " +
                        (selectedStudent.section ||
                          selectedStudent.section_name)
                      : "")
                  : "___"}
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
                {totalMax
                  ? percent >= 33
                    ? "Pass"
                    : "Fail"
                  : "—"}
              </p>
              <p className="mb-1">
                <strong>Remark:</strong> {meta.remark}
              </p>

              {/* Small subject preview table */}
              {examRows.length > 0 && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-semibold" style={{ fontSize: "0.78rem" }}>
                      Subjects ({examRows.length})
                    </span>
                    {selectedExamDate && (
                      <span className="badge text-bg-light">
                        {new Date(selectedExamDate).toLocaleDateString("en-IN")}
                      </span>
                    )}
                  </div>
                  <div className="table-responsive">
                    <table className="table table-sm mb-0 align-middle">
                      <thead>
                        <tr className="small text-muted">
                          <th>#</th>
                          <th>Subject</th>
                          <th className="text-end">Max</th>
                          <th className="text-end">Obt.</th>
                          <th className="text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examRows.slice(0, 6).map((r, idx) => (
                          <tr key={idx} style={{ fontSize: "0.72rem" }}>
                            <td>{idx + 1}</td>
                            <td>{r.subject_id || r.subject_name || "-"}</td>
                            <td className="text-end">
                              {r.max_marks != null ? r.max_marks : "-"}
                            </td>
                            <td className="text-end">
                              {r.marks_obtained != null ? r.marks_obtained : "-"}
                            </td>
                            <td className="text-center">
                              {r.grade ? (
                                <span className="badge rounded-pill text-bg-primary">
                                  {r.grade}
                                </span>
                              ) : (
                                "-"
                              )}
                            </td>
                          </tr>
                        ))}
                        {examRows.length > 6 && (
                          <tr>
                            <td colSpan={5} className="text-center text-muted">
                              + {examRows.length - 6} more subjects…
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-4 d-flex justify-content-between">
                <span style={{ fontSize: "0.7rem" }}>Class Teacher</span>
                <span style={{ fontSize: "0.7rem" }}>Exam Incharge</span>
                <span style={{ fontSize: "0.7rem" }}>Principal</span>
              </div>
            </div>

            {!selectedStudent && (
              <p className="text-muted small mt-3 mb-0">
                Preview updates automatically when you choose a student and
                exam.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
