"use client";

import { TrendingUp, TrendingDown, Wallet, LineChart, PiggyBank } from "lucide-react";

interface CardData {
    title: string;
    value: string;
    change: string;
    changeType: "positive" | "negative" | "neutral" | "investment" | "savings";
    icon: React.ReactNode;
    iconBg: string;
    progressWidth: string;
}

const cards: CardData[] = [
    {
        title: "Receita Total",
        value: "R$ 24.580,00",
        change: "+12,5%",
        changeType: "positive",
        icon: <TrendingUp size={24} className="text-white" />,
        iconBg: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
        progressWidth: "75%",
    },
    {
        title: "Despesas",
        value: "R$ 8.320,00",
        change: "+3,2%",
        changeType: "negative",
        icon: <TrendingDown size={24} className="text-white" />,
        iconBg: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
        progressWidth: "40%",
    },
    {
        title: "Saldo",
        value: "R$ 16.260,00",
        change: "+18,3%",
        changeType: "neutral",
        icon: <Wallet size={24} className="text-white" />,
        iconBg: "linear-gradient(135deg, #A855F7 0%, #C084FC 100%)",
        progressWidth: "85%",
    },
    {
        title: "Aplicação",
        value: "R$ 45.800,00",
        change: "+8,7%",
        changeType: "investment",
        icon: <LineChart size={24} className="text-white" />,
        iconBg: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
        progressWidth: "65%",
    },
    {
        title: "Poupança",
        value: "R$ 12.450,00",
        change: "+2,1%",
        changeType: "savings",
        icon: <PiggyBank size={24} className="text-white" />,
        iconBg: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
        progressWidth: "55%",
    },
];

const getChangeColor = (type: CardData["changeType"]) => {
    switch (type) {
        case "positive":
            return "text-emerald-500";
        case "negative":
            return "text-red-500";
        case "neutral":
            return "text-purple-500";
        case "investment":
            return "text-blue-500";
        case "savings":
            return "text-amber-500";
        default:
            return "text-gray-500";
    }
};

const getShadowColor = (type: CardData["changeType"]) => {
    switch (type) {
        case "positive":
            return "rgba(16, 185, 129, 0.3)";
        case "negative":
            return "rgba(239, 68, 68, 0.3)";
        case "neutral":
            return "rgba(168, 85, 247, 0.3)";
        case "investment":
            return "rgba(59, 130, 246, 0.3)";
        case "savings":
            return "rgba(245, 158, 11, 0.3)";
        default:
            return "rgba(0, 0, 0, 0.1)";
    }
};

export default function SummaryCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className="soft-card p-5 cursor-pointer group"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <p className="text-gray-500 text-sm font-medium mb-1">
                                {card.title}
                            </p>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                {card.value}
                            </h3>
                            <div className="flex items-center gap-1">
                                <span className={`text-sm font-semibold ${getChangeColor(card.changeType)}`}>
                                    {card.change}
                                </span>
                                <span className="text-gray-400 text-xs">vs mês</span>
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
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: card.progressWidth,
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
