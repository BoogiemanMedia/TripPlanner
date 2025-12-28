// City View - Shows cities in collapsible sections

import { escapeHtml } from '../utils.js';
import { getTrip, isCitySelected } from '../state.js';
import { createDayDetails } from '../components/day-details.js';
import { wireDnD } from '../drag-drop.js';

export function renderCityView(container, onRenderEverything) {
  const trip = getTrip();
  container.innerHTML = "";

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<div style="font-weight:900; margin-bottom:8px;">Vista por ciudad</div>`;
  container.appendChild(card);

  const list = document.createElement("div");
  list.className = "days";
  card.appendChild(list);

  for (const c of trip.cities) {
    if (!isCitySelected(c.id)) continue;

    const det = document.createElement("details");
    det.dataset.cityId = c.id;
    det.open = true;
    det.innerHTML = `
      <summary>
        <span class="row" style="gap:10px;">
          <span class="dot" style="background:${c.color}"></span>
          <span>${escapeHtml(c.name)}</span>
          <span class="small">${escapeHtml(c.hotel || "")} · ${c.nights} noches</span>
        </span>
        <span class="small">click para colapsar</span>
      </summary>
    `;
    const inner = document.createElement("div");
    inner.className = "days";
    inner.style.marginTop = "10px";
    det.appendChild(inner);

    c.days.forEach((d, idx) => {
      inner.appendChild(createDayDetails(c, d, idx === 0, (evts) => wireDnD(evts, onRenderEverything), onRenderEverything));
    });
    list.appendChild(det);
  }
}
