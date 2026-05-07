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
            return "text-emerald-400";
        case "negative":
            return "text-red-400";
        case "neutral":
            return "text-cyan-400";
        case "investment":
            return "text-blue-400";
        default:
            return "text-gray-400";
    }
};

const getShadowColor = (type: CardData["changeType"]) => {
    switch (type) {
        case "positive":
            return "rgba(16, 185, 129, 0.3)";
        case "negative":
            return "rgba(239, 68, 68, 0.3)";
        case "neutral":
            return "rgba(56, 189, 248, 0.3)";
        case "investment":
            return "rgba(59, 130, 246, 0.3)";
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
            iconBg: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
            progressColor: "#10B981",
        },
        {
            title: "Despesas do Mês",
            value: loading ? "Carregando..." : formatCurrency(currentExpenses),
            change: loading ? "..." : formatChange(currentExpenses, previousExpenses),
            changeType: "negative",
            icon: <TrendingDown size={24} className="text-white" />,
            iconBg: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
            progressColor: "#EF4444",
        },
        {
            title: "Saldo do Mês",
            value: loading ? "Carregando..." : formatCurrency(saldo),
            change: loading ? "..." : formatChange(saldo, previousSaldo),
            changeType: saldo >= 0 ? "neutral" : "negative",
            icon: <Wallet size={24} className="text-white" />,
            iconBg: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
            progressColor: "#7CFF6B",
        },
        {
            title: "Total Investido",
            value: totalInvestimentos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            change: "+5,4%",
            changeType: "investment",
            icon: <LineChart size={24} className="text-white" />,
            iconBg: "linear-gradient(135deg, #FFD700 0%, #FFC700 100%)",
            progressColor: "#3b82f6",
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
                            className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shrink-0"
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
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
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
