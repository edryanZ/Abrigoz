import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

import STORAGE_KEYS from "../../core/constants/storageKeys";
import { storage } from "../../core/storage/storage";

import { useTheme } from "./ThemeContext";

const UserContext = createContext(null);

function loadUser() {
  return storage.get(STORAGE_KEYS.USER);
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

    storage.set(STORAGE_KEYS.USER, newUser);

    setUser(newUser);
  }

  function updateUser(data) {
    if (!user) return;

    const updated = {
      ...user,
      ...data,
    };

    storage.set(STORAGE_KEYS.USER, updated);

    setUser(updated);
  }

  function clearUser() {
    storage.remove(STORAGE_KEYS.USER);
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
