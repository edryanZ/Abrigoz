import { useCallback, useMemo, useState } from "react";

import {
  deleteEvent,
  loadCalendar,
  saveEvent,
} from "../services/calendarService";
import {
  monthRange,
  occurrencesInRange,
  toLocalDateKey,
} from "../utils/calendarDates";

export default function useCalendarEvents() {
  const today = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateKey(today));
  const [events, setEvents] = useState(() => loadCalendar().items);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const visibleOccurrences = useMemo(() => {
    const range = monthRange(month);
    return occurrencesInRange(events, range.start, range.end);
  }, [events, month]);

  const selectedEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return visibleOccurrences.filter((event) => {
      const matchesDay = event.occurrenceDate === selectedDate;
      const matchesCategory = category === "all" || event.category === category;
      const searchable = `${event.title} ${event.description} ${event.location}`
        .toLocaleLowerCase("pt-BR");
      return matchesDay
        && matchesCategory
        && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, query, selectedDate, visibleOccurrences]);

  const refresh = useCallback(() => setEvents(loadCalendar().items), []);
  const persist = useCallback((event) => {
    const saved = saveEvent(event);
    refresh();
    return saved;
  }, [refresh]);
  const remove = useCallback((id, occurrenceDate, scope) => {
    const removed = deleteEvent(id, occurrenceDate, scope);
    refresh();
    return removed;
  }, [refresh]);

  const changeMonth = useCallback((direction) => {
    setMonth((current) =>
      new Date(current.getFullYear(), current.getMonth() + direction, 1)
    );
  }, []);

  const goToday = useCallback(() => {
    setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(toLocalDateKey(today));
  }, [today]);

  return {
    month,
    selectedDate,
    query,
    category,
    events,
    visibleOccurrences,
    selectedEvents,
    setSelectedDate,
    setQuery,
    setCategory,
    changeMonth,
    goToday,
    saveEvent: persist,
    deleteEvent: remove,
  };
}
