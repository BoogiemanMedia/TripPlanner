// Timeline View - Continuous timeline of the entire trip

import { formatDateES, escapeHtml } from '../utils.js';
import { getEventIcon } from '../icons.js';
import { getTrip, isCitySelected, getSelectedCities } from '../state.js';
import { wireTimelineDnD } from '../drag-drop.js';

// Determine day type (arrival, departure, full)
function getDayType(city, dayIndex) {
  const isFirstDay = dayIndex === 0;
  const isLastDay = dayIndex === city.days.length - 1;

  if (isFirstDay && city.firstDayType) return city.firstDayType;
  if (isLastDay && city.lastDayType) return city.lastDayType;

  if (isFirstDay) return 'arrival';
  if (isLastDay) return 'departure';
  return 'full';
}

function getDayTypeBadge(dayType) {
  switch (dayType) {
    case 'arrival': return '<span class="day-type-badge arrival">🛬 Llegada</span>';
    case 'departure': return '<span class="day-type-badge departure">🛫 Partida</span>';
    case 'full': return '<span class="day-type-badge full">📅 Día completo</span>';
    default: return '';
  }
}

export function renderTimelineView(container) {
  const trip = getTrip();
  if (!container) return;

  // Collect all days with their city
  const allDays = [];
  let dayCount = 0;
  for (const c of trip.cities) {
    if (!isCitySelected(c.id)) continue;
    for (let i = 0; i < c.days.length; i++) {
      const d = c.days[i];
      dayCount++;
      const dayType = getDayType(c, i);
      allDays.push({ city: c, day: d, dayNum: dayCount, dayIndex: i, dayType });
    }
  }

  // Calculate stats
  const totalDays = allDays.length;
  const totalEvents = allDays.reduce((sum, item) => sum + (item.day.events?.length || 0), 0);
  const ticketsPending = allDays.reduce((sum, item) =>
    sum + (item.day.events?.filter(e => e.ticketRequired && !e.ticketBought).length || 0), 0);
  const citiesCount = getSelectedCities().length;

  // Build HTML
  let html = `
    <div class="timeline-container">
      <div class="timeline-header">
        <h2>🗓️ Timeline del viaje</h2>
        <div class="timeline-stats">
          <div class="timeline-stat">
            <div class="value">${totalDays}</div>
            <div class="label">Días</div>
          </div>
          <div class="timeline-stat">
            <div class="value">${citiesCount}</div>
            <div class="label">Ciudades</div>
          </div>
          <div class="timeline-stat">
            <div class="value">${totalEvents}</div>
            <div class="label">Eventos</div>
          </div>
          ${ticketsPending > 0 ? `
          <div class="timeline-stat">
            <div class="value" style="color: var(--warning)">${ticketsPending}</div>
            <div class="label">Tickets pendientes</div>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="timeline-legend">
        <div class="timeline-legend-item"><span class="icon">🏛️</span> Museo</div>
        <div class="timeline-legend-item"><span class="icon">🚶</span> Paseo</div>
        <div class="timeline-legend-item"><span class="icon">🎟️</span> Ticket</div>
        <div class="timeline-legend-item"><span class="icon">🍽️</span> Comida</div>
        <div class="timeline-legend-item"><span class="icon">🎭</span> Cultura</div>
        <div class="timeline-legend-item"><span class="icon">🎨</span> Arte</div>
        <div class="timeline-legend-item"><span class="icon">🏗️</span> Arquitectura</div>
        <div class="timeline-legend-item"><span class="icon">🏘️</span> Barrio</div>
        <div class="timeline-legend-item"><span class="icon">✈️</span> Logística</div>
      </div>

      <div class="small" style="margin-bottom:16px; padding:10px; background:var(--panel); border-radius:8px; border:1px solid var(--line);">
        💡 <b>Tip:</b> Arrastrá eventos con el ícono ☰ para reordenarlos o moverlos entre días.
        Los días de llegada/partida indican transiciones entre ciudades.
      </div>

      <div class="timeline-scroll">
        <div class="timeline-line"></div>
  `;

  if (allDays.length === 0) {
    html += `
      <div class="timeline-empty">
        <div class="icon">🗺️</div>
        <div>No hay días para mostrar</div>
        <div class="small">Agregá ciudades y eventos para ver tu timeline</div>
      </div>
    `;
  } else {
    let lastCityId = null;

    for (const { city, day, dayNum, dayIndex, dayType } of allDays) {
      // Show city transition if city changed
      if (lastCityId !== null && lastCityId !== city.id) {
        html += `
          <div class="timeline-city-change">
            <div class="timeline-city-change-marker" style="background: ${city.color}; border-color: ${city.color}; color: white;">
              🚀
            </div>
            <div class="timeline-city-change-content">
              <span class="city-name">
                <span class="dot" style="background: ${city.color}; box-shadow: 0 0 8px ${city.color}"></span>
                Llegada a ${escapeHtml(city.name)}
              </span>
              <span class="arrow">→</span>
              <span class="small">${city.nights} noches</span>
            </div>
          </div>
        `;
      }
      lastCityId = city.id;

      // Day
      html += `
        <div class="timeline-day">
          <div class="timeline-day-marker" style="border-color: ${city.color}">${dayNum}</div>
          <div class="timeline-day-header">
            <span class="date">${formatDateES(day.date)}</span>
            <span class="city-tag">
              <span class="dot" style="background: ${city.color}; box-shadow: 0 0 6px ${city.color}"></span>
              ${escapeHtml(city.name)}
            </span>
            ${getDayTypeBadge(dayType)}
            ${city.hotel ? `<span class="hotel">🏨 ${escapeHtml(city.hotel)}</span>` : ''}
          </div>
          <div class="timeline-events" data-day-id="${day.id}" data-city-id="${city.id}">
      `;

      if (!day.events || day.events.length === 0) {
        html += `
          <div class="timeline-event timeline-event-empty" style="opacity: 0.6;">
            <div class="icon">📝</div>
            <div class="content">
              <div class="event-title" style="color: var(--muted)">Sin eventos planificados</div>
              <div class="event-meta">${dayType === 'arrival' ? 'Día de llegada - tarde libre' : dayType === 'departure' ? 'Día de partida - mañana libre' : 'Día libre o por planificar'}</div>
            </div>
          </div>
        `;
      } else {
        for (const e of day.events) {
          const icon = getEventIcon(e.type);
          const timePart = e.startTime ? `${escapeHtml(e.startTime)}${e.endTime ? ' – ' + escapeHtml(e.endTime) : ''}` : '';

          let ticketBadge = '';
          if (e.ticketRequired) {
            ticketBadge = e.ticketBought
              ? `<span class="ticket-badge bought">✓ Comprado</span>`
              : `<span class="ticket-badge pending">⚠ Pendiente</span>`;
          }

          html += `
            <div class="timeline-event" data-event-id="${e.id}">
              <span class="event-handle" title="Arrastrar">☰</span>
              <div class="icon">${icon}</div>
              <div class="content">
                <div class="event-title">${escapeHtml(e.title)}</div>
                <div class="event-meta">
                  ${timePart ? `<span class="event-time">🕐 ${timePart}</span>` : ''}
                  <span class="event-type">${escapeHtml(e.type || 'evento')}</span>
                  ${ticketBadge}
                </div>
              </div>
              ${e.link ? `<a href="${escapeHtml(e.link)}" target="_blank" class="event-link" title="Abrir link">🔗</a>` : ''}
            </div>
          `;
        }
      }

      html += `
          </div>
        </div>
      `;
    }
  }

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Wire drag & drop after rendering
  wireTimelineDnD(() => renderTimelineView(container));
}
