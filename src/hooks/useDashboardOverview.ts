"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface RecentTransaction {
    id: string;
    date: string;
    description: string;
    category: string;
    value: number;
    type: "entrada" | "saida";
}

export interface MonthlyCashFlow {
    month: string;
    entradas: number;
    saidas: number;
}

interface DashboardOverview {
    currentIncome: number;
    currentExpenses: number;
    previousIncome: number;
    previousExpenses: number;
    totalInvestments: number;
    recentTransactions: RecentTransaction[];
    monthlyCashFlow: MonthlyCashFlow[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const getMonthRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
    };
};

const formatDate = (value: string) => {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
};

export function useDashboardOverview(): DashboardOverview {
    const [currentIncome, setCurrentIncome] = useState(0);
    const [currentExpenses, setCurrentExpenses] = useState(0);
    const [previousIncome, setPreviousIncome] = useState(0);
    const [previousExpenses, setPreviousExpenses] = useState(0);
    const [totalInvestments, setTotalInvestments] = useState(0);
    const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
    const [monthlyCashFlow, setMonthlyCashFlow] = useState<MonthlyCashFlow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadOverview = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setCurrentIncome(0);
                setCurrentExpenses(0);
                setPreviousIncome(0);
                setPreviousExpenses(0);
                setTotalInvestments(0);
                setRecentTransactions([]);
                setMonthlyCashFlow([]);
                return;
            }

            const now = new Date();
            const currentRange = getMonthRange(now);
            const previousRange = getMonthRange(new Date(now.getFullYear(), now.getMonth() - 1, 1));
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
            const historyStart = sixMonthsAgo.toISOString().slice(0, 10);

            const [receitasResult, despesasResult, aplicacoesResult, poupancaResult] = await Promise.all([
                supabase
                    .from("receitas")
                    .select("id, descricao, valor, data, categoria_id")
                    .eq("user_id", user.id)
                    .gte("data", historyStart)
                    .order("data", { ascending: false }),
                supabase
                    .from("despesas")
                    .select("id, descricao, valor, data, categoria_id")
                    .eq("user_id", user.id)
                    .gte("data", historyStart)
                    .order("data", { ascending: false }),
                supabase
                    .from("aplicacoes")
                    .select("valor, tipo_transacao")
                    .eq("user_id", user.id),
                supabase
                    .from("poupanca")
                    .select("valor, tipo_transacao")
                    .eq("user_id", user.id),
            ]);

            const warnings = [
                receitasResult.error ? `Receitas: ${receitasResult.error.message}` : null,
                despesasResult.error ? `Despesas: ${despesasResult.error.message}` : null,
                aplicacoesResult.error ? `Aplicações: ${aplicacoesResult.error.message}` : null,
                poupancaResult.error ? `Poupança: ${poupancaResult.error.message}` : null,
            ].filter(Boolean);

            const receitas = receitasResult.error ? [] : receitasResult.data ?? [];
            const despesas = despesasResult.error ? [] : despesasResult.data ?? [];
            const aplicacoes = aplicacoesResult.error ? [] : aplicacoesResult.data ?? [];
            const poupanca = poupancaResult.error ? [] : poupancaResult.data ?? [];

            const sumBetween = (
                rows: Array<{ valor: number; data: string }>,
                range: { start: string; end: string }
            ) => rows
                .filter((item) => item.data >= range.start && item.data < range.end)
                .reduce((sum, item) => sum + Number(item.valor), 0);

            setCurrentIncome(sumBetween(receitas, currentRange));
            setCurrentExpenses(sumBetween(despesas, currentRange));
            setPreviousIncome(sumBetween(receitas, previousRange));
            setPreviousExpenses(sumBetween(despesas, previousRange));
            setTotalInvestments(
                aplicacoes.reduce((sum, item) => {
                    const value = Number(item.valor);
                    return item.tipo_transacao === "resgate" ? sum - value : sum + value;
                }, 0) + poupanca.reduce((sum, item) => {
                    const value = Number(item.valor);
                    return item.tipo_transacao === "retirada" ? sum - value : sum + value;
                }, 0)
            );
            setError(warnings.length > 0 ? warnings.join(" | ") : null);

            const months = Array.from({ length: 6 }, (_, index) => {
                const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
                const range = getMonthRange(date);
                return {
                    month: monthLabels[date.getMonth()],
                    entradas: sumBetween(receitas, range),
                    saidas: sumBetween(despesas, range),
                };
            });
            setMonthlyCashFlow(months);

            const recent = [
                ...receitas.map((item) => ({
                    id: `receita-${item.id}`,
                    date: formatDate(item.data),
                    description: item.descricao,
                    category: "Receita",
                    value: Number(item.valor),
                    type: "entrada" as const,
                })),
                ...despesas.map((item) => ({
                    id: `despesa-${item.id}`,
                    date: formatDate(item.data),
                    description: item.descricao,
                    category: "Despesa",
                    value: Number(item.valor),
                    type: "saida" as const,
                })),
            ]
                .sort((a, b) => b.date.split("/").reverse().join("").localeCompare(a.date.split("/").reverse().join("")))
                .slice(0, 8);

            setRecentTransactions(recent);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao carregar dashboard";
            setError(message);
            setCurrentIncome(0);
            setCurrentExpenses(0);
            setPreviousIncome(0);
            setPreviousExpenses(0);
            setTotalInvestments(0);
            setRecentTransactions([]);
            setMonthlyCashFlow([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOverview();
    }, [loadOverview]);

    return useMemo(() => ({
        currentIncome,
        currentExpenses,
        previousIncome,
        previousExpenses,
        totalInvestments,
        recentTransactions,
        monthlyCashFlow,
        loading,
        error,
        refetch: loadOverview,
    }), [
        currentIncome,
        currentExpenses,
        previousIncome,
        previousExpenses,
        totalInvestments,
        recentTransactions,
        monthlyCashFlow,
        loading,
        error,
        loadOverview,
    ]);
}
