"use client";

import { useTheme } from "@/context/ThemeContext";
import { MoonStars } from "react-bootstrap-icons";

export default function ThemeToggle() {
  const { colorMode, toggleColorMode } = useTheme();
  const checked = colorMode === "dark";

  return (
    <div className="d-flex align-items-center justify-content-between mb-3">
      <div className="d-flex align-items-center gap-2">
        <MoonStars className="text-secondary" />
        <span>Dark Mode</span>
      </div>
      <div className="form-check form-switch mb-0">
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          aria-label="Toggle dark mode"
          checked={checked}
          onChange={toggleColorMode}
        />
      </div>
    </div>
  );
}


