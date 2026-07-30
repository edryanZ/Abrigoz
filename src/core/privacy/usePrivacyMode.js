import { useCallback, useEffect, useState } from "react";

import {
  applyPrivacyMode,
  isPrivacyModeEnabled,
  setPrivacyMode,
} from "./PrivacyService";

export default function usePrivacyMode() {
  const [enabled, setEnabled] = useState(isPrivacyModeEnabled);
  useEffect(() => {
    applyPrivacyMode(enabled);
    const handle = (event) => setEnabled(Boolean(event.detail));
    window.addEventListener("abrigo:privacy-change", handle);
    return () => window.removeEventListener("abrigo:privacy-change", handle);
  }, [enabled]);
  const toggle = useCallback(() => setPrivacyMode(!enabled), [enabled]);
  return { enabled, toggle, setEnabled: (value) => setPrivacyMode(value) };
}
