const STORAGE_KEY = "abrigo_streak";

function formatDate(date = new Date()) {
  return date.toISOString().split("T")[0];
}

function getYesterday() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}

function getDefaultData() {
  return {
    currentStreak: 0,
    longestStreak: 0,
    totalVisits: 0,
    uniqueVisits: [],
    lastVisit: null,
    createdAt: formatDate(),
  };
}

export function getStreakData() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    const initial = getDefaultData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  return JSON.parse(data);
}

export function saveStreakData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function registerVisit() {
  const data = getStreakData();

  const today = formatDate();

  if (data.lastVisit === today) {
    return data;
  }

  data.totalVisits++;

  if (!data.uniqueVisits.includes(today)) {
    data.uniqueVisits.push(today);
  }

  if (data.lastVisit === getYesterday()) {
    data.currentStreak++;
  } else {
    data.currentStreak = 1;
  }

  if (data.currentStreak > data.longestStreak) {
    data.longestStreak = data.currentStreak;
  }

  data.lastVisit = today;

  saveStreakData(data);

  return data;
}

export function getCurrentStreak() {
  return getStreakData().currentStreak;
}

export function getLongestStreak() {
  return getStreakData().longestStreak;
}

export function getTotalVisits() {
  return getStreakData().totalVisits;
}

export function getUniqueVisitCount() {
  return getStreakData().uniqueVisits.length;
}

export function getCreatedAt() {
  return getStreakData().createdAt;
}

export function resetStreak() {
  localStorage.removeItem(STORAGE_KEY);
}