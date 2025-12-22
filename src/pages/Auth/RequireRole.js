// RequireRole.js
import React from "react";
import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

export default function RequireRole({ role, children }) {
  const { user, profile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!profile || profile.role !== role) return <Navigate to="/" replace />;

  return children;
}
