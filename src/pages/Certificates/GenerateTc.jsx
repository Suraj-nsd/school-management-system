import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import {
  FaDownload,
  FaSchool,
  FaUserGraduate,
  FaCalendar,
  FaSearch,
} from "react-icons/fa";
import { supabase } from "../../supabaseClient";

export default function GenerateTc() {
  const [form, setForm] = useState({
    schoolName: "Sushila Devi Junior High School",
    schoolAddress:
      "Sushila Devi Junior High School, Barhalganj, Gorakhpur (U.P.)",
    affiliationNo: "U.P. Basic Education Board",

    // key that links to DB
    studentId: "",

    // student basic details (from students table)
    studentName: "",
    fatherName: "",
    motherName: "",
    classLeaving: "",
    dob: "",
    admissionNo: "", // we’ll map this to admission_file_no
    registrationNo: "", // we’ll map this to register_number

    // TC table specific
    tcNo: "",
    admissionFileNo: "", // AF-xx
    withdrawalFileNo: "", // WF-xx
    registerNumber: "", // REG-xx (optional if separate from registrationNo)
    dobInWords: "",
    preparedBy: "Admin",
    headOfInstitution: "Principal",

    lastExam: "",
    result: "",
    issueDate: new Date().toISOString().slice(0, 10),
    leavingDate: "",
    reasonLeaving: "",
    conduct: "Good",
  });

  const [loadingStudent, setLoadingStudent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Fetch student from "students" table AND TC from student_transfer_certificates
  const handleFetchStudent = async () => {
    if (!form.studentId?.trim()) {
      setError("Please enter Student ID to fetch details.");
      return;
    }
    setError("");
    setLoadingStudent(true);

    const sid = form.studentId.trim();

    try {
      // 1) basic student info
      const { data: student, error: studentErr } = await supabase
        .from("students")
        .select(
          "student_id, name, class_name, dob, admission_number, roll_number, father_name, mother_name"
        )
        .eq("student_id", sid)
        .maybeSingle();

      if (studentErr) throw studentErr;
      if (!student) {
        setError("No student found with this ID.");
        return;
      }

      // 2) TC info from schema "Sushila_devi_junior_high_school"
      const { data: tcRow, error: tcErr } = await supabase
        .from(
          "Sushila_devi_junior_high_school.student_transfer_certificates"
        )
        .select(
          "student_id, tc_number, admission_file_no, withdrawal_file_no, register_number, dob, dob_in_words, prepared_by, prepared_date, head_of_institution"
        )
        .eq("student_id", sid)
        .maybeSingle();

      if (tcErr) throw tcErr;

      setForm((f) => ({
        ...f,
        studentId: sid,
        studentName: student.name || f.studentName,
        classLeaving: student.class_name || f.classLeaving,
        dob: student.dob || tcRow?.dob || f.dob,
        admissionNo: student.admission_number || f.admissionNo,
        registrationNo:
          student.roll_number?.toString() || f.registrationNo,
        fatherName: student.father_name || f.fatherName,
        motherName: student.mother_name || f.motherName,

        // from TC table (if exists)
        tcNo: tcRow?.tc_number || f.tcNo,
        admissionFileNo: tcRow?.admission_file_no || f.admissionFileNo,
        withdrawalFileNo: tcRow?.withdrawal_file_no || f.withdrawalFileNo,
        registerNumber: tcRow?.register_number || f.registerNumber,
        dobInWords: tcRow?.dob_in_words || f.dobInWords,
        preparedBy: tcRow?.prepared_by || f.preparedBy,
        issueDate:
          tcRow?.prepared_date || f.issueDate || new Date().toISOString().slice(0, 10),
        headOfInstitution: tcRow?.head_of_institution || f.headOfInstitution,
      }));
    } catch (e) {
      console.error("Error fetching student/TC:", e);
      setError(e.message || "Failed to fetch details.");
    } finally {
      setLoadingStudent(false);
    }
  };

  const handleGenerate = async () => {
    const doc = new jsPDF("p", "mm", "a4");

    // Border
    doc.setDrawColor(0, 74, 173);
    doc.setLineWidth(0.6);
    doc.rect(10, 10, 190, 277);

    // Header
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 74, 173);
    doc.setFontSize(18);
    doc.text(form.schoolName || "School Name", 105, 25, {
      align: "center",
    });

    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(form.schoolAddress || "School Address", 105, 32, {
      align: "center",
    });
    doc.text(form.affiliationNo || "", 105, 38, { align: "center" });

    // Title
    doc.setFontSize(15);
    doc.setTextColor(0, 0, 0);
    doc.text("TRANSFER CERTIFICATE", 105, 50, { align: "center" });
    doc.setLineWidth(0.4);
    doc.line(65, 52, 145, 52);

    // TC meta
    doc.setFontSize(10);
    doc.text(`TC No.: ${form.tcNo || "________"}`, 20, 60);
    doc.text(`Issue Date: ${form.issueDate || "________"}`, 135, 60);

    // Main body
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    const lines = [
      `1. Name of Student : ${
        form.studentName || "_________________________"
      }`,
      `2. Father's Name   : ${
        form.fatherName || "_________________________"
      }`,
      `3. Mother's Name   : ${
        form.motherName || "_________________________"
      }`,
      `4. Admission File No.   : ${
        form.admissionFileNo || form.admissionNo || "________________"
      }`,
      `5. Withdrawal File No.  : ${
        form.withdrawalFileNo || "_________________________"
      }`,
      `6. Register Number      : ${
        form.registerNumber || form.registrationNo || "________________"
      }`,
      `7. Date of Birth        : ${
        form.dob || "_________________________"
      } (in figures)`,
      `8. Date of Birth (in words) : ${
        form.dobInWords || "_________________________"
      }`,
      `9. Class in which pupil last studied : ${
        form.classLeaving || "________________"
      }`,
      `10. Last examination taken with result : ${
        form.lastExam || "________________"
      } (${form.result || "________"})`,
      `11. Date of leaving the school : ${
        form.leavingDate || "________________"
      }`,
      `12. Reason for leaving : ${
        form.reasonLeaving || "________________"
      }`,
      `13. Conduct : ${form.conduct || "________________"}`,
    ];

    let y = 72;
    lines.forEach((line) => {
      doc.text(line, 20, y);
      y += 8;
    });

    // Footer signatures
    doc.text("Class Teacher", 30, 250);
    doc.text("Checker", 105, 250, { align: "center" });
    doc.text(form.headOfInstitution || "Principal", 180, 250, {
      align: "right",
    });

    const fileName = `TC_${form.studentName || "student"}.pdf`;

    // Save / upsert record into student_transfer_certificates
    try {
      if (form.studentId?.trim() && form.tcNo?.trim()) {
        await supabase
          .from(
            "Sushila_devi_junior_high_school.student_transfer_certificates"
          )
          .upsert(
            [
              {
                student_id: form.studentId.trim(),
                tc_number: form.tcNo.trim(),
                admission_file_no:
                  form.admissionFileNo || form.admissionNo || null,
                withdrawal_file_no: form.withdrawalFileNo || null,
                register_number:
                  form.registerNumber || form.registrationNo || null,
                dob: form.dob || null,
                dob_in_words: form.dobInWords || null,
                prepared_by: form.preparedBy || "Admin",
                prepared_date:
                  form.issueDate ||
                  new Date().toISOString().slice(0, 10),
                head_of_institution:
                  form.headOfInstitution || "Principal",
              },
            ],
            { onConflict: "tc_number" }
          ); // if tc_number already exists, update that row
      }
    } catch (e) {
      console.error("Error saving TC record (non-blocking):", e);
      // still allow PDF
    }

    doc.save(fileName);
  };

  return (
    <div
      className="container-fluid py-4 px-3 px-md-4"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f4f6fb 0%, #edf2ff 40%, #f9fafb 100%)",
      }}
    >
      {/* Header card */}
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
            Transfer Certificate
          </h2>
          <p
            className="mb-0"
            style={{ fontSize: "0.85rem", opacity: 0.85 }}
          >
            Enter Student ID, fetch details (student + existing TC), and
            download a school-branded TC as PDF.
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

      {/* Form + preview card */}
      <div className="row g-4">
        {/* Form side */}
        <div className="col-12 col-lg-7">
          <div
            className="bg-white rounded-4 shadow-sm p-3 p-md-4"
            style={{ border: "1px solid rgba(148,163,184,0.35)" }}
          >
            {error && (
              <div className="alert alert-danger py-2 small mb-3">
                {error}
              </div>
            )}

            <h5 className="fw-bold mb-3" style={{ color: "#004aad" }}>
              School Details
            </h5>
            <div className="row g-3 mb-3">
              <div className="col-12">
                <label className="form-label small fw-semibold">
                  School Name
                </label>
                <input
                  className="form-control"
                  name="schoolName"
                  value={form.schoolName}
                  onChange={handleChange}
                  placeholder="Enter school name"
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">
                  School Address
                </label>
                <input
                  className="form-control"
                  name="schoolAddress"
                  value={form.schoolAddress}
                  onChange={handleChange}
                  placeholder="Enter school address"
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">
                  Affiliation No. / Board
                </label>
                <input
                  className="form-control"
                  name="affiliationNo"
                  value={form.affiliationNo}
                  onChange={handleChange}
                  placeholder="CBSE / State Board details"
                />
              </div>
            </div>

            <h5 className="fw-bold mb-3 mt-2" style={{ color: "#004aad" }}>
              Student Details
            </h5>

            {/* Student ID + fetch button */}
            <div className="row g-3 mb-2">
              <div className="col-md-7">
                <label className="form-label small fw-semibold">
                  Student ID (from database)
                </label>
                <input
                  className="form-control"
                  name="studentId"
                  value={form.studentId}
                  onChange={handleChange}
                  placeholder="e.g. SDJHS-003"
                />
              </div>
              <div className="col-md-5 d-flex align-items-end">
                <button
                  type="button"
                  className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                  onClick={handleFetchStudent}
                  disabled={loadingStudent}
                  style={{ borderRadius: 999 }}
                >
                  <FaSearch />
                  {loadingStudent ? "Fetching..." : "Fetch from DB"}
                </button>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Student Name
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <FaUserGraduate />
                  </span>
                  <input
                    className="form-control"
                    name="studentName"
                    value={form.studentName}
                    onChange={handleChange}
                    placeholder="Full name"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Father's Name
                </label>
                <input
                  className="form-control"
                  name="fatherName"
                  value={form.fatherName}
                  onChange={handleChange}
                  placeholder="Father's name"
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-semibold">
                  Mother's Name
                </label>
                <input
                  className="form-control"
                  name="motherName"
                  value={form.motherName}
                  onChange={handleChange}
                  placeholder="Mother's name"
                />
              </div>

              {/* File / register numbers */}
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Admission File No.
                </label>
                <input
                  className="form-control"
                  name="admissionFileNo"
                  value={form.admissionFileNo}
                  onChange={handleChange}
                  placeholder="e.g. AF-12"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Withdrawal File No.
                </label>
                <input
                  className="form-control"
                  name="withdrawalFileNo"
                  value={form.withdrawalFileNo}
                  onChange={handleChange}
                  placeholder="e.g. WF-12"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Register Number
                </label>
                <input
                  className="form-control"
                  name="registerNumber"
                  value={form.registerNumber}
                  onChange={handleChange}
                  placeholder="e.g. REG-55"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Date of Birth
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <FaCalendar />
                  </span>
                  <input
                    type="date"
                    className="form-control"
                    name="dob"
                    value={form.dob}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-8">
                <label className="form-label small fw-semibold">
                  DOB (in words)
                </label>
                <input
                  className="form-control"
                  name="dobInWords"
                  value={form.dobInWords}
                  onChange={handleChange}
                  placeholder="e.g. Fifteenth March Two Thousand Eleven"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Class Leaving
                </label>
                <input
                  className="form-control"
                  name="classLeaving"
                  value={form.classLeaving}
                  onChange={handleChange}
                  placeholder="e.g. VIII A"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Last Exam
                </label>
                <input
                  className="form-control"
                  name="lastExam"
                  value={form.lastExam}
                  onChange={handleChange}
                  placeholder="e.g. Annual 2024"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Result (Pass/Fail)
                </label>
                <input
                  className="form-control"
                  name="result"
                  value={form.result}
                  onChange={handleChange}
                  placeholder="Pass / Promoted"
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  TC No.
                </label>
                <input
                  className="form-control"
                  name="tcNo"
                  value={form.tcNo}
                  onChange={handleChange}
                  placeholder="TC-2025-001"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Issue / Prepared Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  name="issueDate"
                  value={form.issueDate}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Leaving Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  name="leavingDate"
                  value={form.leavingDate}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Prepared By
                </label>
                <input
                  className="form-control"
                  name="preparedBy"
                  value={form.preparedBy}
                  onChange={handleChange}
                  placeholder="Admin / Clerk"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Head of Institution
                </label>
                <input
                  className="form-control"
                  name="headOfInstitution"
                  value={form.headOfInstitution}
                  onChange={handleChange}
                  placeholder="Principal"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Conduct
                </label>
                <input
                  className="form-control"
                  name="conduct"
                  value={form.conduct}
                  onChange={handleChange}
                  placeholder="Good / Excellent"
                />
              </div>

              <div className="col-md-12">
                <label className="form-label small fw-semibold">
                  Reason for Leaving
                </label>
                <input
                  className="form-control"
                  name="reasonLeaving"
                  value={form.reasonLeaving}
                  onChange={handleChange}
                  placeholder="e.g. Parent transfer / Higher studies"
                />
              </div>
            </div>

            <div className="mt-4 d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-primary d-flex align-items-center gap-2"
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
                Download TC PDF
              </button>
            </div>
          </div>
        </div>

        {/* Preview style card */}
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
              Preview (Layout)
            </h6>
            <div
              className="border rounded-4 p-3 bg-white"
              style={{ height: "100%", minHeight: 280 }}
            >
              <div className="text-center mb-3">
                <div
                  style={{
                    fontWeight: "700",
                    fontSize: "0.95rem",
                    color: "#111827",
                    textTransform: "uppercase",
                  }}
                >
                  {form.schoolName || "School Name"}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#6b7280",
                  }}
                >
                  {form.schoolAddress || "School address"}
                </div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#6b7280",
                  }}
                >
                  {form.affiliationNo}
                </div>
                <hr className="mt-2 mb-2" />
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    letterSpacing: "0.08em",
                  }}
                >
                  TRANSFER CERTIFICATE
                </div>
              </div>

              <div style={{ fontSize: "0.78rem", color: "#374151" }}>
                <p className="mb-1">
                  <strong>Student:</strong>{" "}
                  {form.studentName || "__________"}
                </p>
                <p className="mb-1">
                  <strong>Father:</strong>{" "}
                  {form.fatherName || "__________"}
                </p>
                <p className="mb-1">
                  <strong>Class:</strong>{" "}
                  {form.classLeaving || "__________"}
                </p>
                <p className="mb-1">
                  <strong>TC No:</strong> {form.tcNo || "__________"}
                </p>
                <p className="mb-1">
                  <strong>Leaving Date:</strong>{" "}
                  {form.leavingDate || "__________"}
                </p>
                <p className="mb-1">
                  <strong>Reason:</strong>{" "}
                  {form.reasonLeaving || "__________"}
                </p>
                <p className="mb-1">
                  <strong>Conduct:</strong> {form.conduct || "Good"}
                </p>
              </div>

              <div className="mt-4 d-flex justify-content-between">
                <span style={{ fontSize: "0.7rem" }}>Class Teacher</span>
                <span style={{ fontSize: "0.7rem" }}>Principal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
