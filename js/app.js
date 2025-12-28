// Main Application Module

import { addDays, escapeHtml } from './utils.js';
import { loadTrip, saveTrip } from './storage.js';
import {
  getTrip, setTrip, createDemoTrip, createCity, createEvent,
  regenerateDaysPreserve, isCitySelected, selectAllCities, selectNoCities,
  toggleCitySelection, selectedCityIds, setSelectedCities
} from './state.js';
import { saveUIState, restoreUIState } from './ui-state.js';
import { wireCityListDnD } from './drag-drop.js';
import { renderAllView } from './views/all-view.js';
import { renderCityView } from './views/city-view.js';
import { renderTimelineView } from './views/timeline-view.js';
import { renderTicketsView } from './views/tickets-view.js';

// DOM Elements
let viewAll, viewCity, viewTimeline, viewTickets, timelineContent;
let tripTitle, tripDates, inpTripName, inpStartDate;
let cityList, cityFilterList, cityFilterCount;
let btnSaveTrip, btnExport, btnExportPdf, btnReset, btnAddCity, inpImport;
let btnSelectAll, btnSelectNone;

// Initialize DOM references
function initDOMRefs() {
  viewAll = document.getElementById('viewAll');
  viewCity = document.getElementById('viewCity');
  viewTimeline = document.getElementById('viewTimeline');
  viewTickets = document.getElementById('viewTickets');
  timelineContent = document.getElementById('timelineContent');

  tripTitle = document.getElementById('tripTitle');
  tripDates = document.getElementById('tripDates');
  inpTripName = document.getElementById('inpTripName');
  inpStartDate = document.getElementById('inpStartDate');

  cityList = document.getElementById('cityList');
  cityFilterList = document.getElementById('cityFilterList');
  cityFilterCount = document.getElementById('cityFilterCount');

  btnSaveTrip = document.getElementById('btnSaveTrip');
  btnExport = document.getElementById('btnExport');
  btnExportPdf = document.getElementById('btnExportPdf');
  btnReset = document.getElementById('btnReset');
  btnAddCity = document.getElementById('btnAddCity');
  inpImport = document.getElementById('inpImport');

  btnSelectAll = document.getElementById('btnSelectAll');
  btnSelectNone = document.getElementById('btnSelectNone');
}

// Render trip metadata
function renderTripMeta() {
  const trip = getTrip();
  tripTitle.textContent = trip.name || "Sin nombre";
  inpTripName.value = trip.name || "";
  inpStartDate.value = trip.startDate;

  const totalNights = trip.cities.reduce((s, c) => s + c.nights, 0);
  const endExclusive = addDays(trip.startDate, totalNights);

  import('./utils.js').then(({ formatDateES }) => {
    tripDates.textContent = `${formatDateES(trip.startDate)} → ${formatDateES(addDays(endExclusive, -1))}`;
  });
}

// Render city list in sidebar
function renderCities() {
  const trip = getTrip();
  cityList.innerHTML = "";

  for (const c of trip.cities) {
    const div = document.createElement("div");
    div.className = "city-item";
    div.dataset.cityId = c.id;
    div.innerHTML = `
      <span class="handle">☰</span>
      <span class="dot" style="background:${c.color}"></span>
      <span class="name">${escapeHtml(c.name)}</span>
      <span class="small">${c.nights} noches</span>
      <input type="color" value="${c.color}" style="width:28px;height:28px;padding:0;border:none;cursor:pointer;" />
      <button class="danger" style="padding:4px 8px;">✕</button>
    `;

    // Color change
    div.querySelector('input[type="color"]').addEventListener("change", (ev) => {
      c.color = ev.target.value;
      div.querySelector('.dot').style.background = c.color;
      saveTrip(trip);
      renderEverything();
    });

    // Delete city
    div.querySelector("button").addEventListener("click", () => deleteCity(c.id));

    // Edit city on click (except controls)
    div.addEventListener("click", (ev) => {
      if (ev.target.tagName === "BUTTON" || ev.target.tagName === "INPUT") return;
      editCity(c);
    });

    cityList.appendChild(div);
  }

  // Wire drag & drop
  wireCityListDnD(cityList, () => {
    const trip = getTrip();
    const newOrder = [...cityList.querySelectorAll(".city-item")].map(el => el.dataset.cityId);
    trip.cities.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));

    const prev = JSON.parse(JSON.stringify(trip));
    regenerateDaysPreserve(trip, prev);
    saveTrip(trip);
    renderEverything(false);
  });
}

