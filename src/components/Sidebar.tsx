"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import UserMenu from "@/components/UserMenu";
import {
    LayoutDashboard,
    TrendingUp,
    TrendingDown,
    LineChart,
    PiggyBank,
    ChevronLeft,
    ChevronRight,
    Bitcoin,
    CreditCard,
    Sun,
    Moon,
    Sparkles,
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
        { icon: <CreditCard size={22} />, label: "Cartões", href: "/cartoes" },
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
            <div
                className="fixed top-0 left-0 w-full z-[100] text-center flex items-center justify-center gap-2 h-8 text-xs font-medium backdrop-blur-md border-b"
                style={{
                    background:
                        "linear-gradient(90deg, rgba(7, 11, 21, 0.7), color-mix(in srgb, var(--accent) 11%, transparent), rgba(7, 11, 21, 0.7))",
                    borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)",
                    color: "var(--accent)",
                }}
            >
                <span className="relative flex h-2 w-2">
                    <span
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
                        style={{ background: "var(--accent)" }}
                    />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--accent)" }} />
                </span>
                <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
                    style={{ background: "var(--accent)" }}
                >
                    FinançasPro Beta
                </span>
                <span>dados reais em evolução</span>
            </div>

            <div
                className="md:hidden fixed top-8 left-0 w-full z-40 p-4 flex items-center justify-between border-b sidebar-glass"
                style={{ borderColor: "var(--card-border)" }}
            >
                <Link href="/" className="sidebar-focus flex items-center gap-3 rounded-lg">
                    <div
                        className="logo-glow w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, var(--accent), var(--secondary))" }}
                    >
                        <Sparkles className="text-black" size={20} aria-hidden="true" />
                    </div>
                    <span className="font-semibold text-foreground text-lg">FinançasPro</span>
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-expanded={mobileOpen}
                    aria-controls="sidebar-nav"
                    aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
                    className="sidebar-focus p-2 rounded-lg bg-white/5 text-foreground hover:bg-white/10 transition-colors"
                >
                    <span className={`hamburger ${mobileOpen ? "is-open" : ""}`} aria-hidden="true">
                        <span />
                        <span />
                        <span />
                    </span>
                </button>
            </div>

            {mobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside
                id="sidebar-nav"
                className={`sidebar-glass fixed left-0 top-8 h-[calc(100vh-2rem)] flex flex-col transition-all duration-300 ease-in-out z-50 border-r ${
                    collapsed ? "w-64 md:w-20" : "w-64"
                } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
                style={{
                    borderColor: "var(--card-border)",
                    boxShadow: "14px 0 48px rgba(0, 0, 0, 0.24)",
                }}
            >
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--card-border)" }}>
                    {!collapsed && (
                        <Link href="/" className="sidebar-focus flex items-center gap-3 rounded-lg">
                            <div
                                className="logo-glow w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: "linear-gradient(135deg, var(--accent), var(--secondary))" }}
                            >
                                <Sparkles className="text-black" size={20} aria-hidden="true" />
                            </div>
                            <span className="font-semibold text-foreground text-lg">FinançasPro</span>
                        </Link>
                    )}
                    {collapsed && (
                        <Link
                            href="/"
                            aria-label="FinançasPro — Dashboard"
                            className="sidebar-focus logo-glow w-10 h-10 rounded-xl flex items-center justify-center mx-auto"
                            style={{ background: "linear-gradient(135deg, var(--accent), var(--secondary))" }}
                        >
                            <Sparkles className="text-black" size={20} aria-hidden="true" />
                        </Link>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-2" aria-label="Navegação principal">
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            aria-current={isActive(item.href) ? "page" : undefined}
                            className={`nav-item w-full flex items-center gap-4 py-3 rounded-lg ${
                                isActive(item.href) ? "nav-item--active" : ""
                            } ${collapsed ? "px-4 md:px-0 md:justify-center" : "px-4"}`}
                        >
                            <span className="nav-item__icon" aria-hidden="true">
                                {item.icon}
                            </span>
                            {!collapsed && <span className="font-medium">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 space-y-2 border-t" style={{ borderColor: "var(--card-border)" }}>
                    <UserMenu dropUp collapsed={collapsed} />

                    <button
                        onClick={toggleTheme}
                        aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
                        className={`sidebar-focus w-full flex items-center gap-3 py-3 rounded-xl transition-all hover:bg-white/10 ${
                            collapsed ? "px-4 md:px-0 md:justify-center" : "px-4"
                        }`}
                        style={{ color: "var(--text-secondary)" }}
                    >
                        <span key={theme} className="theme-toggle-icon" aria-hidden="true">
                            {theme === "dark" ? <Sun size={22} /> : <Moon size={22} />}
                        </span>
                        {!collapsed && <span className="font-medium">{theme === "dark" ? "Modo Light" : "Modo Dark"}</span>}
                    </button>

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
                        className="sidebar-focus hidden md:flex w-full h-10 rounded-xl items-center justify-center transition-all duration-200 border border-white/10 hover:border-white/20"
                        style={{ background: "rgba(255, 255, 255, 0.05)" }}
                    >
                        {collapsed ? (
                            <ChevronRight size={18} className="text-muted" aria-hidden="true" />
                        ) : (
                            <ChevronLeft size={18} className="text-muted" aria-hidden="true" />
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}
