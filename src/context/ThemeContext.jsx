import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const obterPeriodo = () => {
    const hora = new Date().getHours();
    return hora >= 18 || hora < 6 ? "night" : "day";
  };

  const [theme, setTheme] = useState(obterPeriodo);

  useEffect(() => {
    const atualizarTema = () => {
      setTheme(obterPeriodo());
    };

    atualizarTema();

    const intervalo = setInterval(atualizarTema, 60000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    document.body.classList.remove("day", "night");
    document.body.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDay: theme === "day",
        isNight: theme === "night",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}