import { useMemo, useState } from "react";
import { getEntries, saveEntry } from "../services/diaryService";
export default function useDiary() {
  const [entries, setEntries] = useState(getEntries);
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => entries.filter((entry) => `${entry.title} ${entry.content} ${entry.tags}`.toLowerCase().includes(query.toLowerCase())), [entries, query]);
  const save = (entry) => setEntries(saveEntry(entry));
  return { entries, filtered, query, setQuery, save };
}
