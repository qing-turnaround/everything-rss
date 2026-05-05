export function getApiBase(): string {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("apiBaseUrl");
    if (stored) return stored;
  }
  return import.meta.env.VITE_API_BASE || "http://localhost:8080";
}

export function apiUrl(path: string): string {
  return `${getApiBase()}${path}`;
}
