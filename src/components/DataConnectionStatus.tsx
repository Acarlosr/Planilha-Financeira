"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Database, PlugZap } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Status = "checking" | "ok" | "warning";

interface StatusItem {
    label: string;
    value: string;
    status: Status;
    icon: React.ReactNode;
}

export default function DataConnectionStatus() {
    const [items, setItems] = useState<StatusItem[]>([
        { label: "Supabase", value: "Verificando dados", status: "checking", icon: <Database size={18} /> },
        { label: "Cotações", value: "Rota interna ativa", status: "ok", icon: <PlugZap size={18} /> },
    ]);

    useEffect(() => {
        let mounted = true;

        async function checkConnections() {
            const nextItems: StatusItem[] = [
                { label: "Supabase", value: "Verificando dados", status: "checking", icon: <Database size={18} /> },
                { label: "Cotações", value: "Rota interna ativa", status: "ok", icon: <PlugZap size={18} /> },
            ];

            try {
                const { data: { user } } = await supabase.auth.getUser();
                nextItems[0] = {
                    label: "Supabase",
                    value: user ? "Conta autenticada" : "Aguardando login",
                    status: user ? "ok" : "warning",
                    icon: <Database size={18} />,
                };
            } catch {
                nextItems[0] = {
                    label: "Supabase",
                    value: "Configuração pendente",
                    status: "warning",
                    icon: <Database size={18} />,
                };
            }

            if (mounted) setItems(nextItems);
        }

        checkConnections();

        return () => {
            mounted = false;
        };
    }, []);

    const getDotColor = (status: Status) => {
        if (status === "ok") return "var(--success)";
        if (status === "warning") return "var(--warning)";
        return "var(--text-tertiary)";
    };

    return (
        <section className="mb-8 glass-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-foreground">Conexões e dados</h2>
                    <p className="text-sm text-muted">Status rápido do app e dos dados de mercado.</p>
                </div>
                <CheckCircle2 size={22} style={{ color: "var(--accent)" }} />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {items.map((item) => (
                    <div
                        key={item.label}
                        className="rounded-lg border p-4"
                        style={{
                            background: "color-mix(in srgb, var(--background-light) 76%, transparent)",
                            borderColor: "var(--card-border)",
                        }}
                    >
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-muted">{item.icon}</span>
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: getDotColor(item.status) }} />
                        </div>
                        <p className="text-sm font-semibold text-foreground">{item.label}</p>
                        <p className="mt-1 text-sm text-muted">{item.value}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
