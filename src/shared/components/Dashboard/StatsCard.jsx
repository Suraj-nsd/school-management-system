import React from "react";

export default function StatsCard({ title, value, icon, color }) {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body d-flex align-items-center justify-content-between">
        <div>
          <h6 className="text-muted text-uppercase fw-semibold">{title}</h6>
          <h3 className="fw-bold mb-0">{value}</h3>
        </div>
        <div
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: 60,
            height: 60,
            backgroundColor: color + "20",
            fontSize: "1.8rem",
          }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
      </div>
    </div>
  );
}
