"use client";

import { useTheme } from "@/context/ThemeContext";
import { MoonStars, Sun } from "react-bootstrap-icons";

export default function PublicThemeToggle() {
  const { colorMode, toggleColorMode } = useTheme();
  const dark = colorMode === "dark";
  return (
    <button
      type="button"
      className="btn btn-outline-secondary btn-sm rounded-pill d-inline-flex align-items-center gap-2"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleColorMode}
    >
      {dark ? <Sun size={14} /> : <MoonStars size={14} />}
      <span className="small">{dark ? "Light" : "Dark"}</span>
    </button>
  );
}


