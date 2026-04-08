const STORAGE_KEY = "hvac-diagnostics";
const MAX_ENTRIES = 50;

export interface DiagnosticEntry {
  id: number;
  timestamp: string;
  complaintType: string;
  result: unknown;
  answers: unknown;
}

export function saveDiagnostic(result: unknown, answers: unknown): number {
  const history = getHistory();
  const entry: DiagnosticEntry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    complaintType: (answers as Record<string, unknown>)?.["complaint"] as string ?? "unknown",
    result,
    answers,
  };
  const updated = [entry, ...history].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return entry.id;
}

export function getHistory(): DiagnosticEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as DiagnosticEntry[];
  } catch {
    return [];
  }
}

export function deleteDiagnostic(id: number): void {
  const updated = getHistory().filter((entry) => entry.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}
