// src/shared/Certificates/GenerateIdCard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { FaIdCard, FaSearch, FaUserGraduate, FaSchool, FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { supabase } from "../../supabaseClient";

export default function GenerateIdCard() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [downloadType, setDownloadType] = useState("png"); // "png" | "pdf"
  const cardRef = useRef(null);

  const [school, setSchool] = useState({
    name: "Sunrise Public School",
    address: "NH-28, Main Road, Patna, Bihar - 800001",
    tagline: "Learning • Discipline • Excellence",
    session: "2024-25",
  });

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .order("id", { ascending: true });

        if (error) throw error;
        setStudents(data || []);
      } catch (err) {
        console.error("Error loading students for ID Card:", err.message);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter((s) => {
      const name = s.name?.toLowerCase() || "";
      const email = s.email?.toLowerCase() || "";
      const cls = s.class?.toLowerCase() || "";
      const id = String(s.id || "").toLowerCase();
      return (
        name.includes(q) ||
        email.includes(q) ||
        cls.includes(q) ||
        id.includes(q)
      );
    });
  }, [students, search]);

  const selectedStudent = useMemo(
    () => students.find((s) => String(s.id) === String(selectedStudentId)),
    [students, selectedStudentId]
  );

  // QR payload – ready for future attendance scan
  const qrPayload = useMemo(() => {
    if (!selectedStudent) return "";
    return JSON.stringify({
      type: "student_attendance",
      student_id: selectedStudent.id,
      name: selectedStudent.name,
      class: selectedStudent.class,
      session: school.session,
    });
  }, [selectedStudent, school.session]);

  const handleDownload = async () => {
    if (!cardRef.current || !selectedStudent) return;

    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      backgroundColor: null,
    });
    const imgData = canvas.toDataURL("image/png");

    if (downloadType === "png") {
      // PNG download (works like JPG in usage)
      const link = document.createElement("a");
      link.href = imgData;
      link.download = `ID_${selectedStudent.name || "student"}.png`;
      link.click();
      return;
    }

    // PDF download – A4 with card centered
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Convert card px size roughly to mm: 260x410 -> scale into A4
    const cardWidthMm = 70; // about business-card badge size
    const cardHeightMm = (cardWidthMm * canvas.height) / canvas.width;
    const x = (pageWidth - cardWidthMm) / 2;
    const y = (pageHeight - cardHeightMm) / 2;

    pdf.addImage(imgData, "PNG", x, y, cardWidthMm, cardHeightMm);
    pdf.save(`ID_${selectedStudent.name || "student"}.pdf`);
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
            Loading students…
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
            ID Card Generator
          </h2>
          <p className="mb-0" style={{ fontSize: "0.85rem", opacity: 0.85 }}>
            Generate a professional school ID card with QR code for future QR‑based
            attendance.
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
          <FaIdCard size={26} />
        </div>
      </div>

      <div className="row g-4">
        {/* Left: controls */}
        <div className="col-12 col-lg-7">
          <div
            className="bg-white rounded-4 shadow-sm p-3 p-md-4"
            style={{ border: "1px solid rgba(148,163,184,0.35)" }}
          >
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
                  value={school.name}
                  onChange={(e) =>
                    setSchool((s) => ({ ...s, name: e.target.value }))
                  }
                />
              </div>
              <div className="col-12">
                <label className="form-label small fw-semibold">
                  School Address
                </label>
                <input
                  className="form-control"
                  value={school.address}
                  onChange={(e) =>
                    setSchool((s) => ({ ...s, address: e.target.value }))
                  }
                />
              </div>
              <div className="col-md-8">
                <label className="form-label small fw-semibold">
                  Tagline / Motto
                </label>
                <input
                  className="form-control"
                  value={school.tagline}
                  onChange={(e) =>
                    setSchool((s) => ({ ...s, tagline: e.target.value }))
                  }
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-semibold">
                  Session
                </label>
                <input
                  className="form-control"
                  value={school.session}
                  onChange={(e) =>
                    setSchool((s) => ({ ...s, session: e.target.value }))
                  }
                />
              </div>
            </div>

            <h5 className="fw-bold mb-3 mt-2" style={{ color: "#004aad" }}>
              Select Student
            </h5>
            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-semibold">
                  Search by name, email, class or ID
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <FaSearch className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type to search…"
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
                  onChange={(e) => setSelectedStudentId(e.target.value)}
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
                <div className="mt-3 p-3 rounded bg-light">
                  <div className="d-flex align-items-center gap-2">
                    <FaUserGraduate className="text-primary" />
                    <div>
                      <div className="fw-semibold">
                        {selectedStudent.name}
                      </div>
                      <small className="text-muted">
                        ID: {selectedStudent.id} · Class:{" "}
                        {selectedStudent.class || "N/A"}
                      </small>
                    </div>
                  </div>
                </div>

                <div className="mt-3 d-flex align-items-center gap-2">
                  <span className="text-muted small">Download as:</span>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 120 }}
                    value={downloadType}
                    onChange={(e) => setDownloadType(e.target.value)}
                  >
                    <option value="png">Image (PNG/JPG)</option>
                    <option value="pdf">PDF</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                    onClick={handleDownload}
                    style={{
                      borderRadius: 999,
                      paddingInline: "1rem",
                      background:
                        "linear-gradient(135deg, #004aad 0%, #0077ff 70%)",
                      borderColor: "transparent",
                    }}
                  >
                    <FaDownload size={12} />
                    Download
                  </button>
                </div>
              </>
            )}

            {!selectedStudent && (
              <p className="text-muted small mt-3 mb-0">
                Select a student to see ID card preview with QR code and enable download.
              </p>
            )}

            {/* <p className="text-muted small mt-3 mb-0">
              QR payload contains de>student_id</code>, de>name</code>,
              de>class</code> and de>session</code>. Later you can build a{" "}
              de>/scan</code> screen with a QR scanner library to decode this
              JSON and insert attendance into the de>attendance</code> table.
            </p> */}
          </div>
        </div>

        {/* Right: ID card preview with QR */}
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
              ID Card Preview
            </h6>

            <div
              ref={cardRef}
              className="mx-auto"
              style={{
                width: 260,
                height: 410,
                borderRadius: 20,
                background:
                  "linear-gradient(180deg, #004aad 0%, #0f172a 80%)",
                color: "#fff",
                boxShadow: "0 12px 30px rgba(15,23,42,0.6)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Top strip */}
              <div
                style={{
                  height: 90,
                  padding: "0.85rem 0.9rem",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
                  borderBottom: "1px solid rgba(148,163,184,0.3)",
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaSchool size={18} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {school.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.6rem",
                        opacity: 0.8,
                      }}
                    >
                      {school.tagline}
                    </div>
                    <div
                      style={{
                        fontSize: "0.6rem",
                        opacity: 0.85,
                      }}
                    >
                      Session: {school.session}
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile + info */}
              <div
                style={{
                  padding: "0.9rem 0.9rem 0.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div className="d-flex align-items-center gap-3">
                  {/* Photo placeholder / initials */}
                  <div
                    style={{
                      width: 64,
                      height: 80,
                      borderRadius: 12,
                      background: "#e5e7eb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "1.4rem",
                      color: "#111827",
                      overflow: "hidden",
                      boxShadow: "0 8px 22px rgba(15,23,42,0.6)",
                    }}
                  >
                    {/* If later you store photo_url in students table, render <img> here */}
                    {(selectedStudent?.name || "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {selectedStudent?.name || "Student Name"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        opacity: 0.9,
                      }}
                    >
                      ID: {selectedStudent?.id || "----"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        opacity: 0.9,
                      }}
                    >
                      Class: {selectedStudent?.class || "N/A"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        opacity: 0.9,
                      }}
                    >
                      Blood Group: {selectedStudent?.blood_group || "N/A"}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "0.65rem",
                    opacity: 0.8,
                    lineHeight: 1.3,
                    marginTop: "0.4rem",
                  }}
                >
                  {school.address}
                </div>

                <hr
                  style={{
                    borderColor: "rgba(148,163,184,0.35)",
                    margin: "0.4rem 0",
                  }}
                />

                {/* QR + footer */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginTop: "0.2rem",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.6rem",
                        opacity: 0.85,
                        textTransform: "uppercase",
                      }}
                    >
                      Scan for Attendance
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        opacity: 0.85,
                      }}
                    >
                      Future: open camera → scan QR → mark present
                    </div>
                  </div>
                  <div
                    style={{
                      width: 86,
                      height: 86,
                      background: "#fff",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 6,
                    }}
                  >
                    {qrPayload ? (
                      <QRCode
                        value={qrPayload}
                        size={72}
                        bgColor="#ffffff"
                        fgColor="#111827"
                        level="M"
                        style={{ width: "100%", height: "100%" }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: "0.55rem",
                          color: "#6b7280",
                          textAlign: "center",
                          padding: "0.3rem",
                        }}
                      >
                        Select student to generate QR
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "0.6rem",
                    opacity: 0.8,
                    marginTop: "0.4rem",
                  }}
                >
                  This card is the property of {school.name}. If found, please
                  return to school office.
                </div>
              </div>
            </div>
{/* 
            <p className="text-muted small mt-3 mb-0">
              Later you can build a de>/scan</code> page using a QR scanner
              library (for example de>react-qr-reader</code>) to decode this
              QR JSON and insert attendance into the{" "}
              de>attendance</code> table.
            </p> */}
          </div>
        </div>
      </div>
    </div>
  );
}
