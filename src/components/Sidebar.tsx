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
    ChevronLeft,
    ChevronRight,
    Bitcoin,
    Sun,
    Moon,
    Menu,
    X,
} from "lucide-react";

interface NavItem {
    icon: React.ReactNode;
    label: string;
    href: string;
}

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
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
        <>
            {/* Beta Banner */}
            <div className="fixed top-0 left-0 w-full z-[100] text-center flex items-center justify-center gap-2 h-8 text-xs font-medium backdrop-blur-md border-b"
                style={{
                    background: "color-mix(in srgb, var(--accent) 9%, transparent)",
                    borderColor: "color-mix(in srgb, var(--accent) 18%, transparent)",
                    color: "var(--accent)",
                }}
            >
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: "var(--accent)" }}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--accent)" }}></span>
                </span>
                <span className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white" style={{ background: "var(--accent)" }}>
                    FinançasPro Beta
                </span>
                <span>dados reais em evolução</span>
            </div>

            {/* Mobile Top Bar */}
            <div 
                className="md:hidden fixed top-8 left-0 w-full z-40 p-4 flex items-center justify-between border-b"
                style={{
                    background: "color-mix(in srgb, var(--background-light) 88%, transparent)",
                    borderColor: "var(--card-border)",
                    backdropFilter: "blur(12px)",
                }}
            >
                <Link href="/" className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                            background: "var(--accent)",
                            boxShadow: "0 10px 24px color-mix(in srgb, var(--accent) 22%, transparent)",
                        }}
                    >
                        <TrendingUp className="text-white" size={20} />
                    </div>
                    <span className="font-semibold text-foreground text-lg">FinançasPro</span>
                </Link>
                <button 
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-colors"
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Backdrop for mobile */}
            {mobileOpen && (
                <div 
                    className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={`fixed left-0 top-8 h-[calc(100vh-2rem)] transition-all duration-300 ease-in-out z-50 border-r 
                    ${collapsed ? "w-64 md:w-20" : "w-64"} 
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
                style={{
                    background: "var(--background-light)",
                    borderColor: "var(--card-border)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "4px 0 20px rgba(0, 0, 0, 0.1)",
                }}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--card-border)" }}>
                {!collapsed && (
                    <Link href="/" className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                                background: "var(--accent)",
                                boxShadow: "0 10px 24px color-mix(in srgb, var(--accent) 22%, transparent)",
                            }}
                        >
                            <TrendingUp className="text-white" size={20} />
                        </div>
                        <span className="font-semibold text-foreground text-lg">FinançasPro</span>
                    </Link>
                )}
                {collapsed && (
                    <Link
                        href="/"
                        className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto"
                        style={{
                            background: "var(--accent)",
                            boxShadow: "0 10px 24px color-mix(in srgb, var(--accent) 22%, transparent)",
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
                        onClick={() => setMobileOpen(false)}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.href) ? "" : "hover:bg-white/5"
                            }`}
                        style={
                            isActive(item.href)
                                ? {
                                    background: "color-mix(in srgb, var(--accent) 13%, transparent)",
                                    border: "1px solid color-mix(in srgb, var(--accent) 22%, transparent)",
                                    color: "var(--foreground)",
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

            {/* Collapse Button (Desktop Only) */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl items-center justify-center transition-all duration-200 border border-white/10 hover:border-white/20"
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
        </>
    );
}
