import React, { useState } from 'react';
import VerifyQRScanner from './VerifyQRScanner';

const BhutanImmigrationPortal: React.FC = () => {
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
              Verification Portal
            </h1>
            <p className="hero-subtitle">Scan to verify your employee credentials</p>
          </div>

          <div className="hero-right">
            {/* Use VerifyQRScanner component instead of QRScanner */}
            <VerifyQRScanner />
          </div>
        </div>
      </div>
    </>
  );
};

export default BhutanImmigrationPortal;