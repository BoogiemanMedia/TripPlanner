// UI State Preservation
// Tracks open details and editing events to preserve across re-renders

let preservedOpenDays = new Set();
let preservedEditingEvents = new Set();
let preservedOpenCities = new Set();

export function saveUIState() {
  // Save open day details
  preservedOpenDays = new Set();
  document.querySelectorAll('details[data-day-id]').forEach(det => {
    if (det.open) preservedOpenDays.add(det.dataset.dayId);
  });

  // Save open city details (in City view)
  preservedOpenCities = new Set();
  document.querySelectorAll('details[data-city-id]').forEach(det => {
    if (det.open) preservedOpenCities.add(det.dataset.cityId);
  });

  // Save editing events
  preservedEditingEvents = new Set();
  document.querySelectorAll('.event.editing').forEach(el => {
    preservedEditingEvents.add(el.dataset.eventId);
  });
}

export function restoreUIState() {
  // Restore open day details
  document.querySelectorAll('details[data-day-id]').forEach(det => {
    if (preservedOpenDays.has(det.dataset.dayId)) {
      det.open = true;
    }
  });

  // Restore open city details
  document.querySelectorAll('details[data-city-id]').forEach(det => {
    if (preservedOpenCities.has(det.dataset.cityId)) {
      det.open = true;
    }
  });

  // Restore editing events
  document.querySelectorAll('.event').forEach(el => {
    if (preservedEditingEvents.has(el.dataset.eventId)) {
      el.classList.add('editing');
    }
  });
}
