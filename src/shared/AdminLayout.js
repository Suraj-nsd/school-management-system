import React from "react";
import { Routes, Route } from "react-router-dom";
import GenerateTc from "../shared/Certificates/GenerateTc";
import GenerateIdCard from "../shared/Certificates/GenerateIdCard";
import GenerateResult from "../shared/Certificates/GenerateResult";
import DashboardHome from "../shared/pages/DashboardHome/DashboardHome";
import AdminDashboard from "../shared/pages/AdminDashboard/AdminDashboard"; 
import Sidebar from "../shared/components/Common/Sidebar";
import Topbar from "../shared/components/Common/Topbar";

const AdminLayout = () => {
  return (
    <div className="d-flex">
      <Sidebar />
      <div style={{ flex: 1, marginLeft: "240px" }}>
        <Topbar username="Admin" />
        <div className="p-4">
          <Routes>
            <Route path="dashboard" element={<DashboardHome />} />
            <Route
              path="manage"
              element={
                <AdminDashboard
                  role="admin"
                  enabledTables={{
                    users: true,
                    students: true,
                    teachers: true,
                    subjects: true,
                    attendance: false,
                    result: true,
                  }}
                />
              }
            />
            <Route path="certificates/tc" element={<GenerateTc />} />
            <Route path="certificates/idcard" element={<GenerateIdCard />} />
            <Route path="certificates/result" element={<GenerateResult />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
