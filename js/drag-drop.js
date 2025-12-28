// Drag & Drop functionality

import { saveTrip } from './storage.js';
import { getTrip } from './state.js';

// Wire drag & drop for event containers
export function wireDnD(container, onRenderEverything) {
  if (!window.Sortable) {
    console.warn('Sortable.js not loaded');
    return;
  }

  Sortable.create(container, {
    group: "events",
    handle: ".event-handle",
    animation: 150,
    ghostClass: "sortable-ghost",
    chosenClass: "sortable-chosen",
    onEnd: (evt) => {
      const trip = getTrip();
      const fromCityId = evt.from.dataset.cityId;
      const fromDayId = evt.from.dataset.dayId;
      const toCityId = evt.to.dataset.cityId;
      const toDayId = evt.to.dataset.dayId;
      const eventId = evt.item.dataset.eventId;

      const fromCity = trip.cities.find(c => c.id === fromCityId);
      const toCity = trip.cities.find(c => c.id === toCityId);
      const fromDay = fromCity.days.find(d => d.id === fromDayId);
      const toDay = toCity.days.find(d => d.id === toDayId);

      const moved = fromDay.events.find(e => e.id === eventId);
      fromDay.events = fromDay.events.filter(e => e.id !== eventId);

      const newIndex = evt.newIndex;
      toDay.events.splice(newIndex, 0, moved);

      saveTrip(trip);
      if (onRenderEverything) onRenderEverything(false);
    }
  });
}

// Wire drag & drop for timeline events
export function wireTimelineDnD(onRenderTimeline) {
  if (!window.Sortable) {
    console.warn('Sortable.js not loaded');
    return;
  }

  document.querySelectorAll('.timeline-events[data-day-id]').forEach(container => {
    Sortable.create(container, {
      group: "timeline-events",
      handle: ".event-handle",
      animation: 150,
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      onEnd: (evt) => {
        const trip = getTrip();
        const fromDayId = evt.from.dataset.dayId;
        const toDayId = evt.to.dataset.dayId;
        const eventId = evt.item.dataset.eventId;

        // Find the days
        let fromDay = null, toDay = null;
        for (const c of trip.cities) {
          for (const d of c.days) {
            if (d.id === fromDayId) fromDay = d;
            if (d.id === toDayId) toDay = d;
          }
        }

        if (!fromDay || !toDay) return;

        const moved = fromDay.events.find(e => e.id === eventId);
        if (!moved) return;

        fromDay.events = fromDay.events.filter(e => e.id !== eventId);
        toDay.events.splice(evt.newIndex, 0, moved);

        saveTrip(trip);
        if (onRenderTimeline) onRenderTimeline();
      }
    });
  });
}

// Wire drag & drop for city list
export function wireCityListDnD(container, onReorder) {
  if (!window.Sortable) {
    console.warn('Sortable.js not loaded');
    return;
  }

  Sortable.create(container, {
    handle: ".handle",
    animation: 150,
    onEnd: () => {
      if (onReorder) onReorder();
    }
  });
}
