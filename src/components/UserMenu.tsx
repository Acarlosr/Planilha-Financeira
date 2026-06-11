"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut, ChevronDown, Settings, Crown } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function UserMenu() {
    const router = useRouter();
    const { isAdmin } = useSubscription();
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState("Usuário");
    const [userEmail, setUserEmail] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                setIsAuthenticated(true);
                setUserName(user.user_metadata?.nome || user.email?.split("@")[0] || "Usuário");
                setUserEmail(user.email || "");
            } else {
                setIsAuthenticated(false);
            }
        };
        getUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setIsAuthenticated(true);
                setUserName(session.user.user_metadata?.nome || session.user.email?.split("@")[0] || "Usuário");
                setUserEmail(session.user.email || "");
            } else {
                setIsAuthenticated(false);
            }
        });

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    if (!isAuthenticated) {
        return (
            <div className="flex items-center gap-3">
                <Link
                    href="/login"
                    className="px-4 py-2 text-muted font-medium hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
                >
                    Entrar
                </Link>
                <Link
                    href="/cadastro"
                    className="px-4 py-2 text-black font-semibold rounded-lg transition-all hover:brightness-105"
                    style={{
                        background: "linear-gradient(135deg, var(--accent), var(--secondary))",
                        boxShadow: "0 10px 24px color-mix(in srgb, var(--accent) 22%, transparent)",
                    }}
                >
                    Criar Conta
                </Link>
            </div>
        );
    }

    return (
        <div className="relative" ref={menuRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-white/10 border"
                style={{
                    background: "var(--card-bg)",
                    borderColor: "var(--card-border)",
                }}
            >
                <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, var(--accent), var(--secondary))" }}
                >
                    <User size={18} className="text-black" />
                </div>
                <div className="hidden md:block">
                    <p className="text-sm font-medium text-foreground">{userName}</p>
                    <p className="text-xs text-muted">{userEmail}</p>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-56 rounded-lg overflow-hidden z-50 border"
                    style={{
                        background: "var(--card-bg-solid)",
                        borderColor: "var(--card-border)",
                        backdropFilter: "blur(20px)",
                        boxShadow: "var(--shadow-glass)",
                    }}
                >
                    <div className="p-3 border-b border-white/10">
                        <p className="text-sm font-medium text-foreground">{userName}</p>
                        <p className="text-xs text-muted mt-0.5">{userEmail}</p>
                    </div>

                    <Link
                        href="/settings"
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                    >
                        <Settings size={18} className="text-muted" />
                        <span className="text-sm font-medium text-muted">Configurações</span>
                    </Link>

                    {isAdmin && (
                        <Link
                            href="/admin"
                            onClick={() => setIsOpen(false)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                        >
                            <Crown size={18} style={{ color: "var(--accent)" }} />
                            <span className="text-sm font-medium text-muted">Painel admin</span>
                        </Link>
                    )}

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors border-t border-white/10"
                    >
                        <LogOut size={18} className="text-red-400" />
                        <span className="text-sm font-medium text-muted">Sair</span>
                    </button>
                </div>
            )}
        </div>
    );
}
