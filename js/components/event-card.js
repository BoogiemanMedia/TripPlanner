// Event Card Component

import { escapeHtml } from '../utils.js';
import { getEventIcon, EVENT_TYPES } from '../icons.js';
import { saveTrip } from '../storage.js';
import { getTrip } from '../state.js';

export function createEventCard(city, day, e, onRenderEverything) {
  const el = document.createElement("div");
  el.className = "event";
  el.dataset.eventId = e.id;
  el.dataset.cityId = city.id;
  el.dataset.dayId = day.id;

  const icon = getEventIcon(e.type);
  const timePart = e.startTime ? `${escapeHtml(e.startTime)}${e.endTime ? " – " + escapeHtml(e.endTime) : ""}` : "";
  const linkPart = e.link ? `<a href="${escapeHtml(e.link)}" target="_blank" onclick="event.stopPropagation()">🔗</a>` : "";

  // Generate type select options
  const typeOptions = EVENT_TYPES.map(t =>
    `<option value="${t}" ${e.type === t ? 'selected' : ''}>${t}</option>`
  ).join('');

  el.innerHTML = `
    <div class="event-view">
      <div class="left" style="display:flex; align-items:flex-start; gap:8px;">
        <span class="event-handle" title="Arrastrar">☰</span>
        <div>
          <div class="title"><span class="icon">${icon}</span> ${escapeHtml(e.title)}</div>
          <div class="meta">
            <span class="type-badge">${escapeHtml(e.type || "evento")}</span>
            ${timePart ? `<span class="time">🕐 ${timePart}</span>` : ""}
            ${linkPart}
          </div>
        </div>
      </div>
      <div class="quick-actions">
        ${e.ticketRequired ? `
          <label class="ticket-checkbox ${e.ticketBought ? 'bought' : 'pending'}" title="Click para cambiar estado">
            <input type="checkbox" data-act="ticket" ${e.ticketBought ? 'checked' : ''} />
            <span>${e.ticketBought ? '✓ Comprado' : '⚠ Pendiente'}</span>
          </label>
        ` : ''}
        <button class="btn-icon" data-act="edit" title="Editar">✏️</button>
        <button class="btn-icon danger" data-act="del" title="Borrar">🗑️</button>
      </div>
    </div>

    <div class="event-edit-form">
      <div class="edit-grid">
        <div class="edit-field full-width">
          <label>Título</label>
          <input type="text" data-field="title" value="${escapeHtml(e.title)}" />
        </div>
        <div class="edit-field">
          <label>Tipo</label>
          <select data-field="type">
            <option value="">-- Seleccionar --</option>
            ${typeOptions}
          </select>
        </div>
        <div class="edit-field">
          <label>Link</label>
          <input type="url" data-field="link" value="${escapeHtml(e.link || '')}" placeholder="https://..." />
        </div>
        <div class="edit-field">
          <label>Hora inicio</label>
          <input type="text" data-field="startTime" value="${escapeHtml(e.startTime || '')}" placeholder="10:00 o 'tarde'" />
        </div>
        <div class="edit-field">
          <label>Hora fin</label>
          <input type="text" data-field="endTime" value="${escapeHtml(e.endTime || '')}" placeholder="14:00 (opcional)" />
        </div>
        <div class="edit-field">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" data-field="ticketRequired" ${e.ticketRequired ? 'checked' : ''} style="width:16px;height:16px;" />
            Requiere ticket/entrada
          </label>
        </div>
        <div class="edit-field">
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
            <input type="checkbox" data-field="ticketBought" ${e.ticketBought ? 'checked' : ''} ${!e.ticketRequired ? 'disabled' : ''} style="width:16px;height:16px;" />
            Ticket comprado
          </label>
        </div>
      </div>
      <div class="edit-actions">
        <button class="primary" data-act="save">💾 Guardar</button>
        <button data-act="cancel">Cancelar</button>
      </div>
    </div>
  `;

  // Event: Toggle ticket bought (quick action)
  const ticketCheckbox = el.querySelector('[data-act="ticket"]');
  if (ticketCheckbox) {
    ticketCheckbox.addEventListener("change", (evt) => {
      evt.stopPropagation();
      e.ticketBought = evt.target.checked;
      saveTrip(getTrip());
      // Update label
      const label = evt.target.closest('.ticket-checkbox');
      label.className = `ticket-checkbox ${e.ticketBought ? 'bought' : 'pending'}`;
      label.querySelector('span').textContent = e.ticketBought ? '✓ Comprado' : '⚠ Pendiente';
    });
  }

  // Event: Edit button - toggle edit mode
  el.querySelector('[data-act="edit"]').addEventListener("click", (evt) => {
    evt.stopPropagation();
    el.classList.toggle('editing');
  });

  // Event: Cancel editing
  el.querySelector('[data-act="cancel"]').addEventListener("click", (evt) => {
    evt.stopPropagation();
    el.classList.remove('editing');
    // Reset form values
    el.querySelector('[data-field="title"]').value = e.title;
    el.querySelector('[data-field="type"]').value = e.type || '';
    el.querySelector('[data-field="link"]').value = e.link || '';
    el.querySelector('[data-field="startTime"]').value = e.startTime || '';
    el.querySelector('[data-field="endTime"]').value = e.endTime || '';
    el.querySelector('[data-field="ticketRequired"]').checked = e.ticketRequired;
    el.querySelector('[data-field="ticketBought"]').checked = e.ticketBought;
  });

  // Event: Save changes
  el.querySelector('[data-act="save"]').addEventListener("click", (evt) => {
    evt.stopPropagation();

    const newTitle = el.querySelector('[data-field="title"]').value.trim();
    e.title = newTitle || e.title;
    e.type = el.querySelector('[data-field="type"]').value;
    e.link = el.querySelector('[data-field="link"]').value.trim();
    e.startTime = el.querySelector('[data-field="startTime"]').value.trim();
    e.endTime = el.querySelector('[data-field="endTime"]').value.trim();
    e.ticketRequired = el.querySelector('[data-field="ticketRequired"]').checked;
    e.ticketBought = el.querySelector('[data-field="ticketBought"]').checked;

    if (!e.ticketRequired) e.ticketBought = false;

    saveTrip(getTrip());
    if (onRenderEverything) onRenderEverything(false);
  });

  // Event: ticketRequired checkbox controls ticketBought
  el.querySelector('[data-field="ticketRequired"]').addEventListener("change", (evt) => {
    const ticketBoughtCheckbox = el.querySelector('[data-field="ticketBought"]');
    ticketBoughtCheckbox.disabled = !evt.target.checked;
    if (!evt.target.checked) ticketBoughtCheckbox.checked = false;
  });

  // Event: Delete
  el.querySelector('[data-act="del"]').addEventListener("click", (evt) => {
    evt.stopPropagation();
    if (!confirm(`¿Borrar "${e.title}"?`)) return;

    const trip = getTrip();
    for (const c of trip.cities) {
      for (const d of c.days) {
        const idx = d.events.findIndex(x => x.id === e.id);
        if (idx >= 0) {
          d.events.splice(idx, 1);
          saveTrip(trip);
          if (onRenderEverything) onRenderEverything();
          return;
        }
      }
    }
  });

  return el;
}
