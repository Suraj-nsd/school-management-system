import React from "react";

export default function Footer() {
  return (
    <footer style={{ background: "#003366", color: "#fff", padding: "1rem", textAlign: "center", marginTop: "2rem" }}>
      &copy; {new Date().getFullYear()} School Portal. Powered by React + Supabase.
    </footer>
  );
}
