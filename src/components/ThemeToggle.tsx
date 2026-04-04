"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center w-10 h-10 rounded-xl transition-all hover:scale-105 border border-white/10"
            style={{
                background: "rgba(255, 255, 255, 0.05)",
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
                    style={{ color: "#C7FF3D" }}
                />

                {/* Moon Icon - visible in light mode */}
                <Moon
                    size={20}
                    className={`absolute inset-0 transition-all duration-300 ${theme === "light"
                            ? "opacity-100 rotate-0 scale-100"
                            : "opacity-0 -rotate-90 scale-0"
                        }`}
                    style={{ color: "#2D5F3F" }}
                />
            </div>
        </button>
    );
}
