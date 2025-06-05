import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "../src/components/Navbar";
import RegisterModal from "../src/components/RegisterModal";
import QRScanner from "../src/components/QRScanner";
import BhutanImmigrationPortal from "../src/components/Verification";
import "./App.css";

// Your existing main page component
const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="hero-container">
        <div className="hero-overlay">
          <div className="hero-left">
            <h1 className="hero-title">
              BHUTAN
              <br />
              Immigration
              <br />
              Services Portal
            </h1>
            <p className="hero-subtitle">Register your employee with us</p>

            <button className="register-button" onClick={openModal}>
              {/* Inline user-plus SVG (20×20) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
                width="20"
                height="20"
                style={{ marginRight: 8, verticalAlign: "middle" }}
                fill="currentColor"
              >
                <path d="M224 256a128 128 0 1 0-128-128 128 128 0 0 0 128 128zm89.6 32h-11.2
                         a174.75 174.75 0 0 1-156.8 0h-11.2A134.4 134.4 0 0 0 0 422.4V464
                         a48 48 0 0 0 48 48h352a48 48 0 0 0 48-48v-41.6A134.4 134.4 0 0 0 313.6 288zm274.4
                         33.6h-48v-48a16 16 0 0 0-32 0v48h-48a16 16 0 0 0 0 32h48v48a16 16 0 0 0 32
                         0v-48h48a16 16 0 0 0 0-32z" />
              </svg>
              Register
            </button>
          </div>

          <div className="hero-right">
            {/* Instead of a static QR, render your dynamic QRScanner component: */}
            <QRScanner />
          </div>
        </div>
      </div>

      {isModalOpen && <RegisterModal onClose={closeModal} />}
    </>
  );
};

// Placeholder components for other pages
const About: React.FC = () => (
  <div className="page-content">
    <h1>About Us</h1>
    <p>Learn more about the Department of Immigration</p>
  </div>
);

const Services: React.FC = () => (
  <div className="page-content">
    <h1>Our Services</h1>
    <p>Explore our immigration services</p>
  </div>
);

const Contact: React.FC = () => (
  <div className="page-content">
    <h1>Contact Us</h1>
    <p>Get in touch with our team</p>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/verification" element={<BhutanImmigrationPortal />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;