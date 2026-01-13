"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    TrendingUp,
    TrendingDown,
    LineChart,
    PiggyBank,
    ChevronLeft,
    ChevronRight,
    Bitcoin,
} from "lucide-react";

interface NavItem {
    icon: React.ReactNode;
    label: string;
    href: string;
}

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const pathname = usePathname();

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
            className={`fixed left-0 top-0 h-screen bg-white transition-all duration-300 ease-in-out z-50 ${collapsed ? "w-20" : "w-64"
                }`}
            style={{
                boxShadow: "4px 0 20px rgba(0, 0, 0, 0.05)",
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                {!collapsed && (
                    <Link href="/" className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                                background: "linear-gradient(135deg, #A855F7 0%, #C084FC 100%)",
                            }}
                        >
                            <TrendingUp className="text-white" size={20} />
                        </div>
                        <span className="font-semibold text-gray-800 text-lg">FinançasPro</span>
                    </Link>
                )}
                {collapsed && (
                    <Link
                        href="/"
                        className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto"
                        style={{
                            background: "linear-gradient(135deg, #A855F7 0%, #C084FC 100%)",
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
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(item.href)
                            ? "text-white"
                            : "text-gray-600 hover:bg-gray-50"
                            }`}
                        style={
                            isActive(item.href)
                                ? {
                                    background: "linear-gradient(135deg, #A855F7 0%, #C084FC 100%)",
                                    boxShadow: "0 4px 15px rgba(168, 85, 247, 0.4)",
                                }
                                : {}
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

            {/* Collapse Button */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-all duration-200"
                style={{
                    boxShadow: "2px 2px 8px rgba(0, 0, 0, 0.05), -2px -2px 8px rgba(255, 255, 255, 0.8)",
                }}
            >
                {collapsed ? (
                    <ChevronRight size={18} className="text-gray-600" />
                ) : (
                    <ChevronLeft size={18} className="text-gray-600" />
                )}
            </button>
        </aside>
    );
}
