// 📁 src/pages/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Check saved session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    const storedRole = localStorage.getItem("userRole");
    if (storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setProfile({ role: storedRole });
    }
    setLoading(false);
  }, []);

  // ✅ Login using Supabase users table
  const login = async (username, password) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error || !data) throw new Error("Invalid username or password");
    if (data.password !== password) throw new Error("Invalid password");

    // Save user in state
    setUser(data);
    setProfile({ role: data.role });
    localStorage.setItem("userData", JSON.stringify(data));
    localStorage.setItem("userRole", data.role);

    // Redirect by role
    const role = data.role?.toLowerCase();
    if (role === "admin") navigate("/admin/dashboard");
    else if (role === "teacher") navigate("/teacher");
    else navigate("/student");
  };

  // ✅ Logout and redirect home
  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem("userData");
    localStorage.removeItem("userRole");
    navigate("/");
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
