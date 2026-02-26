"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Root Error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            background: "#f8f8f8",
          }}
        >
          <div style={{ maxWidth: 480, textAlign: "center" }}>
            <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 12, color: "#1a365d" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#666", marginBottom: 16 }}>{error.message}</p>
            {error.digest && (
              <p style={{ fontSize: 12, color: "#999", marginBottom: 16 }}>
                Error ID: {error.digest}
              </p>
            )}
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              <button
                onClick={reset}
                style={{
                  padding: "10px 24px",
                  background: "#1a365d",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  padding: "10px 24px",
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "#333",
                  fontWeight: 500,
                }}
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
