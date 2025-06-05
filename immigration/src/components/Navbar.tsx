// src/components/Navbar.tsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar: React.FC = () => {
  // 1) Track whether the mobile menu is open
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // 2) Toggle handler for the hamburger
  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  // Helper function to check if link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="nav-content">
        {/* Logo + Text */}
        <div className="nav-logo">
          <Link to="/" onClick={() => setMenuOpen(false)} className="nav-logo-link">
            <img
              src={
                // Inline SVG data-URI as before
                `data:image/svg+xml;utf8,
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="%23FFD700" stroke="%23B8860B" stroke-width="4"/>
                  <path d="M30 35 L50 25 L70 35 L70 65 L50 75 L30 65 Z" fill="%23DC143C"/>
                  <circle cx="50" cy="50" r="15" fill="%23FFFFFF"/>
                </svg>`
              }
              alt="Department Logo"
              className="nav-logo-img"
            />
            <div className="nav-text">
              <span className="nav-title">Department of Immigration</span>
              <span className="nav-subtitle">Royal Government of Bhutan</span>
            </div>
          </Link>
        </div>

        {/* 3) Hamburger button (visible on small screens) */}
        <button className="nav-hamburger" onClick={toggleMenu}>
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>

        {/* 4) Links: add "open" class if menuOpen is true */}
        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li>
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`} 
              onClick={() => setMenuOpen(false)}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/about" 
              className={`nav-link ${isActive('/about') ? 'active' : ''}`} 
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
          </li>
          <li>
            <Link 
              to="/services" 
              className={`nav-link ${isActive('/services') ? 'active' : ''}`} 
              onClick={() => setMenuOpen(false)}
            >
              Services
            </Link>
          </li>
          <li>
            <Link 
              to="/contact" 
              className={`nav-link ${isActive('/contact') ? 'active' : ''}`} 
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>
          </li>
          <li>
            <Link 
              to="/verification" 
              className={`nav-link ${isActive('/verification') ? 'active' : ''}`} 
              onClick={() => setMenuOpen(false)}
            >
              Verification
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;