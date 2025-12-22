// 📁 src/pages/Login.jsx
import React, { useState } from "react";
import { FaUser, FaLock, FaGraduationCap } from "react-icons/fa";
import { useAuth } from "../Auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #004aad, #0077ff)",
        overflow: "hidden",
      }}
    >
      <div
        className="card shadow-lg border-0"
        style={{
          maxWidth: "420px",
          width: "90%",
          borderRadius: "1rem",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="text-center text-white py-4"
          style={{
            background: "linear-gradient(135deg, #00348c, #006eff)",
          }}
        >
          <FaGraduationCap size={40} className="mb-2" />
          <h4 className="fw-bold mb-0">Sunrise Public School</h4>
          <p className="mb-0" style={{ fontSize: "0.9rem" }}>
            Login to your portal
          </p>
        </div>

        {/* Form */}
        <form className="p-4" onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label fw-semibold">
              Username
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light">
                <FaUser />
              </span>
              <input
                id="username"
                type="text"
                className="form-control"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light">
                <FaLock />
              </span>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 fw-bold py-2"
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, #004aad, #0077ff)",
              border: "none",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && (
            <div className="alert alert-danger text-center mt-3 mb-0">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div
          className="text-center text-muted small py-3 border-top"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          &copy; {new Date().getFullYear()} Sunrise Public School, Gorakhpur —{" "}
          <br />
          <span className="text-primary fw-semibold">
            “Empowering Education for Every Student”
          </span>
        </div>
      </div>
    </div>
  );
}
