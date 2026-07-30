export function toLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromLocalDateKey(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return toLocalDateKey(date) === value ? date : null;
}

export function addLocalDays(date, amount) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function compareEvents(first, second) {
  if (first.allDay !== second.allDay) return first.allDay ? -1 : 1;
  const timeComparison = (first.time || "23:59").localeCompare(
    second.time || "23:59"
  );
  if (timeComparison) return timeComparison;
  const priority = { high: 0, medium: 1, low: 2 };
  return (priority[first.priority] ?? 1) - (priority[second.priority] ?? 1);
}

function isOccurrenceOn(event, candidate) {
  const start = fromLocalDateKey(event.date);
  if (!start || candidate < start) return false;
  const end = fromLocalDateKey(event.recurrenceEnd);
  if (end && candidate > end) return false;

  const recurrence = event.recurrence ?? "none";
  if (recurrence === "none") return toLocalDateKey(candidate) === event.date;

  const dayDistance = Math.round((candidate - start) / 86400000);
  if (recurrence === "daily") return dayDistance >= 0;
  if (recurrence === "weekly") return dayDistance % 7 === 0;
  if (recurrence === "monthly") return candidate.getDate() === start.getDate();
  if (recurrence === "yearly") {
    return candidate.getDate() === start.getDate()
      && candidate.getMonth() === start.getMonth();
  }
  return false;
}

export function occurrencesInRange(events, rangeStart, rangeEnd) {
  const occurrences = [];
  const maximumDays = 370;
  let cursor = new Date(
    rangeStart.getFullYear(),
    rangeStart.getMonth(),
    rangeStart.getDate()
  );

  for (
    let inspected = 0;
    cursor <= rangeEnd && inspected < maximumDays;
    inspected += 1
  ) {
    const dateKey = toLocalDateKey(cursor);
    events.forEach((event) => {
      if (
        isOccurrenceOn(event, cursor)
        && !event.excludedDates?.includes(dateKey)
      ) {
        occurrences.push({ ...event, occurrenceDate: dateKey });
      }
    });
    cursor = addLocalDays(cursor, 1);
  }

  return occurrences.sort((first, second) => {
    const dateComparison = first.occurrenceDate.localeCompare(
      second.occurrenceDate
    );
    return dateComparison || compareEvents(first, second);
  });
}

export function monthRange(monthDate) {
  return {
    start: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
    end: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0),
  };
}
