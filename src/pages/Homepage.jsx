import React from "react";
import { Link } from "react-router-dom";
import {
  FaSchool,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaBookOpen,
  FaUsers,
  FaFemale,
  FaWater,
  FaSolarPanel,
  FaTree,
  FaBell,
  FaImages,
} from "react-icons/fa";
import "./HomePage.css";

export default function HomePage() {
  return (
    <div className="homepage">

      {/* HERO SECTION */}
      <section className="hero-section text-white text-center d-flex align-items-center">
        <div className="container hero-content">
          <h1 className="fw-bold display-5 animate-pop">
            SUSHILA DEVI JUNIOR HIGH SCHOOL
          </h1>
          <p className="lead mt-3 animate-fade">
            Muhaljalkar, Laxmipur, Barahlganj, Gorakhpur (UP)
          </p>

          <div className="mt-4 d-flex justify-content-center gap-3 flex-wrap animate-slide-up">
            <Link to="/admission" className="btn btn-warning btn-lg fw-bold">
              Online Admission
            </Link>
            <Link to="/login" className="btn btn-outline-light btn-lg fw-bold">
              Student Login
            </Link>
          </div>
        </div>
      </section>

      {/* NOTICE MARQUEE */}
      <div className="school-marquee">
        <marquee>
          🔔 Admission Open 2025–26 | English Medium | Established 2012 |
          Library • Playground • Solar Panels • Rain Water Harvesting
        </marquee>
      </div>

      {/* ABOUT */}
      <section className="py-5 bg-light text-center reveal">
        <div className="container">
          <h2 className="fw-bold mb-3">About Our School</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: 850 }}>
            Sushila Devi Junior High School provides quality English-medium
            education with strong discipline, moral values, and a safe,
            eco-friendly learning environment.
          </p>
        </div>
      </section>

      {/* KEY STATS */}
      <section className="py-5 reveal">
        <div className="container">
          <h2 className="fw-bold text-center mb-5">Key Statistics</h2>

          <div className="row g-4 text-center">
            {[
              { icon: <FaUsers />, value: "421+", label: "Students" },
              { icon: <FaChalkboardTeacher />, value: "42:1", label: "PTR" },
              { icon: <FaFemale />, value: "90%", label: "Female Teachers" },
              { icon: <FaUserGraduate />, value: "2%", label: "Failure Rate" },
            ].map((item, i) => (
              <div className="col-md-3 col-6" key={i}>
                <div className="stat-card hover-float">
                  <div className="icon">{item.icon}</div>
                  <h4>{item.value}</h4>
                  <p>{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FACILITIES */}
      <section className="py-5 bg-light reveal">
        <div className="container">
          <h2 className="fw-bold text-center mb-5">Facilities</h2>

          <div className="row g-4 text-center">
            {[
              { icon: <FaBookOpen />, text: "Library" },
              { icon: <FaWater />, text: "Drinking Water" },
              { icon: <FaSolarPanel />, text: "Solar Energy" },
              { icon: <FaTree />, text: "Rain Water Harvesting" },
            ].map((f, i) => (
              <div className="col-md-3 col-6" key={i}>
                <div className="facility-card hover-glow">
                  <div className="icon">{f.icon}</div>
                  <p>{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NOTICE BOARD */}
      <section className="py-5 reveal">
        <div className="container">
          <h2 className="fw-bold text-center mb-4">
            <FaBell /> Latest Notices
          </h2>
          <ul className="notice-list">
            <li>📢 Admission Open for Session 2025–26</li>
            <li>📢 Parent-Teacher Meeting on 15th July</li>
            <li>📢 Unit Test Starts from 22nd July</li>
          </ul>
        </div>
      </section>

      {/* GALLERY */}
      <section className="py-5 bg-light reveal">
        <div className="container">
          <h2 className="fw-bold text-center mb-4">
            <FaImages /> School Gallery
          </h2>

          <div className="row g-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div className="col-md-4 col-6" key={i}>
                <div className="gallery-box" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section text-center text-white py-5 reveal">
        <div className="container">
          <h2 className="fw-bold">Give Your Child a Bright Future</h2>
          <p className="mb-4">
            Contact us today for admission and school information.
          </p>
          <Link to="/contact" className="btn btn-warning btn-lg fw-bold">
            Contact School
          </Link>
        </div>
      </section>
    </div>
  );
}
