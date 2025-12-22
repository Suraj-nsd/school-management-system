import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Static demo data (you can replace with live Supabase data later)
const data = [
  { month: "Jan", present: 92 },
  { month: "Feb", present: 89 },
  { month: "Mar", present: 95 },
  { month: "Apr", present: 90 },
  { month: "May", present: 94 },
  { month: "Jun", present: 93 },
];

export default function AttendancePieChart() {
  return (
    <div
      style={{
        background: "#fff",
        padding: "1rem 1.2rem",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        border: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      <h5
        style={{
          fontWeight: 700,
          color: "#004aad",
          marginBottom: "1rem",
          fontSize: "1rem",
        }}
      >
        📅 Attendance Trend (Last 6 Months)
      </h5>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e6f1" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            domain={[80, 100]}
            ticks={[80, 85, 90, 95, 100]}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, "Present"]}
            contentStyle={{
              borderRadius: "10px",
              border: "1px solid #c6d4ff",
              padding: "8px 12px",
            }}
          />

          <Line
            type="monotone"
            dataKey="present"
            stroke="#007bff"
            strokeWidth={3}
            dot={{ r: 4, stroke: "#004aad", strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
