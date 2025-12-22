import React from "react";

export default function Loader({ text = "Loading..." }) {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      <div className="spinner-border text-primary mb-3" role="status"></div>
      <h6 className="text-muted">{text}</h6>
    </div>
  );
}
