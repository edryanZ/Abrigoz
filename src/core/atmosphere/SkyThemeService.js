export const SKY_PERIODS = Object.freeze([
  { id: "madrugada", start: 0 },
  { id: "amanhecer", start: 5 * 60 },
  { id: "manha", start: 7 * 60 + 30 },
  { id: "tarde", start: 12 * 60 },
  { id: "entardecer", start: 17 * 60 },
  { id: "noite", start: 19 * 60 },
]);

export const SKY_TOKENS = Object.freeze({
  madrugada: ["#05091c","#17113c","#060b1d","#6f58b5"],
  amanhecer: ["#182550","#765f91","#e8a589","#8073bd"],
  manha: ["#416f9d","#8fb8cf","#d5d9dc","#7b72ba"],
  tarde: ["#315e93","#739ac3","#b5cbe0","#8172bb"],
  entardecer: ["#161f48","#684b82","#e59178","#8e64bd"],
  noite: ["#060b22","#171342","#090d24","#7456b4"],
});

export function resolveSkyPeriod(date = new Date()) {
  const minutes = date.getHours() * 60 + date.getMinutes();
  return [...SKY_PERIODS].reverse().find((period) => minutes >= period.start)?.id
    ?? "madrugada";
}

export function nextSkyBoundary(date = new Date()) {
  const next = new Date(date);
  const minutes = date.getHours() * 60 + date.getMinutes();
  const boundary = SKY_PERIODS.find((period) => period.start > minutes);
  if (boundary) {
    next.setHours(Math.floor(boundary.start / 60), boundary.start % 60, 0, 0);
  } else {
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
  }
  return next;
}

export function resolveColorMode(preference = "system", systemDark = false) {
  return preference === "system" ? (systemDark ? "dark" : "light") : preference;
}