// Edit city dialog
function editCity(c) {
  const trip = getTrip();
  const newName = prompt("Nombre de la ciudad:", c.name);
  if (newName === null) return;
  const newNights = parseInt(prompt("Noches:", c.nights), 10);
  if (isNaN(newNights) || newNights < 1) return;
  const newHotel = prompt("Hotel (opcional):", c.hotel || "");

  c.name = newName;
  c.hotel = newHotel || "";

  if (newNights !== c.nights) {
    const prev = JSON.parse(JSON.stringify(trip));
    c.nights = newNights;
    regenerateDaysPreserve(trip, prev);
  }

  saveTrip(trip);
  rebuildCityFilter();
  renderEverything();
}

// Delete city
function deleteCity(cityId) {
  const trip = getTrip();
  const c = trip.cities.find(x => x.id === cityId);
  if (!c) return;
  if (!confirm(`Borrar ciudad "${c.name}"?`)) return;

  const prev = JSON.parse(JSON.stringify(trip));
  trip.cities = trip.cities.filter(x => x.id !== cityId);
  regenerateDaysPreserve(trip, prev);

  saveTrip(trip);
  rebuildCityFilter();
  renderEverything();
}

// Add new city
function addCity() {
  const trip = getTrip();
  const name = prompt("Nombre de la ciudad:");
  if (!name) return;
  const nights = parseInt(prompt("Noches:", "2"), 10) || 2;
  const hotel = prompt("Hotel (opcional):", "") || "";

  const colors = ["#e74c3c", "#3498db", "#9b59b6", "#2ecc71", "#f39c12", "#1abc9c", "#e67e22", "#34495e"];
  const color = colors[trip.cities.length % colors.length];

  const prev = JSON.parse(JSON.stringify(trip));
  const newCity = createCity(name, nights, hotel, color);
  trip.cities.push(newCity);
  regenerateDaysPreserve(trip, prev);

  // Auto-select new city
  toggleCitySelection(newCity.id);

  saveTrip(trip);
  rebuildCityFilter();
  renderEverything();
}

// Rebuild city filter checkboxes
export function rebuildCityFilter() {
  const trip = getTrip();
  cityFilterList.innerHTML = "";

  for (const c of trip.cities) {
    const isSelected = isCitySelected(c.id);
    const item = document.createElement("div");
    item.className = `city-filter-item ${isSelected ? 'selected' : ''}`;
    item.innerHTML = `
      <input type="checkbox" ${isSelected ? 'checked' : ''} />
      <div class="city-info">
        <span class="dot" style="background:${c.color}"></span>
        <span class="city-name">${escapeHtml(c.name)}</span>
        <span class="city-nights">${c.nights} noches</span>
      </div>
    `;

    const checkbox = item.querySelector('input[type="checkbox"]');
    checkbox.addEventListener("change", () => {
      toggleCitySelection(c.id);
      item.classList.toggle('selected', isCitySelected(c.id));
      updateCityFilterCount();
      renderEverything();
    });

    item.addEventListener("click", (e) => {
      if (e.target.tagName !== 'INPUT') {
        checkbox.checked = !checkbox.checked;
        toggleCitySelection(c.id);
        item.classList.toggle('selected', isCitySelected(c.id));
        updateCityFilterCount();
        renderEverything();
      }
    });

    cityFilterList.appendChild(item);
  }

  updateCityFilterCount();
}

function updateCityFilterCount() {
  const trip = getTrip();
  const selected = trip.cities.filter(c => isCitySelected(c.id)).length;
  cityFilterCount.textContent = `${selected} de ${trip.cities.length} ciudades seleccionadas`;
}

// Main render function
export function renderEverything(renderCal = true) {
  // Save UI state before re-rendering
  saveUIState();

  renderTripMeta();
  renderCities();
  rebuildCityFilter();
  renderAllView(viewAll, renderEverything);
  renderCityView(viewCity, renderEverything);
  renderTicketsView(viewTickets);

  const active = document.querySelector(".tab.active")?.dataset.tab || "all";
  if (active === "timeline" && renderCal) {
    renderTimelineView(timelineContent);
  }

  // Restore UI state after rendering
  restoreUIState();
}

