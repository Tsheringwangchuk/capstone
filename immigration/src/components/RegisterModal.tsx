// src/components/RegisterModal.tsx

import React, { useState, useRef } from "react";
import "./RegisterModal.css";
import { useAlert } from "../utils/alerts";

interface RegisterModalProps {
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose }) => {
  const [employeename, setEmployeename] = useState("");
  const [cid, setCid] = useState("");
  const [date, setDate] = useState(""); // holds the DOB string
  const [employername, setEmployername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useAlert hook
  const { alertElement, showAlert, hideAlert } = useAlert();

  // Ref to clear the form if needed
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    hideAlert(); // Clear any existing alert

    try {
      const response = await fetch(
        "http://localhost:4001/api/v1/registrationDetails/registerDetails",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employeename,
            cid,
            date,
            employername,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to register details");
      }

      const responseData = await response.json();
      console.log("Success:", responseData);

      if (responseData.status === "success") {
        // 1) Show success alert
        showAlert("success", "Successfully registered your employee!");

        // 2) Reset state & form fields immediately
        setEmployeename("");
        setCid("");
        setDate("");
        setEmployername("");
        formRef.current?.reset();

        // 3) Wait 3.3s (3s display + 0.3s fade) before closing modal
        setTimeout(() => {
          onClose();
        }, 3300);
      }
    } catch (err: any) {
      console.error("Error during registration:", err);
      showAlert("error", err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-container" id="registerModal">
        <div className="modal-header">
          <h2>↪ Add details of your Employee</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Modal Body: render alerts here */}
        <div className="modal-body">
          {alertElement}

          <form
            className="modal-form registerForm"
            onSubmit={handleSubmit}
            ref={formRef}
          >
            {/* Employee Name */}
            <label className="form-label">
              <span className="label-icon">👤</span>
              <span className="label-text">Employee Name</span>
              <input
                type="text"
                className="form-input"
                placeholder="Enter employee full name"
                value={employeename}
                onChange={(e) => setEmployeename(e.target.value)}
                required
              />
            </label>

            {/* Citizenship ID */}
            <label className="form-label">
              <span className="label-icon">📇</span>
              <span className="label-text">Citizenship ID (CID)</span>
              <div className="cid-input-wrapper">
                <span className="cid-prefix">CID</span>
                <input
                  type="text"
                  className="form-input cid-input"
                  placeholder="Enter your 11-digit Citizenship ID number"
                  value={cid}
                  onChange={(e) => setCid(e.target.value)}
                  maxLength={11}
                  required
                />
              </div>
            </label>

            {/* Date of Birth */}
            <label className="form-label">
              <span className="label-icon">📅</span>
              <span className="label-text">Date of Birth</span>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>

            {/* Employer / Organization Name */}
            <label className="form-label">
              <span className="label-icon">🏢</span>
              <span className="label-text">Employer/Organization Name</span>
              <input
                type="text"
                className="form-input"
                placeholder="Enter employer or organization name"
                value={employername}
                onChange={(e) => setEmployername(e.target.value)}
                required
              />
            </label>

            <div className="modal-buttons">
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting…" : "↪ Submit"}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RegisterModal;
