"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut, ChevronDown } from "lucide-react";

export default function UserMenu() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState("Usuário");
    const [userEmail, setUserEmail] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Buscar dados do usuário
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setIsAuthenticated(true);
                setUserName(user.user_metadata?.nome || user.email?.split('@')[0] || "Usuário");
                setUserEmail(user.email || "");
            } else {
                setIsAuthenticated(false);
            }
        };
        getUser();

        // Listener para mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setIsAuthenticated(true);
                setUserName(session.user.user_metadata?.nome || session.user.email?.split('@')[0] || "Usuário");
                setUserEmail(session.user.email || "");
            } else {
                setIsAuthenticated(false);
            }
        });

        // Fechar menu ao clicar fora
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

    // Se não estiver autenticado, mostrar botões de login/cadastro
    if (!isAuthenticated) {
        return (
            <div className="flex items-center gap-3">
                <Link
                    href="/login"
                    className="px-4 py-2 text-gray-400 font-medium hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                    Entrar
                </Link>
                <Link
                    href="/cadastro"
                    className="px-4 py-2 text-white font-medium rounded-xl transition-all hover:brightness-110"
                    style={{
                        background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                        boxShadow: "0 4px 15px rgba(30, 64, 175, 0.4)",
                    }}
                >
                    Criar Conta
                </Link>
            </div>
        );
    }

    // Se estiver autenticado, mostrar menu do usuário
    return (
        <div className="relative" ref={menuRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all hover:bg-white/10 border border-white/10"
                style={{
                    background: "rgba(255, 255, 255, 0.05)",
                }}
            >
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                        background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                    }}
                >
                    <User size={18} className="text-white" />
                </div>
                <div className="hidden md:block">
                    <p className="text-sm font-medium text-white">{userName}</p>
                    <p className="text-xs text-gray-400">{userEmail}</p>
                </div>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-56 rounded-xl overflow-hidden z-50 border border-white/10"
                    style={{
                        background: "rgba(10, 22, 40, 0.95)",
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                    }}
                >
                    <div className="p-3 border-b border-white/10">
                        <p className="text-sm font-medium text-white">{userName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{userEmail}</p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                    >
                        <LogOut size={18} className="text-red-400" />
                        <span className="text-sm font-medium text-gray-300">Sair</span>
                    </button>
                </div>
            )}
        </div>
    );
}
