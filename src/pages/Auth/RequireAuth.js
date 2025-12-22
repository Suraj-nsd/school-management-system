// RequireAuth.js
import React from "react";
import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
