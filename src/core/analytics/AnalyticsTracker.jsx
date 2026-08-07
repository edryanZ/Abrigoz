import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import ROUTES from "../constants/routes";
import { getAnalyticsConsent } from "./AnalyticsConsentService";

const PAGE_NAMES = {
  [ROUTES.HOME]: "home", [ROUTES.DIARY]: "diary", [ROUTES.CALENDAR]: "calendar",
  [ROUTES.LETTERS]: "letters", [ROUTES.FAVORITES]: "favorites", [ROUTES.GOALS]: "goals",
  [ROUTES.HABITS]: "habits", [ROUTES.STATISTICS]: "statistics",
  [ROUTES.MOMENT]: "moment", [ROUTES.SEARCH]: "search",
  [ROUTES.SETTINGS]: "settings",
};

export default function AnalyticsTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!getAnalyticsConsent()) return undefined;
    let disposed = false;
    let stop;
    import("./AnalyticsService").then((service) => {
      if (disposed) return;
      stop = service.stopAnalytics;
      service.startAnalytics();
    }).catch(() => {});
    return () => {
      disposed = true;
      stop?.();
    };
  }, []);
  useEffect(() => {
    const page = PAGE_NAMES[pathname];
    if (!page || !getAnalyticsConsent()) return undefined;
    const timer = window.setTimeout(() => {
      void import("./AnalyticsService")
        .then(({ trackAnonymousEvent }) => trackAnonymousEvent("page_view", { page }))
        .catch(() => false);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [pathname]);
  return null;
}
