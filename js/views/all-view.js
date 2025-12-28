// All View - Shows all cities and days

import { escapeHtml } from '../utils.js';
import { getTrip, isCitySelected } from '../state.js';
import { createDayDetails } from '../components/day-details.js';
import { wireDnD } from '../drag-drop.js';

export function renderAllView(container, onRenderEverything) {
  const trip = getTrip();
  container.innerHTML = "";

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<div style="font-weight:900; margin-bottom:8px;">Todo el viaje</div>`;
  container.appendChild(card);

  const daysWrap = document.createElement("div");
  daysWrap.className = "days";
  card.appendChild(daysWrap);

  for (const c of trip.cities) {
    if (!isCitySelected(c.id)) continue;

    const head = document.createElement("div");
    head.className = "city-pill";
    head.innerHTML = `<span class="dot" style="background:${c.color}"></span>
                      <div><b>${escapeHtml(c.name)}</b> <span class="small">· ${c.nights} noches · ${escapeHtml(c.hotel || "")}</span></div>`;
    daysWrap.appendChild(head);

    c.days.forEach((d, idx) => {
      // Open first day of each city by default
      daysWrap.appendChild(createDayDetails(c, d, idx === 0, (evts) => wireDnD(evts, onRenderEverything), onRenderEverything));
    });
  }
}
