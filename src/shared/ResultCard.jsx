import React, { useRef } from "react";

export function ResultCard({
  school = { name: "Your School Name", address: "Address line", phone: "+91-0000000000" },
  student,
  results, // array of { subject: { name, code }, marks_obtained, max_marks, grade, remarks, exam_date }
}) {
  const cardRef = useRef(null);

  const totals = results.reduce(
    (acc, r) => {
      acc.obtained += Number(r.marks_obtained ?? 0);
      acc.max += Number(r.max_marks ?? 0);
      return acc;
    },
    { obtained: 0, max: 0 }
  );
  const percentage = totals.max > 0 ? ((totals.obtained / totals.max) * 100).toFixed(2) : "0.00";

  const handlePrint = () => {
    const printContents = cardRef.current?.innerHTML || "";
    const w = window.open("", "_blank");
    w.document.write(`
      <html>
        <head>
          <title>Result - ${student?.name || ""}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
          <style>
            @media print {
              .no-print { display: none !important; }
            }
            .brand-gradient { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .watermark { position: absolute; opacity: 0.05; font-size: 6rem; transform: rotate(-20deg); top: 30%; left: 10%; }
            .badge-grade { font-size: 0.9rem; }
          </style>
        </head>
        <body class="bg-light">
          <div class="container py-4">
            ${printContents}
          </div>
        </body>
      </html>
    `);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  return (
    <div>
      <div className="text-end mb-3 no-print">
        <button className="btn btn-primary" onClick={handlePrint}>Print Result</button>
      </div>
      <div ref={cardRef}>
        <div className="card shadow">
          <div className="card-header text-white brand-gradient">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="mb-0 fw-bold">{school.name}</h4>
                <small className="opacity-75">{school.address} • {school.phone}</small>
              </div>
              <div className="text-end">
                <div className="fw-semibold">Academic Result</div>
                <small className="opacity-75">Generated on {new Date().toLocaleDateString("en-IN")}</small>
              </div>
            </div>
          </div>
          <div className="card-body position-relative">
            <div className="watermark">SCHOOL</div>
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <div className="small text-muted">Student</div>
                <div className="fw-semibold">{student?.name || "-"}</div>
              </div>
              <div className="col-md-4">
                <div className="small text-muted">Class</div>
                <div className="fw-semibold">{student?.class || "-"}</div>
              </div>
              <div className="col-md-4">
                <div className="small text-muted">Email</div>
                <div className="fw-semibold">{student?.email || "-"}</div>
              </div>
            </div>

            <div className="table-responsive mb-3">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th style={{width:60}}>S.No</th>
                    <th>Subject</th>
                    <th style={{width:120}}>Code</th>
                    <th style={{width:140}}>Exam Date</th>
                    <th style={{width:120}}>Max</th>
                    <th style={{width:140}}>Obtained</th>
                    <th style={{width:120}}>Grade</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr><td colSpan={8} className="text-center text-muted">No subjects</td></tr>
                  ) : results.map((r, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{r.subject?.name || "-"}</td>
                      <td><code>{r.subject?.code || "-"}</code></td>
                      <td>{r.exam_date ? new Date(r.exam_date).toLocaleDateString("en-IN") : "-"}</td>
                      <td>{r.max_marks ?? "-"}</td>
                      <td className="fw-bold">{r.marks_obtained ?? "-"}</td>
                      <td>
                        <span className={`badge badge-grade ${
                          r.grade === "A" ? "bg-success" :
                          r.grade === "B" ? "bg-primary" :
                          r.grade === "C" ? "bg-warning text-dark" :
                          r.grade === "D" ? "bg-danger" : "bg-secondary"
                        }`}>{r.grade || "-"}</span>
                      </td>
                      <td>{r.remarks || "-"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="table-light">
                    <th colSpan={4} className="text-end">Total</th>
                    <th>{totals.max}</th>
                    <th>{totals.obtained}</th>
                    <th colSpan={2} className="text-end">Percentage: {percentage}%</th>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <div>
                <div className="small text-muted">Class Teacher</div>
                <div className="fw-semibold" style={{minWidth:180, borderTop:"2px solid #ccc", paddingTop:6}}></div>
              </div>
              <div className="text-end">
                <div className="small text-muted">Principal</div>
                <div className="fw-semibold" style={{minWidth:180, borderTop:"2px solid #ccc", paddingTop:6}}></div>
              </div>
            </div>
          </div>
          <div className="card-footer text-center text-muted small">
            This is a system generated document and does not require a signature.
          </div>
        </div>
      </div>
    </div>
  );
}
