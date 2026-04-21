"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Invalid access code. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f1724",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          backgroundColor: "#1a2332",
          borderRadius: "12px",
          padding: "2.5rem",
          width: "100%",
          maxWidth: "380px",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              backgroundColor: "#5d9cf5",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              fontSize: "1.5rem",
            }}
          >
            ❄
          </div>
          <h1
            style={{
              color: "#e8e6df",
              fontSize: "1.25rem",
              fontWeight: 600,
              margin: "0 0 0.5rem",
              letterSpacing: "-0.01em",
            }}
          >
            HVAC Diagnostic Agent
          </h1>
          <p style={{ color: "#8b9bb4", fontSize: "0.875rem", margin: 0 }}>
            Enter demo access code
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Access code"
            autoFocus
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              backgroundColor: "#0f1724",
              border: `1px solid ${error ? "#ef4444" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "8px",
              color: "#e8e6df",
              fontSize: "0.875rem",
              outline: "none",
              boxSizing: "border-box",
              marginBottom: error ? "0.5rem" : "1rem",
              transition: "border-color 0.15s",
            }}
          />

          {error && (
            <p
              style={{
                color: "#ef4444",
                fontSize: "0.8rem",
                margin: "0 0 1rem",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: loading || !password ? "#2a3a52" : "#5d9cf5",
              color: loading || !password ? "#8b9bb4" : "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: loading || !password ? "not-allowed" : "pointer",
              transition: "background-color 0.15s",
            }}
          >
            {loading ? "Verifying…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
