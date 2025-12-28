// Event type icons

const EVENT_ICONS = {
  museo: '🏛️',
  paseo: '🚶',
  ticket: '🎟️',
  comida: '🍽️',
  arquitectura: '🏗️',
  barrio: '🏘️',
  cultura: '🎭',
  arte: '🎨',
  diseño: '✨',
  música: '🎵',
  logística: '✈️',
  hotel: '🏨',
  transporte: '🚌',
  compras: '🛍️',
  naturaleza: '🌳',
  playa: '🏖️',
  nocturno: '🌙',
  foto: '📸',
  mirador: '🔭',
  religioso: '⛪',
  mercado: '🛒',
  café: '☕',
  bar: '🍷',
  show: '🎪',
  tour: '🗺️'
};

export function getEventIcon(type) {
  return EVENT_ICONS[type] || '📍';
}

export const EVENT_TYPES = [
  'paseo', 'museo', 'ticket', 'comida', 'arquitectura', 'barrio',
  'cultura', 'arte', 'diseño', 'música', 'logística', 'hotel',
  'transporte', 'compras', 'naturaleza', 'playa', 'nocturno',
  'foto', 'mirador', 'religioso', 'mercado', 'café', 'bar', 'show', 'tour'
];
