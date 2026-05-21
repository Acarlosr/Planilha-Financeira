"use client";

import { TrendingUp, TrendingDown, Wallet, LineChart } from "lucide-react";
import { poupancaData, aplicacaoData } from "@/constants/financialData";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";

interface CardData {
    title: string;
    value: string;
    change: string;
    changeType: "positive" | "negative" | "neutral" | "investment";
    icon: React.ReactNode;
    iconBg: string;
    progressColor: string;
}

// Calculate totals from shared data
const totalPoupanca = poupancaData.metas.reduce((sum, m) => sum + m.valorAtual, 0);
const totalAplicacao = aplicacaoData.tipos.reduce((sum, t) => sum + t.saldo, 0);
const totalCripto = 0;
const totalInvestimentos = totalPoupanca + totalAplicacao + totalCripto;

const formatCurrency = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "Novo" : "0%";
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? "+" : ""}${change.toFixed(1).replace(".", ",")}%`;
};

const getChangeColor = (type: CardData["changeType"]) => {
    switch (type) {
        case "positive":
            return "text-emerald-600";
        case "negative":
            return "text-red-400";
        case "neutral":
            return "text-blue-700";
        case "investment":
            return "text-amber-600";
        default:
            return "text-gray-400";
    }
};

const getShadowColor = (type: CardData["changeType"]) => {
    switch (type) {
        case "positive":
            return "rgba(34, 197, 94, 0.18)";
        case "negative":
            return "rgba(217, 77, 77, 0.18)";
        case "neutral":
            return "rgba(37, 99, 235, 0.16)";
        case "investment":
            return "rgba(245, 158, 11, 0.2)";
        default:
            return "rgba(0, 0, 0, 0.1)";
    }
};

export default function SummaryCards() {
    const { currentIncome, currentExpenses, previousIncome, previousExpenses, loading } = useDashboardOverview();
    const saldo = currentIncome - currentExpenses;
    const previousSaldo = previousIncome - previousExpenses;
    const cards: CardData[] = [
        {
            title: "Receita do Mês",
            value: loading ? "Carregando..." : formatCurrency(currentIncome),
            change: loading ? "..." : formatChange(currentIncome, previousIncome),
            changeType: "positive",
            icon: <TrendingUp size={24} className="text-white" />,
            iconBg: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            progressColor: "#22c55e",
        },
        {
            title: "Despesas do Mês",
            value: loading ? "Carregando..." : formatCurrency(currentExpenses),
            change: loading ? "..." : formatChange(currentExpenses, previousExpenses),
            changeType: "negative",
            icon: <TrendingDown size={24} className="text-white" />,
            iconBg: "linear-gradient(135deg, #d94d4d 0%, #e97979 100%)",
            progressColor: "#d94d4d",
        },
        {
            title: "Saldo do Mês",
            value: loading ? "Carregando..." : formatCurrency(saldo),
            change: loading ? "..." : formatChange(saldo, previousSaldo),
            changeType: saldo >= 0 ? "neutral" : "negative",
            icon: <Wallet size={24} className="text-white" />,
            iconBg: "linear-gradient(135deg, #17145f 0%, #2563eb 100%)",
            progressColor: "#2563eb",
        },
        {
            title: "Total Investido",
            value: totalInvestimentos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            change: "0%",
            changeType: "investment",
            icon: <LineChart size={24} className="text-white" />,
            iconBg: "linear-gradient(135deg, #f59e0b 0%, #ffbf47 100%)",
            progressColor: "#f59e0b",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="glass-card p-5 cursor-pointer group"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-muted text-sm font-medium mb-1">
                                {card.title}
                            </p>
                            <h3 className="text-xl font-bold text-foreground mb-2">
                                {card.value}
                            </h3>
                            <div className="flex items-center gap-1">
                                <span className={`text-sm font-semibold ${getChangeColor(card.changeType)}`}>
                                    {card.change}
                                </span>
                                <span className="text-muted text-xs">vs mês</span>
                            </div>
                        </div>
                        <div
                            className="w-11 h-11 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shrink-0"
                            style={{
                                background: card.iconBg,
                                boxShadow: `0 8px 20px ${getShadowColor(card.changeType)}`,
                            }}
                        >
                            {card.icon}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: index === 0 ? "75%" : index === 1 ? "40%" : index === 2 ? "85%" : "70%",
                                    background: card.iconBg,
                                }}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
