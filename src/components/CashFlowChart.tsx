"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        dataKey: string;
        color: string;
    }>;
    label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        return (
            <div
                className="p-4 rounded-xl border border-white/20"
                style={{
                    background: "var(--card-bg-solid)",
                    color: "var(--foreground)",
                    backdropFilter: "blur(10px)",
                    boxShadow: "var(--shadow-glass)",
                }}
            >
                <p className="font-semibold text-foreground mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        <span className="font-medium">
                            {entry.dataKey === "entradas" ? "Entradas" : "Saídas"}:
                        </span>{" "}
                        R$ {entry.value.toLocaleString("pt-BR")}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function CashFlowChart() {
    const { monthlyCashFlow, loading } = useDashboardOverview();
    const data = monthlyCashFlow.length > 0 ? monthlyCashFlow : [{ month: "Atual", entradas: 0, saidas: 0 }];

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Fluxo de Caixa</h2>
                    <p className="text-muted text-sm">Evolução mensal de entradas e saídas</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: "var(--success)" }} />
                        <span className="text-sm text-muted">Entradas</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: "var(--danger)" }} />
                        <span className="text-sm text-muted">Saídas</span>
                    </div>
                </div>
            </div>

            <div className="h-[350px] w-full">
                {loading ? (
                    <div className="flex h-full items-center justify-center text-muted">
                        Carregando fluxo de caixa...
                    </div>
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#54E0FF" stopOpacity={0.28} />
                                <stop offset="95%" stopColor="#54E0FF" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#d94d4d" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#d94d4d" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255, 255, 255, 0.1)"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#94a3b8", fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#94a3b8", fontSize: 12 }}
                            tickFormatter={(value) => `${value / 1000}k`}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="entradas"
                            stroke="#54E0FF"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorEntradas)"
                        />
                        <Area
                            type="monotone"
                            dataKey="saidas"
                            stroke="#d94d4d"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorSaidas)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
