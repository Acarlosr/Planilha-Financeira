"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import {
    LayoutDashboard,
    TrendingUp,
    TrendingDown,
    LineChart,
    PiggyBank,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Bitcoin,
    Sun,
    Moon,
} from "lucide-react";

interface NavItem {
    icon: React.ReactNode;
    label: string;
    href: string;
}

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();

    const navItems: NavItem[] = [
        { icon: <LayoutDashboard size={22} />, label: "Dashboard", href: "/" },
        { icon: <TrendingUp size={22} />, label: "Receitas", href: "/receitas" },
        { icon: <TrendingDown size={22} />, label: "Despesas", href: "/despesas" },
        { icon: <LineChart size={22} />, label: "Aplicação", href: "/aplicacao" },
        { icon: <PiggyBank size={22} />, label: "Poupança", href: "/poupanca" },
        { icon: <Bitcoin size={22} />, label: "Criptomoedas", href: "/criptomoedas" },
    ];

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <aside
            className={`fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out z-50 border-r ${collapsed ? "w-20" : "w-64"
                }`}
            style={{
                background: "var(--background-light)",
                borderColor: "var(--card-border)",
                backdropFilter: "blur(20px)",
                boxShadow: "4px 0 20px rgba(0, 0, 0, 0.1)",
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
                {!collapsed && (
                    <Link href="/landing" className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                                background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                                boxShadow: "0 4px 15px rgba(14, 165, 233, 0.4)",
                            }}
                        >
                            <TrendingUp className="text-white" size={20} />
                        </div>
                        <span className="font-semibold text-cyan-400 text-lg">FinançasPro</span>
                    </Link>
                )}
                {collapsed && (
                    <Link
                        href="/landing"
                        className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto"
                        style={{
                            background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
                            boxShadow: "0 4px 15px rgba(14, 165, 233, 0.4)",
                        }}
                    >
                        <TrendingUp className="text-white" size={20} />
                    </Link>
                )}
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
                {navItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.href) ? "" : "hover:bg-white/5"
                            }`}
                        style={
                            isActive(item.href)
                                ? {
                                    background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                                    boxShadow: "0 4px 15px rgba(124, 255, 107, 0.4)",
                                    color: "#000000",
                                }
                                : {
                                    color: "var(--text-secondary)",
                                }
                        }
                    >
                        {item.icon}
                        {!collapsed && (
                            <span className="font-medium">
                                {item.label}
                            </span>
                        )}
                    </Link>
                ))}
            </nav>

            {/* Theme Toggle Button */}
            <div className="mt-auto px-4 pb-20">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white/10"
                    style={{ color: "var(--text-secondary)" }}
                    title={theme === "dark" ? "Modo Light" : "Modo Dark"}
                >
                    {theme === "dark" ? (
                        <>
                            <Sun size={22} />
                            {!collapsed && <span className="font-medium">Modo Light</span>}
                        </>
                    ) : (
                        <>
                            <Moon size={22} />
                            {!collapsed && <span className="font-medium">Modo Dark</span>}
                        </>
                    )}
                </button>
            </div>

            {/* Collapse Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border border-white/10 hover:border-white/20"
                style={{
                    background: "rgba(255, 255, 255, 0.05)",
                }}
            >
                {collapsed ? (
                    <ChevronRight size={18} className="text-muted" />
                ) : (
                    <ChevronLeft size={18} className="text-muted" />
                )}
            </button>
        </aside>
    );
}
