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
        <button
          className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 active:opacity-80"
          style={{ backgroundColor: "#5d9cf5" }}
        >
          Start Diagnostic
        </button>
      </div>
    </main>
  );
}
