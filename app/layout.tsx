import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HVAC Diagnostic Agent",
  description: "Field diagnostic tool for HVAC technicians",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#0f1724", color: "#e8e6df", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
