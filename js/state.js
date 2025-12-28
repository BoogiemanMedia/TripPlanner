// Application state management

import { uid, addDays } from './utils.js';

// Global trip state
export let trip = null;

// Selected cities for filtering
export let selectedCityIds = [];

export function setTrip(newTrip) {
  trip = newTrip;
}

export function getTrip() {
  return trip;
}

// City selection helpers
export function isCitySelected(cityId) {
  return selectedCityIds.includes(cityId);
}

export function getSelectedCities() {
  if (!trip) return [];
  return trip.cities.filter(c => selectedCityIds.includes(c.id));
}

export function setSelectedCities(ids) {
  selectedCityIds = ids;
}

export function selectAllCities() {
  if (trip) {
    selectedCityIds = trip.cities.map(c => c.id);
  }
}

export function selectNoCities() {
  selectedCityIds = [];
}

export function toggleCitySelection(cityId) {
  const idx = selectedCityIds.indexOf(cityId);
  if (idx >= 0) {
    selectedCityIds.splice(idx, 1);
  } else {
    selectedCityIds.push(cityId);
  }
}

// Create a new event
export function createEvent(title, type, start, end, link, ticketRequired) {
  return {
    id: uid(),
    title,
    type,
    startTime: start || "",
    endTime: end || "",
    link: link || "",
    notes: "",
    ticketRequired: !!ticketRequired,
    ticketBought: false
  };
}

// Create a new city
export function createCity(name, nights, hotel, color) {
  const c = {
    id: uid(),
    name,
    nights: nights || 1,
    hotel: hotel || "",
    color: color || "#5b8def",
    days: []
  };
  return c;
}

// Create a new day
export function createDay(date) {
  return {
    id: uid(),
    date,
    events: []
  };
}

// Demo data
export function createDemoTrip() {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 30);
  const startStr = startDate.toISOString().slice(0, 10);

  return {
    name: "Europa 2025",
    startDate: startStr,
    cities: [
      {
        id: uid(),
        name: "Roma",
        nights: 4,
        hotel: "Hotel Artemide",
        color: "#e74c3c",
        days: [
          { id: uid(), date: startStr, events: [
            createEvent("Coliseo", "museo", "10:00", "13:00", "https://colosseum.it", true),
            createEvent("Trastevere", "barrio", "tarde", "", "", false)
          ]},
          { id: uid(), date: addDays(startStr, 1), events: [
            createEvent("Vaticano", "museo", "09:00", "14:00", "https://vatican.va", true),
            createEvent("Cena en Testaccio", "comida", "20:00", "", "", false)
          ]},
          { id: uid(), date: addDays(startStr, 2), events: [
            createEvent("Panteón", "arquitectura", "mañana", "", "", false),
            createEvent("Piazza Navona", "paseo", "", "", "", false)
          ]},
          { id: uid(), date: addDays(startStr, 3), events: [
            createEvent("Galleria Borghese", "arte", "10:00", "12:00", "", true)
          ]}
        ]
      },
      {
        id: uid(),
        name: "Florencia",
        nights: 3,
        hotel: "Hotel Davanzati",
        color: "#9b59b6",
        days: [
          { id: uid(), date: addDays(startStr, 4), events: [
            createEvent("Duomo", "arquitectura", "mañana", "", "", false),
            createEvent("Mercado San Lorenzo", "mercado", "mediodía", "", "", false)
          ]},
          { id: uid(), date: addDays(startStr, 5), events: [
            createEvent("Uffizi", "museo", "09:00", "13:00", "", true),
            createEvent("Ponte Vecchio", "paseo", "tarde", "", "", false)
          ]},
          { id: uid(), date: addDays(startStr, 6), events: [
            createEvent("San Gimignano", "tour", "todo el día", "", "", false)
          ]}
        ]
      },
      {
        id: uid(),
        name: "Venecia",
        nights: 2,
        hotel: "Ca' Pisani",
        color: "#3498db",
        days: [
          { id: uid(), date: addDays(startStr, 7), events: [
            createEvent("Plaza San Marcos", "arquitectura", "mañana", "", "", false),
            createEvent("Paseo en góndola", "tour", "tarde", "", "https://gondola.it", true)
          ]},
          { id: uid(), date: addDays(startStr, 8), events: [
            createEvent("Murano y Burano", "tour", "todo el día", "", "", false)
          ]}
        ]
      }
    ]
  };
}

// Regenerate days preserving events
export function regenerateDaysPreserve(tripData, prevTrip) {
  const prevMap = new Map();
  for (const c of (prevTrip?.cities || [])) {
    prevMap.set(c.id, c.days.map(d => d.events || []));
  }

  let runningDate = tripData.startDate;
  for (const c of tripData.cities) {
    const prevEvents = prevMap.get(c.id) || [];
    c.days = [];
    for (let i = 0; i < c.nights; i++) {
      const evs = prevEvents[i] ? [...prevEvents[i]] : [];
      c.days.push({ id: uid(), date: runningDate, events: evs });
      runningDate = addDays(runningDate, 1);
    }
  }
}
