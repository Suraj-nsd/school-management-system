import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../AuthContext";

const SCHOOL_NAME = "Sushila Devi Junior High School";
const SCHOOL_TAGLINE =
  "Muhal Jalkar, Laxmipur Post Beliwa Dakhili, Barhalganj, Gorakhpur – 273402";

export default function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const userEmail = user?.email || "";
  const userInitial = userEmail.charAt(0).toUpperCase();

  // Set browser tab title
  useEffect(() => {
    document.title = `${SCHOOL_NAME} | School Portal`;
  }, []);

  // Close user dropdown on route change
  useEffect(() => {
    setShowMenu(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setShowMenu(false);
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout:", error.message);
    }
  };

  const navLinks = [
    { path: "/", label: "Dashboard" },
    { path: "/attendance", label: "Attendance" },
    { path: "/reports", label: "Reports" },
  ];

  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        {/* Brand / School info */}
        <Link to="/" style={styles.brandWrapper}>
          <div style={styles.brandLogo}>
            <span style={styles.brandLogoText}>SD</span>
          </div>
          <div>
            <h1 style={styles.logo}>{SCHOOL_NAME}</h1>
            <p style={styles.subTitle}>{SCHOOL_TAGLINE}</p>
          </div>
        </Link>

        {/* Right side – nav links + user menu */}
        <div style={styles.links}>
          {navLinks.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              style={{
                ...styles.link,
                ...(location.pathname === path ? styles.activeLink : {}),
              }}
            >
              {label}
            </Link>
          ))}

          {!userEmail ? (
            <Link to="/login" style={styles.loginButton}>
              Login
            </Link>
          ) : (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowMenu((prev) => !prev)}
                aria-label="User menu"
                aria-expanded={showMenu}
                title={userEmail}
                style={styles.avatar}
              >
                {userInitial}
              </button>

                {showMenu && (
                  <div style={styles.dropdown} role="menu">
                    <div style={styles.dropdownHeader}>
                      <p style={styles.dropdownEmail}>{userEmail}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      style={styles.dropdownItem}
                      type="button"
                    >
                      Logout
                    </button>
                  </div>
                )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

const styles = {
  header: {
    background: "linear-gradient(135deg, #004aad, #0077ff)",
    color: "#fff",
    padding: "0.7rem 1rem",
    boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    maxWidth: 1200,
    margin: "0 auto",
    flexWrap: "wrap", // helps on small screens
  },
  brandWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    textDecoration: "none",
    color: "inherit",
    minWidth: 0,
  },
  brandLogo: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    backgroundColor: "#ffd54f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    flexShrink: 0,
  },
  brandLogoText: {
    fontWeight: "bold",
    color: "#003366",
    fontSize: "1.1rem",
  },
  logo: {
    margin: 0,
    fontSize: "1.2rem",
    fontWeight: "700",
    lineHeight: 1.1,
    whiteSpace: "nowrap",
  },
  subTitle: {
    margin: 0,
    fontSize: "0.7rem",
    opacity: 0.9,
    maxWidth: 260,
    lineHeight: 1.2,
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginLeft: "auto",
    flexWrap: "wrap",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "0.9rem",
    position: "relative",
    paddingBottom: "2px",
    transition: "color 0.3s, border-bottom 0.3s",
  },
  activeLink: {
    borderBottom: "2px solid #ffd54f",
  },
  loginButton: {
    padding: "0.35rem 0.9rem",
    borderRadius: 999,
    border: "1px solid #ffd54f",
    backgroundColor: "rgba(0,0,0,0.1)",
    color: "#fff",
    fontSize: "0.85rem",
    textDecoration: "none",
    fontWeight: 500,
    cursor: "pointer",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    backgroundColor: "#ffd54f",
    border: "none",
    color: "#003366",
    fontWeight: "bold",
    fontSize: "1.1rem",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    transition: "transform 0.2s",
  },
  dropdown: {
    position: "absolute",
    right: 0,
    top: "calc(100% + 8px)",
    backgroundColor: "#fff",
    color: "#003366",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
    padding: "0.25rem 0",
    minWidth: 180,
    zIndex: 1000,
  },
  dropdownHeader: {
    padding: "0.4rem 0.9rem",
    borderBottom: "1px solid #e5e5e5",
  },
  dropdownEmail: {
    margin: 0,
    fontSize: "0.8rem",
    color: "#555",
    wordBreak: "break-all",
  },
  dropdownItem: {
    background: "none",
    border: "none",
    color: "#003366",
    fontWeight: "500",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    padding: "0.5rem 0.9rem",
    fontSize: "0.9rem",
    transition: "background 0.2s",
  },
};