// Tab switching
function setupTabs() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const view = tab.dataset.tab;
      viewAll.style.display = view === "all" ? "" : "none";
      viewCity.style.display = view === "city" ? "" : "none";
      viewTimeline.style.display = view === "timeline" ? "" : "none";
      viewTickets.style.display = view === "tickets" ? "" : "none";

      if (view === "timeline") {
        renderTimelineView(timelineContent);
      }
    });
  });
}

// Export JSON
function exportJSON() {
  const trip = getTrip();
  const blob = new Blob([JSON.stringify(trip, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${(trip.name || "viaje").replace(/\s+/g, "_")}.json`;
  a.click();
}

// Import JSON
function importJSON(file) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const imported = JSON.parse(ev.target.result);
      setTrip(imported);
      selectAllCities();
      saveTrip(imported);
      rebuildCityFilter();
      renderEverything();
    } catch (e) {
      alert("Error al importar: " + e.message);
    }
  };
  reader.readAsText(file);
}

// Save trip settings
function saveTripSettings() {
  const trip = getTrip();
  const prev = JSON.parse(JSON.stringify(trip));
  trip.name = inpTripName.value.trim() || trip.name;

  const newStart = inpStartDate.value;
  if (newStart && newStart !== trip.startDate) {
    trip.startDate = newStart;
    regenerateDaysPreserve(trip, prev);
  }

  saveTrip(trip);
  renderEverything();
}

// Reset to demo
function resetToDemo() {
  if (!confirm("¿Reiniciar con datos de demo? Se perderán todos los cambios.")) return;
  const demo = createDemoTrip();
  setTrip(demo);
  selectAllCities();
  saveTrip(demo);
  rebuildCityFilter();
  renderEverything();
}

// PDF Export
function exportPDF() {
  const trip = getTrip();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const margin = 40;
  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(trip.name || "Viaje", margin, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  import('./utils.js').then(({ formatDateES, addDays }) => {
    const totalNights = trip.cities.reduce((s, c) => s + c.nights, 0);
    const endExclusive = addDays(trip.startDate, totalNights);
    doc.text(`${formatDateES(trip.startDate)} → ${formatDateES(addDays(endExclusive, -1))}`, margin, y);
    y += 18;

    // Itinerary table
    const rows = [];
    for (const c of trip.cities) {
      for (const d of c.days) {
        for (const e of d.events) {
          rows.push([
            formatDateES(d.date),
            c.name,
            e.title,
            e.startTime || "",
            e.ticketRequired ? (e.ticketBought ? "✓" : "Pendiente") : ""
          ]);
        }
      }
    }

    doc.autoTable({
      startY: y,
      head: [["Fecha", "Ciudad", "Evento", "Hora", "Ticket"]],
      body: rows,
      theme: "striped",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [91, 141, 239] }
    });

    doc.save(`${(trip.name || "viaje").replace(/\s+/g, "_")}.pdf`);
  });
}

// Setup event listeners
function setupEventListeners() {
  btnSaveTrip.addEventListener("click", saveTripSettings);
  btnExport.addEventListener("click", exportJSON);
  btnExportPdf.addEventListener("click", exportPDF);
  btnReset.addEventListener("click", resetToDemo);
  btnAddCity.addEventListener("click", addCity);

  inpImport.addEventListener("change", (ev) => {
    if (ev.target.files[0]) {
      importJSON(ev.target.files[0]);
    }
  });

  btnSelectAll.addEventListener("click", () => {
    selectAllCities();
    rebuildCityFilter();
    renderEverything();
  });

  btnSelectNone.addEventListener("click", () => {
    selectNoCities();
    rebuildCityFilter();
    renderEverything();
  });
}

// Initialize application
export function init() {
  initDOMRefs();
  setupTabs();
  setupEventListeners();

  // Load or create demo trip
  let trip = loadTrip();
  if (!trip) {
    trip = createDemoTrip();
    saveTrip(trip);
  } else {
    // Migrate existing data: regenerate days with nights+1 logic
    const prevTrip = JSON.parse(JSON.stringify(trip));
    regenerateDaysPreserve(trip, prevTrip);
    saveTrip(trip);
  }
  setTrip(trip);

  // Select all cities by default
  selectAllCities();

  // Initial render
  rebuildCityFilter();
  renderEverything();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
