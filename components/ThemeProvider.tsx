"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const LEGACY_STORAGE_KEY = "gista-theme";
const ANONYMOUS_STORAGE_KEY = "gista-theme:anonymous";

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

function storageKey(userId: string | null) {
  return userId ? `gista-theme:${userId}` : ANONYMOUS_STORAGE_KEY;
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Read the last selected theme synchronously so a refresh does not first paint Light.
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    try {
      const saved = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      return isTheme(saved) ? saved : "light";
    } catch {
      return "light";
    }
  });
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    let active = true;

    async function loadUserTheme(nextUserId: string | null) {
      if (!active) return;
      setUserId(nextUserId);

      if (!nextUserId) {
        let anonymousTheme: Theme = "light";
        try {
          const saved = window.localStorage.getItem(ANONYMOUS_STORAGE_KEY);
          if (isTheme(saved)) anonymousTheme = saved;
          else {
            const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
            if (isTheme(legacy)) anonymousTheme = legacy;
          }
          window.localStorage.setItem(LEGACY_STORAGE_KEY, anonymousTheme);
        } catch {}
        if (active) setThemeState(anonymousTheme);
        return;
      }

      // Account cache is applied immediately while the canonical profile value loads.
      let cachedTheme: Theme | null = null;
      try {
        const cached = window.localStorage.getItem(storageKey(nextUserId));
        if (isTheme(cached)) cachedTheme = cached;
      } catch {}
      if (cachedTheme && active) setThemeState(cachedTheme);

      const { data, error } = await supabase
        .from("profiles")
        .select("theme_preference")
        .eq("id", nextUserId)
        .maybeSingle();

      if (!active) return;
      const storedTheme = !error && isTheme(data?.theme_preference) ? data.theme_preference : null;
      const finalTheme = storedTheme ?? cachedTheme ?? "light";
      setThemeState(finalTheme);
      try {
        window.localStorage.setItem(storageKey(nextUserId), finalTheme);
        window.localStorage.setItem(LEGACY_STORAGE_KEY, finalTheme);
      } catch {}
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      void loadUserTheme(session?.user.id ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => void loadUserTheme(session?.user.id ?? null), 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    const next = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    setResolvedTheme(next);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    // Update immediately, then persist both the fast local cache and account preference.
    setThemeState(next);
    try {
      window.localStorage.setItem(storageKey(userId), next);
      window.localStorage.setItem(LEGACY_STORAGE_KEY, next);
    } catch {}

    if (userId) {
      void supabase
        .from("profiles")
        .update({ theme_preference: next })
        .eq("id", userId)
        .then(({ error }) => {
          if (error) console.error("Unable to save Gista theme preference:", error.message);
        });
    }
  }, [supabase, userId]);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
