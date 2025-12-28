// Tickets View - Shows all events that require tickets

import { formatDateES, escapeHtml } from '../utils.js';
import { getEventIcon } from '../icons.js';
import { saveTrip } from '../storage.js';
import { getTrip, isCitySelected } from '../state.js';

export function renderTicketsView(container) {
  const trip = getTrip();
  container.innerHTML = "";

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<div style="font-weight:900; margin-bottom:8px;">Tickets</div>
                    <div class="small">Marcá comprado. Links en cada evento.</div>`;
  container.appendChild(card);

  const wrap = document.createElement("div");
  wrap.className = "days";
  card.appendChild(wrap);

  for (const c of trip.cities) {
    if (!isCitySelected(c.id)) continue;

    const ticketEvents = [];
    for (const d of c.days) {
      for (const e of d.events) {
        if (e.ticketRequired) {
          ticketEvents.push({ day: d, event: e });
        }
      }
    }

    if (ticketEvents.length === 0) continue;

    const cityHeader = document.createElement("div");
    cityHeader.className = "city-pill";
    cityHeader.innerHTML = `<span class="dot" style="background:${c.color}"></span>
                            <b>${escapeHtml(c.name)}</b>`;
    wrap.appendChild(cityHeader);

    for (const { day, event: e } of ticketEvents) {
      const icon = getEventIcon(e.type);
      const row = document.createElement("div");
      row.className = "ticket";
      row.innerHTML = `
        <input type="checkbox" ${e.ticketBought ? "checked" : ""} />
        <div>
          <div class="tname">${icon} ${escapeHtml(e.title)}</div>
          <div class="small">${formatDateES(day.date)} ${e.startTime ? "· " + escapeHtml(e.startTime) : ""}</div>
          ${e.link ? `<a href="${escapeHtml(e.link)}" target="_blank">Ver link</a>` : ""}
        </div>
      `;

      row.querySelector("input").addEventListener("change", (ev) => {
        e.ticketBought = ev.target.checked;
        saveTrip(trip);
      });

      wrap.appendChild(row);
    }
  }

  if (wrap.children.length === 0) {
    wrap.innerHTML = `<div class="small">No hay eventos que requieran tickets en las ciudades seleccionadas.</div>`;
  }
}
