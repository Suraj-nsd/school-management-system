import React from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const data = [
  { month: "Jan", fees: 32000 },
  { month: "Feb", fees: 28000 },
  { month: "Mar", fees: 34000 },
  { month: "Apr", fees: 36000 },
  { month: "May", fees: 40000 },
  { month: "Jun", fees: 42000 },
];

export default function FeesCollectionChart() {
  return (
    <div className="bg-white p-3 rounded shadow-sm">
      <h5 className="fw-bold text-primary mb-3">💰 Monthly Fees Collection</h5>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="fees" stroke="#ffc107" fill="#ffe08a" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
