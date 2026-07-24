const STORAGE_KEY = "abrigo_statistics";

function getDefaultStatistics() {
  return {
    visits: 0,

    lettersRead: 0,
    dailyLettersRead: 0,
    lastDailyLetter: null,

    moodsRegistered: 0,

    achievementsUnlocked: 0,

    createdAt: new Date().toISOString(),
  };
}

export function getStatistics() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    const initial = getDefaultStatistics();
    saveStatistics(initial);
    return initial;
  }

  return JSON.parse(data);
}

export function saveStatistics(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function updateStatistics(updater) {
  const stats = getStatistics();

  updater(stats);

  saveStatistics(stats);

  return stats;
}

export function incrementVisits(amount = 1) {
  return updateStatistics((stats) => {
    stats.visits += amount;
  });
}

export function incrementLettersRead(amount = 1) {
  return updateStatistics((stats) => {
    stats.lettersRead += amount;
  });
}

export function incrementDailyLetters(amount = 1) {
  return updateStatistics((stats) => {
    stats.dailyLettersRead += amount;
    stats.lastDailyLetter = new Date().toISOString();
  });
}

export function incrementMoods(amount = 1) {
  return updateStatistics((stats) => {
    stats.moodsRegistered += amount;
  });
}

export function incrementAchievements(amount = 1) {
  return updateStatistics((stats) => {
    stats.achievementsUnlocked += amount;
  });
}

export function setStatistic(key, value) {
  return updateStatistics((stats) => {
    stats[key] = value;
  });
}

export function getStatistic(key) {
  return getStatistics()[key];
}

export function resetStatistics() {
  localStorage.removeItem(STORAGE_KEY);
}