import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import STORAGE_KEYS from "../../core/constants/storageKeys";

import { useTheme } from "./ThemeContext";

const UserContext = createContext(null);

function loadUser() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error(error);
    localStorage.removeItem(STORAGE_KEYS.USER);
    return null;
  }
}

export function UserProvider({ children }) {
  const { greeting } = useTheme();

  const [user, setUser] = useState(loadUser);

  function createUser(name) {
    const newUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      createdAt: new Date().toISOString(),

      preferences: {
        theme: "system",
        music: true,
        volume: 0.4,
      },
    };

    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify(newUser)
    );

    setUser(newUser);
  }

  function updateUser(data) {
    if (!user) return;

    const updated = {
      ...user,
      ...data,
    };

    localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify(updated)
    );

    setUser(updated);
  }

  function clearUser() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  }

  const name = user?.name ?? "";

  const initials = useMemo(() => {
    if (!name) return "";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  }, [name]);

  const firstName = useMemo(() => {
    if (!name) return "";

    return name.split(" ")[0];
  }, [name]);

  const fullGreeting = useMemo(() => {
    if (!firstName) return greeting;

    return `${greeting}, ${firstName}`;
  }, [greeting, firstName]);

  return (
    <UserContext.Provider
      value={{
        user,
        name,
        firstName,
        initials,
        fullGreeting,

        createUser,
        updateUser,
        clearUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
