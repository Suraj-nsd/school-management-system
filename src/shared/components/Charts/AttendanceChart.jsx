import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const data = [
  { month: "Jan", present: 92 },
  { month: "Feb", present: 89 },
  { month: "Mar", present: 95 },
  { month: "Apr", present: 90 },
  { month: "May", present: 94 },
  { month: "Jun", present: 93 },
];

export default function AttendanceChart() {
  return (
    <div className="bg-white p-3 rounded shadow-sm">
      <h5 className="fw-bold text-primary mb-3">📅 Attendance Trend</h5>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="present" stroke="#007bff" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
