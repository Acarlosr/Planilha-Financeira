"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getMonthRange, sumInRange, computeInvestmentsTotal } from "@/lib/finance";

export interface RecentTransaction {
    id: string;
    date: string;
    isoDate: string;
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

const formatDate = (value: string) => {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
};

const getExpenseReferenceDate = (item: {
    data: string;
    cartao_id?: string | null;
    data_vencimento?: string | null;
}) => (item.cartao_id && item.data_vencimento ? item.data_vencimento : item.data);

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

            const {
                data: { user },
            } = await supabase.auth.getUser();
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
            const expenseHistoryStart = new Date(now.getFullYear(), now.getMonth() - 7, 1);
            const historyStart = sixMonthsAgo.toISOString().slice(0, 10);
            const expenseQueryStart = expenseHistoryStart.toISOString().slice(0, 10);

            const [receitasResult, despesasResult, aplicacoesResult, metasPoupancaResult] = await Promise.all([
                supabase
                    .from("receitas")
                    .select("id, descricao, valor, data, categoria_id")
                    .eq("user_id", user.id)
                    .gte("data", historyStart)
                    .order("data", { ascending: false }),
                supabase
                    .from("despesas")
                    .select("id, descricao, valor, data, categoria_id, cartao_id, data_vencimento")
                    .eq("user_id", user.id)
                    .gte("data", expenseQueryStart)
                    .order("data", { ascending: false }),
                supabase.from("aplicacoes").select("valor, tipo_transacao").eq("user_id", user.id),
                supabase.from("metas_poupanca").select("valor_atual").eq("user_id", user.id),
            ]);

            const isAbort = (msg?: string) => msg?.includes("AbortError") || msg?.includes("steal");
            const warnings = [
                receitasResult.error && !isAbort(receitasResult.error.message) ? `Receitas: ${receitasResult.error.message}` : null,
                despesasResult.error && !isAbort(despesasResult.error.message) ? `Despesas: ${despesasResult.error.message}` : null,
                aplicacoesResult.error && !isAbort(aplicacoesResult.error.message) ? `Aplicações: ${aplicacoesResult.error.message}` : null,
                metasPoupancaResult.error && !isAbort(metasPoupancaResult.error.message) ? `Poupança: ${metasPoupancaResult.error.message}` : null,
            ].filter(Boolean);

            const receitas = receitasResult.error ? [] : receitasResult.data ?? [];
            const despesas = despesasResult.error ? [] : despesasResult.data ?? [];
            const despesasPorCompetencia = despesas.map((item) => ({
                ...item,
                data: getExpenseReferenceDate(item),
            }));
            const aplicacoes = aplicacoesResult.error ? [] : aplicacoesResult.data ?? [];
            const metasPoupanca = metasPoupancaResult.error ? [] : metasPoupancaResult.data ?? [];

            const sumBetween = (rows: Array<{ valor: number; data: string }>, range: { start: string; end: string }) =>
                sumInRange(rows, range);

            setCurrentIncome(sumBetween(receitas, currentRange));
            setCurrentExpenses(sumBetween(despesasPorCompetencia, currentRange));
            setPreviousIncome(sumBetween(receitas, previousRange));
            setPreviousExpenses(sumBetween(despesasPorCompetencia, previousRange));
            setTotalInvestments(computeInvestmentsTotal(aplicacoes, metasPoupanca));
            setError(warnings.length > 0 ? warnings.join(" | ") : null);

            const months = Array.from({ length: 6 }, (_, index) => {
                const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
                const range = getMonthRange(date);
                return {
                    month: monthLabels[date.getMonth()],
                    entradas: sumBetween(receitas, range),
                    saidas: sumBetween(despesasPorCompetencia, range),
                };
            });
            setMonthlyCashFlow(months);

            const recent = [
                ...receitas.map((item) => ({
                    id: `receita-${item.id}`,
                    date: formatDate(item.data),
                    isoDate: item.data,
                    description: item.descricao,
                    category: "Receita",
                    value: Number(item.valor),
                    type: "entrada" as const,
                })),
                ...despesas.map((item) => {
                    const referenceDate = getExpenseReferenceDate(item);
                    return {
                        id: `despesa-${item.id}`,
                        date: formatDate(referenceDate),
                        isoDate: referenceDate,
                        description: item.descricao,
                        category: "Despesa",
                        value: Number(item.valor),
                        type: "saida" as const,
                    };
                }),
            ]
                .sort((a, b) => b.isoDate.localeCompare(a.isoDate))
                .slice(0, 40);

            setRecentTransactions(recent);
        } catch (err) {
            // Ignora AbortError (requisição cancelada por remount do componente)
            if (err instanceof Error && err.name === "AbortError") return;
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

    return useMemo(
        () => ({
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
        }),
        [
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
        ]
    );
}
