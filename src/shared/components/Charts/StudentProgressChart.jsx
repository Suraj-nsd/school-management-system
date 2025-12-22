import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const data = [
  { subject: "Math", average: 78 },
  { subject: "Science", average: 84 },
  { subject: "English", average: 74 },
  { subject: "History", average: 81 },
  { subject: "Computer", average: 90 },
];

export default function StudentProgressChart() {
  return (
    <div className="bg-white p-3 rounded shadow-sm">
      <h5 className="fw-bold text-primary mb-3">📘 Subject-wise Performance</h5>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="subject" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="average" fill="#28a745" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
