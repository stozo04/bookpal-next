"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type ColorMode = "light" | "dark";

type ThemeContextValue = {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  toggleColorMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorModeState] = useState<ColorMode>("light");

  // Initialize from system preference; no persistence per requirements
  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial: ColorMode = prefersDark ? "dark" : "light";
    setColorModeState(initial);
  }, []);

  // Reflect color mode to <html data-bs-theme="...">
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-bs-theme", colorMode);
  }, [colorMode]);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
  }, []);

  const toggleColorMode = useCallback(() => {
    setColorModeState((m) => (m === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ colorMode, setColorMode, toggleColorMode }), [colorMode, setColorMode, toggleColorMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}


