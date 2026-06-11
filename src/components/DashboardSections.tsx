"use client";

import { useCallback, useEffect, useState } from "react";
import { SlidersHorizontal, Eye, EyeOff, X, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import SummaryCards from "@/components/SummaryCards";
import CashFlowChart from "@/components/CashFlowChart";
import TransactionsTable from "@/components/TransactionsTable";
import FinancialRadar from "@/components/FinancialRadar";
import PaymentReminders from "@/components/PaymentReminders";
import BudgetUsageAlert from "@/components/BudgetUsageAlert";

interface SectionDef {
    id: string;
    title: string;
    render: () => React.ReactNode;
}

// Ordem e definição das seções personalizáveis do dashboard.
// Os ids batem com os usados na tabela dashboard_preferences.
const SECTIONS: SectionDef[] = [
    { id: "budget_vs_actual", title: "Alerta de orçamento", render: () => <BudgetUsageAlert /> },
    { id: "bills_calendar", title: "Lembretes de vencimento", render: () => <PaymentReminders /> },
    { id: "financial_radar", title: "Radar financeiro", render: () => <FinancialRadar /> },
    { id: "summary_cards", title: "Cards de resumo", render: () => <SummaryCards /> },
    { id: "cash_flow_chart", title: "Fluxo de caixa", render: () => <CashFlowChart /> },
    { id: "transactions_table", title: "Tabela de transações", render: () => <TransactionsTable /> },
];

const STORAGE_KEY = "dashboard_hidden_cards";

export default function DashboardSections() {
    const [hidden, setHidden] = useState<Set<string>>(new Set());
    const [painelAberto, setPainelAberto] = useState(false);
    const [carregado, setCarregado] = useState(false);

    // Carrega preferências: tenta o Supabase e cai para localStorage
    const carregarPreferencias = useCallback(async () => {
        try {
            // Considera apenas ids de seções que existem hoje (ignora registros antigos/órfãos)
            const idsConhecidos = new Set(SECTIONS.map((s) => s.id));
            const sanitizar = (ids: string[]) => {
                const ocultos = new Set(ids.filter((id) => idsConhecidos.has(id)));
                // Se TUDO ficou oculto, é estado inválido (dado antigo) — mostra tudo
                if (ocultos.size >= SECTIONS.length) ocultos.clear();
                return ocultos;
            };

            const local = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
            if (local) {
                setHidden(sanitizar(JSON.parse(local)));
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from("dashboard_preferences")
                    .select("card_id, is_visible")
                    .eq("user_id", user.id);

                if (!error && data && data.length > 0) {
                    setHidden(
                        sanitizar(
                            data.filter((p) => p.is_visible === false).map((p) => p.card_id)
                        )
                    );
                }
            }
        } catch {
            // silencioso: usa o que tiver do localStorage
        } finally {
            setCarregado(true);
        }
    }, []);

    useEffect(() => {
        carregarPreferencias();
    }, [carregarPreferencias]);

    const persistir = useCallback(async (novoHidden: Set<string>) => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...novoHidden]));
        }
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const rows = SECTIONS.map((section, index) => ({
                user_id: user.id,
                card_id: section.id,
                is_visible: !novoHidden.has(section.id),
                position: index,
            }));

            await supabase
                .from("dashboard_preferences")
                .upsert(rows, { onConflict: "user_id,card_id" });
        } catch {
            // mantém apenas o localStorage caso o banco falhe
        }
    }, []);

    const toggle = (id: string) => {
        setHidden((prev) => {
            const novo = new Set(prev);
            if (novo.has(id)) novo.delete(id);
            else novo.add(id);
            persistir(novo);
            return novo;
        });
    };

    const restaurarPadrao = () => {
        const vazio = new Set<string>();
        setHidden(vazio);
        persistir(vazio);
    };

    return (
        <>
            {/* Botão de personalização */}
            <div className="mb-4 flex justify-end">
                <button
                    onClick={() => setPainelAberto(true)}
                    className="no-print flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-muted transition hover:text-foreground"
                    style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}
                >
                    <SlidersHorizontal size={16} />
                    Personalizar painel
                </button>
            </div>

            {/* Seções visíveis */}
            {carregado &&
                SECTIONS.filter((section) => !hidden.has(section.id)).map((section) => (
                    <section key={section.id} className="mb-8">
                        {section.render()}
                    </section>
                ))}

            {/* Painel lateral de personalização */}
            {painelAberto && (
                <div className="no-print fixed inset-0 z-[110] flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setPainelAberto(false)}
                    />
                    <div
                        className="relative h-full w-full max-w-sm overflow-y-auto p-6 shadow-2xl"
                        style={{ background: "var(--card-bg-solid)" }}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-foreground">Personalizar painel</h2>
                            <button
                                onClick={() => setPainelAberto(false)}
                                className="rounded-full p-2 text-muted transition hover:bg-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <p className="mb-4 text-sm text-muted">
                            Escolha quais blocos aparecem no seu dashboard. As preferências ficam salvas na sua conta.
                        </p>

                        <div className="space-y-2">
                            {SECTIONS.map((section) => {
                                const visivel = !hidden.has(section.id);
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => toggle(section.id)}
                                        className="flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition hover:bg-white/5"
                                        style={{ borderColor: "var(--card-border)" }}
                                    >
                                        <span className="font-medium text-foreground">{section.title}</span>
                                        {visivel ? (
                                            <span className="flex items-center gap-1.5 text-sm" style={{ color: "var(--success)" }}>
                                                <Eye size={16} /> Visível
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-sm text-muted">
                                                <EyeOff size={16} /> Oculto
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={restaurarPadrao}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium text-muted transition hover:text-foreground"
                            style={{ borderColor: "var(--card-border)" }}
                        >
                            <RotateCcw size={16} />
                            Mostrar todos
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
