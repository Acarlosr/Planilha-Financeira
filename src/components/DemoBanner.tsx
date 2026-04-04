"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { LogIn, X } from "lucide-react";

export default function DemoBanner() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showBanner, setShowBanner] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);
        };
        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Não mostrar banner se estiver autenticado ou se foi fechado
    if (isAuthenticated || !showBanner) return null;

    return (
        <div
            className="fixed top-0 left-0 right-0 z-50 py-3 px-4 border-b border-white/10"
            style={{
                background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 50%, #FFD700 100%)",
                boxShadow: "0 4px 20px rgba(30, 64, 175, 0.3)",
            }}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <LogIn size={18} className="text-white" />
                    </div>
                    <div>
                        <p className="font-medium text-foreground">Modo Demonstração</p>
                        <p className="text-sm text-cyan-100">
                            Você está visualizando dados de exemplo. Faça login para gerenciar suas finanças.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
                    >
                        Fazer Login
                    </Link>
                    <Link
                        href="/cadastro"
                        className="px-4 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/20"
                    >
                        Criar Conta
                    </Link>
                    <button
                        onClick={() => setShowBanner(false)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-foreground" />
                    </button>
                </div>
            </div>
        </div>
    );
}
