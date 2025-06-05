// src/utils/alerts.tsx

import React, { useEffect, useRef, useState, ReactNode } from "react";

export type AlertType = "success" | "error";

interface AlertProps {
  type: AlertType;
  message: string;
  onDismiss: () => void;
}

/**
 * Alert component that:
 * 1. Renders a Bootstrap-style alert with a close button.
 * 2. After 3 seconds, removes 'show' and adds 'fade'.
 * 3. Listens for 'transitionend' to call onDismiss().
 */
const Alert: React.FC<AlertProps> = ({ type, message, onDismiss }) => {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // Automatically fade out after 3 seconds
    const timer = window.setTimeout(() => {
      el.classList.remove("show");
      el.classList.add("fade");

      // Once the CSS transition completes, call onDismiss()
      const handleTransitionEnd = () => {
        onDismiss();
      };
      el.addEventListener("transitionend", handleTransitionEnd);
    }, 3000);

    // Cleanup: clear timer and remove transition listener
    return () => {
      clearTimeout(timer);
      el.removeEventListener("transitionend", onDismiss);
    };
  }, [onDismiss]);

  // Inline colors based on type
  const backgroundColor = type === "success" ? "#28a745" : "#dc3545";
  const textColor = "#fff";

  return (
    <div
      ref={elRef}
      className="alert alert-dismissible show"
      role="alert"
      style={{
        backgroundColor,
        color: textColor,
        position: "relative",
        transition: "opacity 0.3s ease",
        padding: "1rem 1rem",
        fontSize: "1rem",
        borderRadius: "0.25rem",
      }}
    >
      <span>{message}</span>
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={() => {
          const el = elRef.current;
          if (!el) return;
          el.classList.remove("show");
          el.classList.add("fade");
          el.addEventListener("transitionend", onDismiss);
        }}
        style={{
          position: "absolute",
          top: "0.5rem",
          right: "0.75rem",
          background: "transparent",
          border: "none",
          color: "#fff",
          fontSize: "1.2rem",
          lineHeight: "1",
          cursor: "pointer",
        }}
      >
        &times;
      </button>
    </div>
  );
};

/**
 * Hook to manage exactly one Alert at a time.
 */
export function useAlert() {
  const [alertConfig, setAlertConfig] = useState<{
    type: AlertType;
    message: string;
  } | null>(null);

  const showAlert = (type: AlertType, message: string) => {
    setAlertConfig({ type, message });
  };

  const hideAlert = () => {
    setAlertConfig(null);
  };

  const alertElement: ReactNode = alertConfig ? (
    <Alert
      key={alertConfig.message /* force remount if same message */}
      type={alertConfig.type}
      message={alertConfig.message}
      onDismiss={hideAlert}
    />
  ) : null;

  return { alertElement, showAlert, hideAlert };
}
