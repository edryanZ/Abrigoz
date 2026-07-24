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
    function atualizarPeriodo() {
      setPeriod(getPeriod());
    }

    atualizarPeriodo();

    const intervalo = setInterval(
      atualizarPeriodo,
      60000
    );

    return () => clearInterval(intervalo);
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