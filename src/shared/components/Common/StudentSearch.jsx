import React, { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient"

export default function StudentSearch({ onSelect, mode = "search" }) {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch students from Supabase
  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from("students")
        .select("id, name, roll_number, class")
        .order("name", { ascending: true });
      if (error) console.error(error);
      else setStudents(data || []);
      setLoading(false);
    };
    fetchStudents();
  }, []);

  // 🔍 Search mode: Filter dynamically
  useEffect(() => {
    if (mode === "search") {
      const q = query.toLowerCase();
      const results = students.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.roll_number?.toLowerCase().includes(q) ||
          s.class?.toLowerCase().includes(q)
      );
      setFiltered(results);
    }
  }, [query, students, mode]);

  if (loading)
    return <p className="text-muted">Loading students...</p>;

  if (mode === "dropdown") {
    // 📋 Dropdown mode
    return (
      <div className="mb-3">
        <label className="form-label fw-semibold">Select Student</label>
        <select
          className="form-select"
          onChange={(e) => {
            const id = e.target.value;
            const student = students.find((s) => s.id.toString() === id);
            onSelect?.(student);
          }}
        >
          <option value="">-- Choose Student --</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.roll_number} ({s.class})
            </option>
          ))}
        </select>
      </div>
    );
  }

  // 🔍 Search mode
  return (
    <div className="mb-3 position-relative">
      <label className="form-label fw-semibold">Search Student</label>
      <input
        type="text"
        className="form-control"
        placeholder="Search by name, roll, or class..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {query && (
        <ul
          className="list-group position-absolute w-100 mt-1 shadow-sm"
          style={{ maxHeight: 200, overflowY: "auto", zIndex: 1000 }}
        >
          {filtered.length > 0 ? (
            filtered.map((s) => (
              <li
                key={s.id}
                className="list-group-item list-group-item-action"
                onClick={() => {
                  onSelect?.(s);
                  setQuery(`${s.name} (${s.roll_number})`);
                  setFiltered([]);
                }}
                style={{ cursor: "pointer" }}
              >
                <div className="fw-semibold">{s.name}</div>
                <small className="text-muted">
                  Roll: {s.roll_number} • Class: {s.class}
                </small>
              </li>
            ))
          ) : (
            <li className="list-group-item text-muted">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
}
