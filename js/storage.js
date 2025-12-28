// Storage functions

const STORAGE_KEY = "trip_planner_local_v2";

export function loadTrip() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error loading trip:", e);
    }
  }
  return null;
}

export function saveTrip(trip) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
}

export function clearTrip() {
  localStorage.removeItem(STORAGE_KEY);
}

export { STORAGE_KEY };
