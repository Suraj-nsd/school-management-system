// import React, { useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";
// import { useAuth } from "../pages/AuthContext";
// import { Bar } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from "chart.js";

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// export default function AdminDashboard() {
//   const { profile } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // States for each table data (optional, can be used for UI)
//   const [attendance, setAttendance] = useState([]);
//   const [marks, setMarks] = useState([]);
//   const [profiles, setProfiles] = useState([]);
//   const [salaries, setSalaries] = useState([]);
//   const [studentSubjects, setStudentSubjects] = useState([]);
//   const [students, setStudents] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [teachers, setTeachers] = useState([]);
//   const [users, setUsers] = useState([]);

//   useEffect(() => {
//     async function fetchAll() {
//       try {
//         setLoading(true);
//         setError(null);

//         const [
//           { data: attendanceData, error: attendanceError },
//           { data: marksData, error: marksError },
//           { data: profilesData, error: profilesError },
//           { data: salariesData, error: salariesError },
//           { data: studentSubjectsData, error: ssError },
//           { data: studentsData, error: studentsError },
//           { data: subjectsData, error: subjectsError },
//           { data: teachersData, error: teachersError },
//           { data: usersData, error: usersError },
//         ] = await Promise.all([
//           supabase.from("attendance").select("*"),
//           supabase.from("marks").select("*"),
//           supabase.from("profiles").select("*"),
//           supabase.from("salaries").select("*"),
//           supabase.from("student_subjects").select("*"),
//           supabase.from("students").select("*"),
//           supabase.from("subjects").select("*"),
//           supabase.from("teachers").select("*"),
//           supabase.from("users").select("*"),
//         ]);

//         if (attendanceError) throw attendanceError;
//         if (marksError) throw marksError;
//         if (profilesError) throw profilesError;
//         if (salariesError) throw salariesError;
//         if (ssError) throw ssError;
//         if (studentsError) throw studentsError;
//         if (subjectsError) throw subjectsError;
//         if (teachersError) throw teachersError;
//         if (usersError) throw usersError;

//         // Set states (optional, for UI use)
//         setAttendance(attendanceData);
//         setMarks(marksData);
//         setProfiles(profilesData);
//         setSalaries(salariesData);
//         setStudentSubjects(studentSubjectsData);
//         setStudents(studentsData);
//         setSubjects(subjectsData);
//         setTeachers(teachersData);
//         setUsers(usersData);

//         // Log data for inspection
//         console.log("Attendance:", attendanceData);
//         console.log("Marks:", marksData);
//         console.log("Profiles:", profilesData);
//         console.log("Salaries:", salariesData);
//         console.log("Student Subjects:", studentSubjectsData);
//         console.log("Students:", studentsData);
//         console.log("Subjects:", subjectsData);
//         console.log("Teachers:", teachersData);
//         console.log("Users:", usersData);

//       } catch (err) {
//         setError(err.message || "Failed to load data");
//         console.error("Error loading data:", err);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchAll();
//   }, []);

//   if (loading) return <p>Loading all data...</p>;
//   if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

//   return (
//     <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
//       <h1>Admin Dashboard</h1>
//       <p>Welcome, {profile?.full_name || profile?.username || "Admin"}!</p>

//       <p>All data fetched. Check browser console for detailed data.</p>

//       {/* You can extend UI below to visualize or manage this data */}
//     </div>
//   );
// }
