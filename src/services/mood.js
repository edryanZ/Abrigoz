const STORAGE_KEY = "abrigo_moods";

function formatDate(date = new Date()) {
  return date.toISOString().split("T")[0];
}

function getDefaultData() {
  return {
    moods: [],
  };
}

export function getMoodData() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    const initial = getDefaultData();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));

    return initial;
  }

  return JSON.parse(data);
}

export function saveMoodData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveMood(mood, note = "") {
  const data = getMoodData();

  const today = formatDate();

  const index = data.moods.findIndex((item) => item.date === today);

  const moodEntry = {
    date: today,
    mood,
    note,
    createdAt: new Date().toISOString(),
  };

  if (index >= 0) {
    data.moods[index] = moodEntry;
  } else {
    data.moods.push(moodEntry);
  }

  saveMoodData(data);

  return moodEntry;
}

export function getTodayMood() {
  const today = formatDate();

  return (
    getMoodData().moods.find((item) => item.date === today) || null
  );
}

export function getMoodHistory() {
  return getMoodData().moods.sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );
}

export function getMoodCount() {
  return getMoodData().moods.length;
}

export function getLastMood() {
  const history = getMoodHistory();

  return history.length ? history[0] : null;
}

export function getMoodByDate(date) {
  return (
    getMoodData().moods.find((item) => item.date === date) || null
  );
}

export function deleteMood(date) {
  const data = getMoodData();

  data.moods = data.moods.filter((item) => item.date !== date);

  saveMoodData(data);

  return data;
}

export function clearMoodHistory() {
  localStorage.removeItem(STORAGE_KEY);
}