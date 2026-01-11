"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar sessão inicial
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            // Rotas públicas (não precisam de autenticação)
            const publicRoutes = ["/login", "/cadastro"];
            const isPublicRoute = publicRoutes.includes(pathname);

            if (!session && !isPublicRoute) {
                // Não está logado e tentando acessar rota protegida
                router.push("/login");
            } else if (session && isPublicRoute) {
                // Está logado e tentando acessar login/cadastro
                router.push("/");
            }

            setLoading(false);
        };

        checkSession();

        // Listener para mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const publicRoutes = ["/login", "/cadastro"];
            const isPublicRoute = publicRoutes.includes(pathname);

            if (!session && !isPublicRoute) {
                router.push("/login");
            } else if (session && isPublicRoute) {
                router.push("/");
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [pathname, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#FDFBF7" }}>
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
