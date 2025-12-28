// Day Details Component

import { formatDateES, escapeHtml } from '../utils.js';
import { saveTrip } from '../storage.js';
import { getTrip, createEvent } from '../state.js';
import { createEventCard } from './event-card.js';

export function createDayDetails(city, day, openByDefault, wireDnD, onRenderEverything) {
  const det = document.createElement("details");
  det.dataset.dayId = day.id;
  det.open = !!openByDefault;
  det.innerHTML = `
    <summary>
      <span>${formatDateES(day.date)}</span>
      <span class="small">${escapeHtml(city.name)}</span>
    </summary>
  `;

  const box = document.createElement("div");
  box.style.marginTop = "10px";

  const btnRow = document.createElement("div");
  btnRow.className = "row";
  btnRow.innerHTML = `
    <button class="primary">+ Evento</button>
    <span class="small">Arrastrá para reordenar o mover entre días.</span>
    <span class="pill small">${escapeHtml(city.hotel || "")}</span>
  `;

  btnRow.querySelector("button").addEventListener("click", () => {
    day.events.push(createEvent("Nuevo evento", "paseo", "", "", "", false));
    saveTrip(getTrip());
    if (onRenderEverything) onRenderEverything();
  });

  const events = document.createElement("div");
  events.className = "events";
  events.dataset.cityId = city.id;
  events.dataset.dayId = day.id;

  for (const e of day.events) {
    events.appendChild(createEventCard(city, day, e, onRenderEverything));
  }

  box.appendChild(btnRow);
  box.appendChild(events);
  det.appendChild(box);

  if (wireDnD) wireDnD(events);

  return det;
}
