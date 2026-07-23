import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

const STORAGE_KEY = "abrigo_user";

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

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

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }

  function updateUser(data) {
    const updated = {
      ...user,
      ...data,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setUser(updated);
  }

  function clearUser() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }

  return (
    <UserContext.Provider
      value={{
        user,
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