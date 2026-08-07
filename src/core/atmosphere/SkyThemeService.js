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

const MINUTES_PER_DAY = 24 * 60;
const LUNAR_CYCLE_DAYS = 29.53058867;
const REFERENCE_NEW_MOON = new Date(2000, 0, 6, 18, 14, 0, 0);

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function mixHex(from, to, progress) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const mixed = a.map((channel, index) =>
    Math.round(channel + (b[index] - channel) * clamp(progress)));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

export function localDayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function seedFromLocalDate(date = new Date()) {
  const text = localDayKey(date);
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

export function seededUnit(seed, salt = 0) {
  let value = (seed + Math.imul(salt + 1, 0x9e3779b1)) >>> 0;
  value ^= value >>> 16;
  value = Math.imul(value, 0x21f0aaad);
  value ^= value >>> 15;
  value = Math.imul(value, 0x735a2d97);
  value ^= value >>> 15;
  return (value >>> 0) / 4294967295;
}

export function resolveSkyPeriod(date = new Date()) {
  const minutes = date.getHours() * 60 + date.getMinutes();
  return [...SKY_PERIODS].reverse().find((period) => minutes >= period.start)?.id
    ?? "madrugada";
}

export function resolveSkyTransition(date = new Date()) {
  const minutes = date.getHours() * 60 + date.getMinutes()
    + date.getSeconds() / 60;
  const currentIndex = [...SKY_PERIODS]
    .map((period) => period.start)
    .findLastIndex((start) => minutes >= start);
  const safeIndex = currentIndex < 0 ? 0 : currentIndex;
  const current = SKY_PERIODS[safeIndex];
  const next = SKY_PERIODS[(safeIndex + 1) % SKY_PERIODS.length];
  const nextStart = safeIndex === SKY_PERIODS.length - 1
    ? MINUTES_PER_DAY : next.start;
  const progress = clamp((minutes - current.start) / (nextStart - current.start));
  return { period: current.id, nextPeriod: next.id, progress };
}

export function resolveSkyPalette(date = new Date()) {
  const transition = resolveSkyTransition(date);
  const from = SKY_TOKENS[transition.period];
  const to = SKY_TOKENS[transition.nextPeriod];
  return {
    ...transition,
    colors: from.map((color, index) => mixHex(color, to[index], transition.progress)),
  };
}

export function resolveLunarPhase(date = new Date()) {
  const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  const days = (localDate.getTime() - REFERENCE_NEW_MOON.getTime()) / 86400000;
  const phase = ((days % LUNAR_CYCLE_DAYS) + LUNAR_CYCLE_DAYS) % LUNAR_CYCLE_DAYS
    / LUNAR_CYCLE_DAYS;
  const illumination = (1 - Math.cos(phase * Math.PI * 2)) / 2;
  return { phase, illumination };
}

export function buildDailySkyScene(date = new Date()) {
  const seed = seedFromLocalDate(date);
  const makeItems = (count, offset) => Array.from({ length: count }, (_, index) => ({
    id: `${offset}-${index}`,
    x: 4 + seededUnit(seed, offset + index * 5) * 92,
    y: 4 + seededUnit(seed, offset + index * 5 + 1) * 72,
    scale: 0.65 + seededUnit(seed, offset + index * 5 + 2) * 0.9,
    delay: seededUnit(seed, offset + index * 5 + 3) * 8,
    duration: 18 + seededUnit(seed, offset + index * 5 + 4) * 30,
  }));
  return {
    dayKey: localDayKey(date),
    stars: makeItems(16, 11),
    clouds: makeItems(5, 101),
    fireflies: makeItems(5, 211),
    birds: makeItems(2, 307),
    shootingStar: seededUnit(seed, 401) > 0.72,
    meteor: seededUnit(seed, 402) > 0.93,
    constellation: seededUnit(seed, 403) > 0.58,
  };
}

export function resolveAtmosphereLevel(pathname = "/") {
  if (pathname === "/so-ficar") return "maximum";
  if (["/configuracoes", "/pesquisa", "/exportar"].includes(pathname)) return "minimal";
  if (["/reflexoes", "/cartas", "/intencoes", "/pequenos-cuidados", "/meu-dia"].includes(pathname)) {
    return "low";
  }
  if (pathname === "/lar") return "medium";
  if (pathname === "/momento-do-dia") return "gentle";
  if (pathname === "/") return "high";
  return "low";
}

const MOON_MESSAGES = Object.freeze([
  "Você não precisa resolver nada agora.",
  "Há espaço para ficar em silêncio também.",
  "Nem todo momento precisa virar resposta.",
  "A noite pode ser só uma pausa.",
  "Vá no seu tempo. O Abrigo continua aqui.",
]);

export function getMoonMessage(date = new Date()) {
  return MOON_MESSAGES[seedFromLocalDate(date) % MOON_MESSAGES.length];
}

export function getSplashPhrase(date = new Date()) {
  switch (resolveSkyPeriod(date)) {
    case "madrugada": return "Ainda há silêncio por aqui.";
    case "amanhecer": return "Um novo dia pode começar devagar.";
    case "manha": return "Chegue no seu tempo.";
    case "tarde": return "Fique um pouco.";
    case "entardecer": return "O dia pode desacelerar por aqui.";
    default: return "O dia pode descansar agora.";
  }
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
