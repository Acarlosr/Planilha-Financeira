"use client";

import { Brain, Search, Star, TrendingDown, TrendingUp } from "lucide-react";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";

type Tone = "up" | "flat" | "down";

const formatCurrency = (value: number) => value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
});

const formatPercent = (value: number) => `${value.toFixed(0).replace(".", ",")}%`;

const getChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "novo" : "0%";
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? "+" : ""}${change.toFixed(1).replace(".", ",")}%`;
};

const getShare = (value: number, total: number) => total > 0 ? Math.round((value / total) * 100) : 0;

export default function MarketInsightRail() {
    const {
        currentIncome,
        currentExpenses,
        previousIncome,
        previousExpenses,
        totalInvestments,
        monthlyCashFlow,
        loading,
    } = useDashboardOverview();

    const saldo = currentIncome - currentExpenses;
    const previousSaldo = previousIncome - previousExpenses;
    const totalDistribution = currentIncome + currentExpenses + totalInvestments;
    const incomeShare = getShare(currentIncome, totalDistribution);
    const expenseShare = getShare(currentExpenses, totalDistribution);
    const investmentShare = getShare(totalInvestments, totalDistribution);
    const usage = currentIncome > 0 ? (currentExpenses / currentIncome) * 100 : 0;
    const healthLabel = saldo < 0 ? "Atenção" : usage >= 75 ? "Vigiar" : "Estável";
    const riskLabel = saldo < 0 ? "Alto" : usage >= 75 ? "Médio" : "Baixo";
    const forecastLabel = saldo > 0
        ? `${formatCurrency(saldo)} livre`
        : saldo < 0
            ? `${formatCurrency(Math.abs(saldo))} acima`
            : "sem saldo";
    const trendPath = monthlyCashFlow.length > 1
        ? monthlyCashFlow.map((item, index) => {
            const balance = item.entradas - item.saidas;
            const maxBalance = Math.max(1, ...monthlyCashFlow.map((row) => Math.abs(row.entradas - row.saidas)));
            const x = 4 + index * (232 / Math.max(monthlyCashFlow.length - 1, 1));
            const y = 48 - (balance / maxBalance) * 26;
            return `${index === 0 ? "M" : "L"}${x.toFixed(0)} ${Math.min(82, Math.max(14, y)).toFixed(0)}`;
        }).join(" ")
        : "M4 62 L56 54 L104 62 L152 50 L236 56";

    const watchlist = [
        { symbol: "SALDO", name: "Saldo do mês", value: loading ? "..." : formatCurrency(saldo), change: loading ? "calculando" : getChange(saldo, previousSaldo), tone: saldo >= 0 ? "up" as Tone : "down" as Tone, path: saldo >= 0 ? "M2 34 C18 25, 30 30, 44 19 S70 20, 88 14 S116 24, 142 12" : "M2 14 C18 16, 32 12, 48 20 S76 34, 94 28 S122 31, 142 38" },
        { symbol: "DESP", name: "Despesas", value: loading ? "..." : formatCurrency(currentExpenses), change: loading ? "calculando" : getChange(currentExpenses, previousExpenses), tone: currentExpenses > previousExpenses ? "down" as Tone : "flat" as Tone, path: "M2 18 C18 24, 28 12, 43 21 S68 43, 86 34 S118 28, 142 41" },
        { symbol: "INV", name: "Investimentos", value: loading ? "..." : formatCurrency(totalInvestments), change: totalInvestments > 0 ? "registrado" : "sem aporte", tone: totalInvestments > 0 ? "up" as Tone : "flat" as Tone, path: "M2 38 C20 35, 36 24, 52 30 S82 18, 98 22 S124 12, 142 16" },
    ];

    const sectors = [
        { label: "Receitas", value: formatPercent(incomeShare), color: "var(--success)", width: `${incomeShare}%` },
        { label: "Despesas", value: formatPercent(expenseShare), color: "var(--danger)", width: `${expenseShare}%` },
        { label: "Investimentos", value: formatPercent(investmentShare), color: "var(--secondary)", width: `${investmentShare}%` },
    ];

    return (
        <aside className="glass-card sticky top-20 hidden max-h-[calc(100vh-5.5rem)] overflow-y-auto p-4 xl:block">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-foreground">Insights</h2>
                    <p className="text-xs text-muted">Radar visual da sua rotina</p>
                </div>
                <button className="rounded-lg border p-2 text-muted" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
                    <Search size={16} />
                </button>
            </div>

            <div className="space-y-2.5">
                {watchlist.map((item) => {
                    const color = item.tone === "up" ? "var(--success)" : item.tone === "down" ? "var(--danger)" : "var(--accent)";
                    return (
                        <article key={item.symbol} className="rounded-lg border p-2.5" style={{ borderColor: "var(--card-border)", background: "rgba(255,255,255,0.035)" }}>
                            <div className="mb-2 flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold text-muted">{item.symbol}</p>
                                    <h3 className="text-sm font-bold text-foreground">{item.name}</h3>
                                </div>
                                <Star size={15} style={{ color: "var(--text-tertiary)" }} />
                            </div>
                            <div className="grid grid-cols-[1fr_86px] items-end gap-3">
                                <div>
                                    <p className="text-xl font-bold text-foreground">{item.value}</p>
                                    <p className="text-xs font-semibold" style={{ color }}>{item.change}</p>
                                </div>
                                <svg className="sparkline h-9 w-full" viewBox="0 0 144 48" fill="none" aria-hidden="true" style={{ color }}>
                                    <path d={item.path} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                            </div>
                        </article>
                    );
                })}
            </div>

            <div className="mt-3 rounded-lg border p-3" style={{ borderColor: "var(--card-border)", background: "rgba(255,255,255,0.035)" }}>
                <h3 className="mb-3 text-sm font-bold text-foreground">Distribuição</h3>
                <div className="space-y-3">
                    {sectors.map((sector) => (
                        <div key={sector.label}>
                            <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="text-muted">{sector.label}</span>
                                <span className="font-bold text-foreground">{sector.value}</span>
                            </div>
                            <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                                <div className="h-full rounded-full" style={{ width: sector.width, background: sector.color, boxShadow: `0 0 14px ${sector.color}` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-3 rounded-lg border p-3" style={{ borderColor: "var(--card-border)", background: "rgba(255,255,255,0.035)" }}>
                <div className="mb-2 flex items-center gap-2">
                    <Brain size={17} style={{ color: "var(--accent)" }} />
                    <h3 className="text-sm font-bold text-foreground">Previsão de caixa</h3>
                </div>
                <svg className="sparkline mb-2 h-16 w-full" viewBox="0 0 240 96" fill="none" aria-hidden="true">
                    <path d={trendPath} stroke={saldo >= 0 ? "var(--accent)" : "var(--danger)"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d={`${trendPath} L236 96 L4 96 Z`} fill={saldo >= 0 ? "color-mix(in srgb, var(--accent) 14%, transparent)" : "color-mix(in srgb, var(--danger) 14%, transparent)"} />
                </svg>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted">
                    <span>Próx. 7 dias</span>
                    <span className="text-right text-foreground">{loading ? "calculando" : forecastLabel}</span>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border p-2.5" style={{ borderColor: "var(--card-border)", background: "rgba(21,227,160,0.07)" }}>
                    <TrendingUp size={18} style={{ color: "var(--success)" }} />
                    <p className="mt-1 text-xs text-muted">Saúde</p>
                    <p className="font-bold text-foreground">{healthLabel}</p>
                </div>
                <div className="rounded-lg border p-2.5" style={{ borderColor: "var(--card-border)", background: "rgba(255,79,123,0.07)" }}>
                    <TrendingDown size={18} style={{ color: "var(--danger)" }} />
                    <p className="mt-1 text-xs text-muted">Risco</p>
                    <p className="font-bold text-foreground">{riskLabel}</p>
                </div>
            </div>
        </aside>
    );
}
