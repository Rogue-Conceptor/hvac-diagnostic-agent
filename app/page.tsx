import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-3xl font-bold tracking-tight mb-3" style={{ color: "#e8e6df" }}>
          HVAC Diagnostic Agent
        </h1>
        <p className="text-base mb-8" style={{ color: "#8b9bb4" }}>
          Field diagnostic tool for HVAC technicians
        </p>
        <div className="flex flex-col items-center" style={{ gap: 16 }}>
          <Link
            href="/diagnostic"
            className="inline-block w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
            style={{ backgroundColor: "#5d9cf5" }}
          >
            Start Diagnostic
          </Link>
          <Link
            href="/history"
            className="inline-block w-full sm:w-auto px-8 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 active:opacity-80"
            style={{ border: "1.5px solid #5d9cf5", color: "#5d9cf5", backgroundColor: "transparent" }}
          >
            View History
          </Link>
        </div>
      </div>
    </main>
  );
}
