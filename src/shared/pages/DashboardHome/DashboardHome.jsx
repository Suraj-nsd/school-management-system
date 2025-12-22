// src/shared/pages/DashboardHome/DashboardHome.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StatsCard from "../../components/Dashboard/StatsCard";
import AttendanceChart from "../../components/Charts/AttendanceChart";
import StudentProgressChart from "../../components/Charts/StudentProgressChart";
import FeesCollectionChart from "../../components/Charts/FeesCollectionChart";
import { supabase } from "../../../supabaseClient";

export default function DashboardHome() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    subjects: 0,
    attendanceToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // figure out which role is active from the URL
  const basePath = location.pathname.startsWith("/teacher")
    ? "/teacher"
    : location.pathname.startsWith("/student")
    ? "/student"
    : "/admin"; // default admin

  const roleFromPath =
    basePath === "/admin"
      ? "admin"
      : basePath === "/teacher"
      ? "teacher"
      : "student";

  // In new routing, /{role}/manage shows AdminDashboard and chooses first table
  const manageLink = `${basePath}/manage`;

  // Only admin has /scan-attendance route currently
  const canScanAttendance = roleFromPath === "admin";

  useEffect(() => {
    let mounted = true;

    async function fetchStats() {
      try {
        if (!supabase) {
          throw new Error(
            "Supabase client is undefined. Check your import/path and env variables."
          );
        }

        const [studentsRes, teachersRes, subjectsRes] = await Promise.all([
          supabase
            .from("students")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("teachers")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("subjects")
            .select("*", { count: "exact", head: true }),
        ]);

        if (studentsRes.error || teachersRes.error || subjectsRes.error) {
          const err =
            studentsRes.error || teachersRes.error || subjectsRes.error;
          throw err;
        }

        const studentCount = studentsRes.count ?? 0;
        const teacherCount = teachersRes.count ?? 0;
        const subjectCount = subjectsRes.count ?? 0;

        const today = new Date().toISOString().split("T")[0];
        const attendanceRes = await supabase
          .from("attendance")
          .select("*", { count: "exact", head: true })
          .eq("attendance_date", today)
          .eq("status", "Present");

        if (attendanceRes.error) throw attendanceRes.error;
        const presentToday = attendanceRes.count ?? 0;

        if (!mounted) return;

        setStats({
          students: studentCount,
          teachers: teacherCount,
          subjects: subjectCount,
          attendanceToday: presentToday,
        });
        setError(null);
      } catch (err) {
        console.error("❌ Unexpected fetchStats error:", err);
        if (mounted)
          setError(err?.message || "Failed to fetch dashboard stats");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchStats();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.centerBox}>
          <div className="spinner-border text-primary" role="status" />
          <p style={styles.centerText}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.centerBox}>
          <h3 style={styles.errorTitle}>Unable to load statistics</h3>
          <p style={styles.errorText}>{error}</p>
          <button
            style={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header row */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>
            {roleFromPath === "admin"
              ? "Admin Dashboard"
              : roleFromPath === "teacher"
              ? "Teacher Dashboard"
              : "Student Dashboard"}
          </h2>
          <p style={styles.subtitle}>Quick overview of school activity today</p>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.badgeToday}>
            <span>Today</span>
          </div>
          <div style={styles.headerActions}>
            <button
              style={styles.actionButton}
              onClick={() => navigate(manageLink)}
            >
              Manage Data
            </button>
            <button
              style={styles.actionButtonSecondary}
              onClick={() => navigate(`${basePath}/reports/attendance`)}
            >
              Attendance Report
            </button>
            {canScanAttendance && (
              <button
                style={styles.actionButtonSecondary}
                onClick={() => navigate(`${basePath}/scan-attendance`)}
              >
                Scan Attendance
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statItem}>
          <StatsCard
            title="Total Students"
            value={stats.students}
            icon="🎓"
            color="#007bff"
          />
        </div>
        <div style={styles.statItem}>
          <StatsCard
            title="Total Teachers"
            value={stats.teachers}
            icon="👩‍🏫"
            color="#28a745"
          />
        </div>
        <div style={styles.statItem}>
          <StatsCard
            title="Subjects Offered"
            value={stats.subjects}
            icon="📚"
            color="#ffc107"
          />
        </div>
        <div style={styles.statItem}>
          <StatsCard
            title="Present Today"
            value={stats.attendanceToday}
            icon="✅"
            color="#17a2b8"
          />
        </div>
      </div>

      {/* Charts */}
      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Attendance Overview</h3>
            <span style={styles.chartTag}>Last 30 days</span>
          </div>
          <div style={styles.chartBody}>
            <AttendanceChart />
          </div>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Student Progress</h3>
            <span style={styles.chartTag}>Classes & sections</span>
          </div>
          <div style={styles.chartBody}>
            <StudentProgressChart />
          </div>
        </div>
      </div>

      <div style={styles.fullWidthCard}>
        <div style={styles.chartHeader}>
          <h3 style={styles.chartTitle}>Fees Collection</h3>
          <span style={styles.chartTag}>Monthly trend</span>
        </div>
        <div style={styles.chartBody}>
          <FeesCollectionChart />
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "1.5rem 2rem",
    background: "linear-gradient(180deg, #f4f6fb 0%, #e9f1ff 100%)",
    minHeight: "calc(100vh - 72px)", // matches sticky header layout
  },

  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1.5rem",
    gap: "1rem",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "1.6rem",
    fontWeight: "700",
    color: "#003366",
  },
  subtitle: {
    margin: 0,
    marginTop: "0.25rem",
    fontSize: "0.95rem",
    color: "#5f6b8b",
  },

  headerRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "0.5rem",
  },

  badgeToday: {
    padding: "0.35rem 0.8rem",
    borderRadius: "999px",
    background:
      "linear-gradient(135deg, rgba(0,74,173,0.1), rgba(0,119,255,0.15))",
    border: "1px solid rgba(0,74,173,0.25)",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#004aad",
  },

  headerActions: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  actionButton: {
    padding: "0.35rem 0.9rem",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(135deg, #004aad, #0077ff)",
    color: "#fff",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    whiteSpace: "nowrap",
  },

  actionButtonSecondary: {
    padding: "0.35rem 0.9rem",
    borderRadius: 999,
    border: "1px solid rgba(0,74,173,0.3)",
    backgroundColor: "rgba(255,255,255,0.95)",
    color: "#004aad",
    fontSize: "0.8rem",
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "1.25rem",
    marginBottom: "1.75rem",
  },
  statItem: {},

  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "1.5rem",
    marginBottom: "1.5rem",
  },

  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: "1rem 1.2rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.04)",
  },
  fullWidthCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: "1rem 1.2rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.04)",
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  chartTitle: {
    margin: 0,
    fontSize: "1.05rem",
    fontWeight: "600",
    color: "#003366",
  },
  chartTag: {
    fontSize: "0.75rem",
    padding: "0.2rem 0.6rem",
    borderRadius: 999,
    backgroundColor: "#e3f2fd",
    color: "#0056b3",
    fontWeight: 500,
  },
  chartBody: {
    minHeight: 260,
  },

  centerBox: {
    maxWidth: 360,
    margin: "0 auto",
    marginTop: "15vh",
    textAlign: "center",
    backgroundColor: "#fff",
    padding: "1.5rem 1.75rem",
    borderRadius: 16,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.05)",
  },
  centerText: {
    marginTop: "0.75rem",
    fontSize: "0.95rem",
    color: "#5f6b8b",
    fontWeight: 500,
  },
  errorTitle: {
    margin: 0,
    marginBottom: "0.5rem",
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#b00020",
  },
  errorText: {
    margin: 0,
    marginBottom: "1rem",
    fontSize: "0.95rem",
    color: "#5f6b8b",
  },
  retryButton: {
    padding: "0.45rem 1.1rem",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(135deg, #004aad, #0077ff)",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  },
};
