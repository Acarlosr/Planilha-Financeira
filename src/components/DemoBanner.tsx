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
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-purple-500 text-white py-3 px-4 shadow-lg"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <LogIn size={18} />
                    </div>
                    <div>
                        <p className="font-medium">Modo Demonstração</p>
                        <p className="text-sm text-purple-100">
                            Você está visualizando dados de exemplo. Faça login para gerenciar suas finanças.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                    >
                        Fazer Login
                    </Link>
                    <Link
                        href="/cadastro"
                        className="px-4 py-2 bg-purple-700 text-white rounded-lg font-medium hover:bg-purple-800 transition-colors"
                    >
                        Criar Conta
                    </Link>
                    <button
                        onClick={() => setShowBanner(false)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
