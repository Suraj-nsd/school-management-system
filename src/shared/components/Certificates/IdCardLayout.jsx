import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";

export default function IdCardLayout({ student }) {
  const idCardRef = useRef();

  const handleDownloadPDF = async () => {
    const element = idCardRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const cardWidth = 90;
    const cardHeight = 120;
    const x = (210 - cardWidth) / 2;
    const y = 40;

    pdf.addImage(imgData, "PNG", x, y, cardWidth, cardHeight);
    pdf.save(`${student.name}_ID_Card.pdf`);
  };

  return (
    <>
      <div
        ref={idCardRef}
        className="mx-auto my-4"
        style={{
          width: "340px",
          height: "480px",
          border: "2px solid #333",
          borderRadius: "12px",
          overflow: "hidden",
          background: "#fff",
          boxShadow: "0 5px 20px rgba(0,0,0,0.15)",
          position: "relative",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            textAlign: "center",
            padding: "10px 0",
          }}
        >
          <h5 className="mt-2 mb-0 fw-bold">Sunrise Public School</h5>
          <small>Barhalganj, Gorakhpur</small>
        </div>

        <div className="text-center mt-3">
          <img
            src={student.photo_url || "https://i.ibb.co/FH1qfqX/student-avatar.png"}
            alt={student.name}
            width="100"
            height="100"
            style={{
              borderRadius: "50%",
              border: "2px solid #764ba2",
              objectFit: "cover",
            }}
          />
          <h5 className="mt-2 fw-bold">{student.name}</h5>
          <small className="text-muted">
            Roll No: {student.roll_number}
          </small>
        </div>

        <div className="p-3">
          <table className="table table-borderless mb-2" style={{ fontSize: "0.9rem" }}>
            <tbody>
              <tr>
                <td className="fw-semibold">Class:</td>
                <td>{student.class}</td>
              </tr>
              <tr>
                <td className="fw-semibold">DOB:</td>
                <td>
                  {student.dob
                    ? new Date(student.dob).toLocaleDateString("en-IN")
                    : "-"}
                </td>
              </tr>
              <tr>
                <td className="fw-semibold">Blood Group:</td>
                <td>{student.blood_group || "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          style={{
            backgroundColor: "#f5f5f5",
            textAlign: "center",
            padding: "10px",
            position: "absolute",
            bottom: 0,
            width: "100%",
          }}
        >
          <QRCodeCanvas
            value={`Roll:${student.roll_number} | ${student.name}`}
            size={60}
            bgColor="#f5f5f5"
          />
          <div style={{ fontSize: "0.75rem", marginTop: "5px", color: "#333" }}>
            Valid for Session 2025–2026
          </div>
        </div>
      </div>

      <div className="text-center">
        <button
          className="btn btn-primary btn-lg shadow-sm"
          onClick={handleDownloadPDF}
        >
          Download ID Card (PDF)
        </button>
      </div>
    </>
  );
}
