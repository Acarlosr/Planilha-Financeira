"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-10 h-10 rounded-lg transition-all hover:scale-105 border"
            style={{
                background: "var(--card-bg)",
                borderColor: "var(--card-border)",
            }}
            title={theme === "dark" ? "Alternar para tema claro" : "Alternar para tema escuro"}
            aria-label="Alternar tema"
        >
            <div className="relative w-5 h-5">
                {/* Sun Icon - visible in dark mode */}
                <Sun
                    size={20}
                    className={`absolute inset-0 transition-all duration-300 ${theme === "dark"
                            ? "opacity-100 rotate-0 scale-100"
                            : "opacity-0 rotate-90 scale-0"
                        }`}
                    style={{ color: "var(--accent)" }}
                />

                {/* Moon Icon - visible in light mode */}
                <Moon
                    size={20}
                    className={`absolute inset-0 transition-all duration-300 ${theme === "light"
                            ? "opacity-100 rotate-0 scale-100"
                            : "opacity-0 -rotate-90 scale-0"
                        }`}
                    style={{ color: "var(--accent)" }}
                />
            </div>
        </button>
    );
}
