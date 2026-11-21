"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type User = {
  username: string;
  email: string;
} | null;

type UserContextValue = {
  user: User;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextValue>({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = async (): Promise<User> => {
    try {
      const res = await fetch("/api/me");
      const data = await res.json();
      return data.user || null;
    } catch {
      return null;
    }
  };

  const fetchUser = async () => {
    setUser(await loadUser());
    setIsLoading(false);
  };

  // Initial load; state is only set once the request resolves.
  useEffect(() => {
    let ignore = false;
    loadUser().then((loaded) => {
      if (ignore) return;
      setUser(loaded);
      setIsLoading(false);
    });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, refreshUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}
