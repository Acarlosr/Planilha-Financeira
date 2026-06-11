"use client";

import { TrendingUp, TrendingDown, Wallet, LineChart } from "lucide-react";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";

interface CardData {
    title: string;
    value: string;
    change: string;
    changeType: "positive" | "negative" | "neutral" | "investment";
    icon: React.ReactNode;
    iconBg: string;
    sparkColor: string;
    sparkPath: string;
    allocation?: string[];
}

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
    const { currentIncome, currentExpenses, previousIncome, previousExpenses, totalInvestments, loading, error, refetch } =
        useDashboardOverview();
    const saldo = currentIncome - currentExpenses;
    const previousSaldo = previousIncome - previousExpenses;

    const cards: CardData[] = [
        {
            title: "Receita do Mês",
            value: loading ? "Carregando..." : formatCurrency(currentIncome),
            change: loading ? "..." : formatChange(currentIncome, previousIncome),
            changeType: "positive",
            icon: <TrendingUp size={24} className="text-white" />,
            iconBg: "linear-gradient(135deg, #15e3a0 0%, #18f2e6 100%)",
            sparkColor: "#15e3a0",
            sparkPath: "M2 46 C22 32, 33 42, 48 27 S76 15, 96 22 S126 10, 150 16",
            allocation: ["42%", "28%", "18%", "12%"],
        },
        {
            title: "Despesas do Mês",
            value: loading ? "Carregando..." : formatCurrency(currentExpenses),
            change: loading ? "..." : formatChange(currentExpenses, previousExpenses),
            changeType: "negative",
            icon: <TrendingDown size={24} className="text-white" />,
            iconBg: "linear-gradient(135deg, #ff4f7b 0%, #ff8a5c 100%)",
            sparkColor: "#ff4f7b",
            sparkPath: "M2 18 C18 24, 28 12, 43 21 S68 43, 86 34 S118 28, 150 41",
            allocation: ["31%", "24%", "22%", "23%"],
        },
        {
            title: "Saldo do Mês",
            value: loading ? "Carregando..." : formatCurrency(saldo),
            change: loading ? "..." : formatChange(saldo, previousSaldo),
            changeType: saldo >= 0 ? "neutral" : "negative",
            icon: <Wallet size={24} className="text-white" />,
            iconBg: "linear-gradient(135deg, #7c5cff 0%, #18f2e6 100%)",
            sparkColor: "#18f2e6",
            sparkPath: "M2 36 C18 28, 34 32, 50 25 S78 26, 94 20 S122 30, 150 18",
            allocation: ["55%", "17%", "16%", "12%"],
        },
        {
            title: "Total Investido",
            value: loading ? "Carregando..." : formatCurrency(totalInvestments),
            change: "Dados reais",
            changeType: "investment",
            icon: <LineChart size={24} className="text-white" />,
            iconBg: "linear-gradient(135deg, #ffd52e 0%, #ff9f1c 100%)",
            sparkColor: "#ffd52e",
            sparkPath: "M2 42 C23 35, 34 12, 52 26 S82 33, 96 19 S120 9, 150 14",
            allocation: ["36%", "29%", "20%", "15%"],
        },
    ];

    if (error) {
        return (
            <div
                className="glass-card flex items-center justify-between gap-4 p-5"
                style={{ borderColor: "color-mix(in srgb, var(--danger) 35%, transparent)" }}
            >
                <p className="text-sm" style={{ color: "var(--danger)" }}>
                    Não foi possível carregar o resumo do mês: {error}
                </p>
                <button
                    onClick={() => refetch()}
                    className="shrink-0 rounded-lg border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-white/10"
                    style={{ borderColor: "var(--card-border)" }}
                >
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {cards.map((card, index) => (
                <div key={index} className="glass-card market-card p-5 cursor-pointer group">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-muted text-sm font-medium mb-1">{card.title}</p>
                            <h3 className="text-2xl font-bold text-foreground mb-2">{card.value}</h3>
                            <div className="flex items-center gap-1">
                                <span className={`text-sm font-semibold ${getChangeColor(card.changeType)}`}>{card.change}</span>
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

                    <svg className="sparkline mt-4 h-14 w-full" viewBox="0 0 152 56" fill="none" aria-hidden="true">
                        <path d={card.sparkPath} stroke={card.sparkColor} strokeWidth="3" strokeLinecap="round" />
                        <path d={`${card.sparkPath} L150 56 L2 56 Z`} fill={`color-mix(in srgb, ${card.sparkColor} 16%, transparent)`} />
                    </svg>

                    <div className="mt-3">
                        <div className="flex h-9 gap-1 overflow-hidden rounded-lg">
                            {(card.allocation ?? ["100%"]).map((width, partIndex) => (
                                <div
                                    key={partIndex}
                                    className="h-full rounded-sm transition-all duration-500"
                                    style={{
                                        width,
                                        background:
                                            partIndex === 0
                                                ? card.iconBg
                                                : partIndex === 1
                                                    ? "linear-gradient(135deg, rgba(255,213,46,0.92), rgba(255,159,28,0.82))"
                                                    : partIndex === 2
                                                        ? "linear-gradient(135deg, rgba(124,92,255,0.7), rgba(24,242,230,0.28))"
                                                        : "rgba(170,184,202,0.18)",
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
