import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import ROUTES from "../constants/routes";
import {
  startAnalytics,
  stopAnalytics,
  trackAnonymousEvent,
} from "./AnalyticsService";

const PAGE_NAMES = {
  [ROUTES.HOME]: "home", [ROUTES.DIARY]: "diary", [ROUTES.CALENDAR]: "calendar",
  [ROUTES.LETTERS]: "letters", [ROUTES.FAVORITES]: "favorites", [ROUTES.GOALS]: "goals",
  [ROUTES.HABITS]: "habits", [ROUTES.STATISTICS]: "statistics",
  [ROUTES.ACHIEVEMENTS]: "achievements", [ROUTES.SEARCH]: "search",
  [ROUTES.SETTINGS]: "settings",
};

export default function AnalyticsTracker() {
  const { pathname } = useLocation();
  useEffect(() => {
    startAnalytics();
    return stopAnalytics;
  }, []);
  useEffect(() => {
    const page = PAGE_NAMES[pathname];
    const timer = window.setTimeout(() => {
      if (page) void trackAnonymousEvent("page_view", { page });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [pathname]);
  return null;
}
