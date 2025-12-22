// 📁 src/pages/Navigation.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaBookOpen,
  FaMoneyBillWave,
  FaSignInAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaSchool,
  FaTachometerAlt,
} from "react-icons/fa";
import { useAuth } from "../Auth/AuthContext";
import "animate.css";

// ======== SCHOOL DETAILS (correct name + address) =========
const SCHOOL_NAME = "SUSHILA DEVI JUNIOR HIGH SCHOOL";
const SCHOOL_ADDRESS_LINE_1 = "Muhal Jalkar";
const SCHOOL_ADDRESS_LINE_2 = "Laxmipur Post Beliwa Dakhili";
const SCHOOL_ADDRESS_LINE_3 = "Barhalganj, Gorakhpur – 273402";

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, profile, logout } = useAuth();

  // For small text on top bar (today)
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Detect scroll to apply shadow
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) setScrolled(true);
      else setScrolled(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set page title
  useEffect(() => {
    const map = {
      "/": "Home",
      "/courses": "Courses",
      "/fees": "Fee Structure",
      "/login": "Login",
      "/admin/dashboard": "Admin Dashboard",
      "/teacher": "Teacher Panel",
      "/student": "Student Panel",
    };
    const pageTitle = map[location.pathname] || "School Portal";
    document.title = `${pageTitle} | ${SCHOOL_NAME}`;
  }, [location.pathname]);

  // MAIN NAV LINKS (same as your original)
  const links = [
    { path: "/", text: "Home", icon: <FaHome /> },
    { path: "/courses", text: "Courses", icon: <FaBookOpen /> },
    { path: "/fees", text: "Fee Structure", icon: <FaMoneyBillWave /> },
  ];

  const getDashboardPath = () => {
    const role = profile?.role?.toLowerCase();
    if (role === "admin") return "/admin/dashboard";
    if (role === "teacher") return "/teacher";
    if (role === "student") return "/student";
    return "/";
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  const displayName =
    profile?.name ||
    profile?.fullName ||
    profile?.email ||
    profile?.username ||
    profile?.role ||
    "User";

  const roleLabel = profile?.role
    ? profile.role.toString().toUpperCase()
    : null;

  return (
    <>
      {/* ============ TOP SCHOOL INFO BAR (MOBILE + DESKTOP) ============ */}
      {/* <div className="bg-dark text-light py-1 small">
        <div className="container-fluid px-3 px-md-4 d-flex flex-column flex-md-row justify-content-between">
          <div className="d-flex flex-column">
            <span className="fw-semibold d-flex align-items-center gap-1">
              <FaSchool /> {SCHOOL_NAME}
            </span>
            <span>{SCHOOL_ADDRESS_LINE_1}</span>
            <span>{SCHOOL_ADDRESS_LINE_2}</span>
            <span>{SCHOOL_ADDRESS_LINE_3}</span>
          </div>
          <div className="mt-2 mt-md-0 text-md-end">
            <span>Today: {today}</span>
          </div>
        </div>
      </div> */}

      {/* =================== NAVBAR =================== */}
      <nav
        className={`navbar navbar-expand-lg navbar-dark sticky-top shadow-sm ${
          scrolled ? "bg-opacity-90" : ""
        }`}
        style={{
          background: scrolled
            ? "rgba(0, 74, 173, 0.96)"
            : "linear-gradient(135deg, #004aad, #0077ff)",
          backdropFilter: scrolled ? "blur(8px)" : "none",
          boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.12)" : "none",
          transition: "all 0.3s ease",
          letterSpacing: "0.3px",
          zIndex: 1050,
        }}
      >
        <div className="container-fluid px-3 px-md-4 d-flex justify-content-between align-items-center">
          {/* Brand (short for mobile) */}
          <Link
            className="navbar-brand d-flex align-items-center gap-2 fw-bold"
            to="/"
            style={{
              color: "white",
              textShadow: "0 1px 3px rgba(0,0,0,0.3)",
              fontSize: "1rem",
            }}
          >
            <FaSchool size={22} />
            <span className="d-none d-sm-inline">
              {SCHOOL_NAME}
            </span>
            <span className="d-inline d-sm-none">Sushila Devi JHS</span>
          </Link>

          {/* Mobile toggle */}
          <button
            className="btn btn-outline-light d-lg-none"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <FaBars size={20} />
          </button>

          {/* Desktop Menu */}
          <div className="d-none d-lg-flex align-items-center">
            {links.map(({ path, text, icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={text}
                  to={path}
                  className={`nav-link text-white mx-2 d-flex align-items-center gap-2 ${
                    isActive
                      ? "fw-semibold border-bottom border-warning text-warning"
                      : "opacity-90"
                  }`}
                  style={{ fontSize: "0.95rem", transition: "0.3s" }}
                >
                  {icon} {text}
                </Link>
              );
            })}

            {isAuthenticated ? (
              <>
                {/* Dashboard */}
                <Link
                  to={getDashboardPath()}
                  className="btn btn-warning fw-semibold d-flex align-items-center gap-2 ms-3"
                >
                  <FaTachometerAlt /> Dashboard
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-light fw-semibold d-flex align-items-center gap-2 ms-3"
                >
                  <FaSignOutAlt /> Logout
                </button>

                {/* User info */}
                <span className="text-white ms-3 d-flex flex-column align-items-start">
                  <span className="d-flex align-items-center gap-1 fw-semibold">
                    <FaUserCircle /> {displayName}
                  </span>
                  {roleLabel && (
                    <small className="text-warning fw-semibold">
                      Role: {roleLabel}
                    </small>
                  )}
                </span>
              </>
            ) : (
              <Link
                to="/login"
                className="btn btn-outline-warning fw-semibold d-flex align-items-center gap-2 ms-3"
              >
                <FaSignInAlt /> Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* =================== MOBILE SLIDE MENU =================== */}
      {menuOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex flex-column text-white p-4 animate__animated animate__fadeInRight"
          style={{
            zIndex: 2000,
            backdropFilter: "blur(6px)",
          }}
        >
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="m-0 fw-bold d-flex align-items-center gap-2">
                <FaSchool />
                {SCHOOL_NAME}
              </h5>
              <small className="text-white-50">
                {SCHOOL_ADDRESS_LINE_3}
              </small>
            </div>
            <button
              className="btn btn-light rounded-circle"
              onClick={() => setMenuOpen(false)}
            >
              <FaTimes />
            </button>
          </div>

          {/* Links */}
          <div className="flex-grow-1">
            {links.map(({ path, text, icon }) => (
              <Link
                key={text}
                to={path}
                onClick={() => setMenuOpen(false)}
                className={`d-flex align-items-center gap-3 py-3 border-bottom ${
                  location.pathname === path
                    ? "text-warning fw-semibold"
                    : "text-white-50"
                }`}
                style={{ fontSize: "1.05rem" }}
              >
                {icon} {text}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMenuOpen(false)}
                  className="d-flex align-items-center gap-3 py-3 border-bottom text-white fw-semibold"
                  style={{ fontSize: "1.05rem" }}
                >
                  <FaTachometerAlt /> Dashboard
                </Link>

                {/* User info in mobile */}
                <div className="mt-3 mb-2 text-white-50 small">
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <FaUserCircle />
                    <span>{displayName}</span>
                  </div>
                  {roleLabel && <span>Role: {roleLabel}</span>}
                </div>

                <button
                  onClick={handleLogout}
                  className="btn btn-outline-warning w-100 mt-3 d-flex align-items-center justify-content-center gap-2"
                  style={{ fontSize: "1rem" }}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </>
            )}

            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="btn btn-outline-warning w-100 mt-4 d-flex align-items-center justify-content-center gap-2"
              >
                <FaSignInAlt /> Login
              </Link>
            )}
          </div>

          {/* Footer */}
          <div className="text-center small text-white-50 border-top pt-3 mt-auto">
            &copy; {new Date().getFullYear()} {SCHOOL_NAME}
          </div>
        </div>
      )}
    </>
  );
}
