import { useEffect, useState } from "react";

import { subscribe } from "../sync/EventBus";
import { SYNC_EVENT } from "../sync/emitSync";
import { getOrganizationSummary } from "./OrganizationSummary";

export default function useOrganizationSummary() {
  const [summary, setSummary] = useState(getOrganizationSummary);

  useEffect(() => {
    const refresh = () => setSummary(getOrganizationSummary());
    const unsubscribe = subscribe(SYNC_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      unsubscribe();
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return summary;
}
