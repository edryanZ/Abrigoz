export const AMBIENT_SOUND_SLOTS = Object.freeze([
  { id: "rain", label: "Chuva", available: false },
  { id: "wind", label: "Vento", available: false },
  { id: "night-forest", label: "Floresta noturna", available: false },
  { id: "waves", label: "Ondas", available: false },
  { id: "fireplace", label: "Lareira", available: false },
]);

export function getAvailableAmbientSounds() {
  return AMBIENT_SOUND_SLOTS.filter((sound) => sound.available);
}
