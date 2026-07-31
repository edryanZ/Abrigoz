import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getPeriod } from "../../core/utils/timePeriod";
import themes from "../../core/theme";
import applyTheme from "../../core/theme/applyTheme";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [period, setPeriod] = useState(getPeriod());

  useEffect(() => {
    let timer;
    function atualizarPeriodo() {
      setPeriod(getPeriod());
      const now = new Date();
      const nextHours = [5, 6, 12, 18, 24].find((hour) => hour > now.getHours()) ?? 24;
      const next = new Date(now);
      if (nextHours === 24) {
        next.setDate(next.getDate() + 1);
        next.setHours(0, 0, 0, 0);
      } else {
        next.setHours(nextHours, 0, 0, 0);
      }
      timer = window.setTimeout(atualizarPeriodo, Math.max(1_000, next - now));
    }

    atualizarPeriodo();
    return () => window.clearTimeout(timer);
  }, []);

  const theme = themes[period];

  const isNight = period === "noite";

  const greeting = useMemo(() => {
    switch (period) {
      case "amanhecer":
        return "Bom dia";

      case "dia":
        return "Bom dia";

      case "entardecer":
        return "Boa tarde";

      case "noite":
        return "Boa noite";

      default:
        return "Olá";
    }
  }, [period]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.body.classList.remove(
      "dawn",
      "day",
      "sunset",
      "night"
    );

    switch (period) {
      case "amanhecer":
        document.body.classList.add("dawn");
        break;

      case "dia":
        document.body.classList.add("day");
        break;

      case "entardecer":
        document.body.classList.add("sunset");
        break;

      default:
        document.body.classList.add("night");
    }
  }, [period]);

  return (
    <ThemeContext.Provider
      value={{
        period,
        greeting,
        theme,
        isNight,
        isDay: !isNight,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
