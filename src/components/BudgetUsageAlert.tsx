"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Gauge, TrendingDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

type MonthlyRow = {
    valor: number | string | null;
    data: string | null;
};

const formatCurrency = (value: number) => value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
});

const getMonthBounds = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return {
        startDate: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-01`,
        endDate: `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-01`,
    };
};

const sumRowsInMonth = (rows: MonthlyRow[], startDate: string, endDate: string) => rows
    .filter((item) => item.data && item.data >= startDate && item.data < endDate)
    .reduce((sum, item) => sum + Number(item.valor ?? 0), 0);

const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message;
    if (typeof err === "object" && err && "message" in err) {
        return String((err as { message?: unknown }).message);
    }
    return "Erro ao carregar uso da receita";
};

const getTone = (usage: number) => {
    if (usage >= 100) {
        return {
            label: "Limite da receita atingido",
            color: "var(--danger)",
            bg: "color-mix(in srgb, var(--danger) 10%, transparent)",
            border: "color-mix(in srgb, var(--danger) 24%, transparent)",
            icon: <AlertTriangle size={18} />,
            bar: "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
        };
    }

    if (usage >= 75) {
        return {
            label: "Atenção ao orçamento",
            color: "var(--warning)",
            bg: "color-mix(in srgb, var(--warning) 12%, transparent)",
            border: "color-mix(in srgb, var(--warning) 26%, transparent)",
            icon: <AlertTriangle size={18} />,
            bar: "linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)",
        };
    }

    return {
        label: "Orçamento saudável",
        color: "var(--success)",
        bg: "color-mix(in srgb, var(--success) 10%, transparent)",
        border: "color-mix(in srgb, var(--success) 24%, transparent)",
        icon: <CheckCircle2 size={18} />,
        bar: "linear-gradient(90deg, #22c55e 0%, #84cc16 100%)",
    };
};

export default function BudgetUsageAlert() {
    const [currentIncome, setCurrentIncome] = useState(0);
    const [currentExpenses, setCurrentExpenses] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadBudgetUsage = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                setCurrentIncome(0);
                setCurrentExpenses(0);
                return;
            }

            const { startDate, endDate } = getMonthBounds();

            const [receitasResult, despesasResult] = await Promise.all([
                supabase
                    .from("receitas")
                    .select("valor, data")
                    .eq("user_id", session.user.id)
                    .order("data", { ascending: false }),
                supabase
                    .from("despesas")
                    .select("valor, data")
                    .eq("user_id", session.user.id)
                    .order("data", { ascending: false }),
            ]);

            if (receitasResult.error) throw new Error(`Receitas: ${receitasResult.error.message}`);
            if (despesasResult.error) throw new Error(`Despesas: ${despesasResult.error.message}`);

            setCurrentIncome(sumRowsInMonth((receitasResult.data ?? []) as MonthlyRow[], startDate, endDate));
            setCurrentExpenses(sumRowsInMonth((despesasResult.data ?? []) as MonthlyRow[], startDate, endDate));
        } catch (err) {
            setError(getErrorMessage(err));
            setCurrentIncome(0);
            setCurrentExpenses(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadBudgetUsage();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            loadBudgetUsage();
        });

        return () => subscription.unsubscribe();
    }, [loadBudgetUsage]);

    const usage = currentIncome > 0 ? (currentExpenses / currentIncome) * 100 : 0;
    const cappedUsage = Math.min(Math.max(usage, 0), 100);
    const balance = currentIncome - currentExpenses;
    const tone = getTone(usage);

    const message = currentIncome <= 0
        ? "Cadastre uma receita para o app medir quanto das entradas do mês já foi comprometido."
        : usage >= 100
            ? "Suas despesas atingiram ou passaram a receita do mês."
            : `Você atingiu ${usage.toFixed(1).replace(".", ",")}% da receita do mês.`;

    return (
        <section className="glass-card market-card mb-8 p-5" style={{ borderColor: tone.border }}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg" style={{ background: tone.bg, color: tone.color, boxShadow: `0 0 24px ${tone.color}` }}>
                        <Gauge size={22} />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-bold text-foreground">Uso da receita do mês</h2>
                            <span className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold" style={{ color: tone.color, background: tone.bg }}>
                                {tone.icon}
                                {tone.label}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-muted">{loading ? "Calculando receita e despesas..." : error ?? message}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-right text-sm lg:min-w-[420px]">
                    <div>
                        <p className="text-xs text-muted">Receita</p>
                        <p className="font-bold text-foreground">{formatCurrency(currentIncome)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted">Despesas</p>
                        <p className="font-bold" style={{ color: tone.color }}>{formatCurrency(currentExpenses)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted">Saldo</p>
                        <p className="font-bold" style={{ color: balance < 0 ? "var(--danger)" : "var(--foreground)" }}>{formatCurrency(balance)}</p>
                    </div>
                </div>
            </div>

            <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs text-muted">
                    <span className="flex items-center gap-1">
                        <TrendingDown size={14} />
                        Despesas sobre receitas
                    </span>
                    <span className="font-bold" style={{ color: tone.color }}>
                        {currentIncome > 0 ? `${usage.toFixed(1).replace(".", ",")}%` : "0%"}
                    </span>
                </div>
                <div className="h-4 overflow-hidden rounded-full border" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)", borderColor: "var(--card-border)" }}>
                    <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                            width: `${loading ? 0 : cappedUsage}%`,
                            background: tone.bar,
                            boxShadow: `0 0 20px ${tone.color}`,
                        }}
                    />
                </div>
                <div className="mt-2 grid grid-cols-3 text-xs text-muted">
                    <span>0%</span>
                    <span className="text-center">75%</span>
                    <span className="text-right">100%</span>
                </div>
            </div>
        </section>
    );
}
