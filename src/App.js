// App.js
import React from "react";
import "animate.css";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "../src/pages/Auth/AuthContext";
import AppRoutes from "./AppRoutes";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
