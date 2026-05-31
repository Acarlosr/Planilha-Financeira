"use client";

import { Brain, Search, Star, TrendingDown, TrendingUp } from "lucide-react";

const watchlist = [
    { symbol: "SALDO", name: "Saldo do mês", value: "R$ 0,00", change: "+0,0%", tone: "up", path: "M2 34 C18 25, 30 30, 44 19 S70 20, 88 14 S116 24, 142 12" },
    { symbol: "FAT", name: "Faturas", value: "0", change: "15 dias", tone: "flat", path: "M2 26 C20 22, 34 27, 50 25 S78 19, 96 25 S120 28, 142 22" },
    { symbol: "BOL", name: "Boletos", value: "0", change: "em aberto", tone: "down", path: "M2 14 C18 16, 32 12, 48 20 S76 34, 94 28 S122 31, 142 38" },
];

const sectors = [
    { label: "Receitas", value: "42%", color: "var(--success)", width: "42%" },
    { label: "Despesas", value: "28%", color: "var(--danger)", width: "28%" },
    { label: "Investimentos", value: "18%", color: "var(--secondary)", width: "18%" },
];

export default function MarketInsightRail() {
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
                    <path d="M4 70 C26 62, 40 74, 58 50 S96 40, 116 58 S154 82, 178 46 S214 27, 236 34" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
                    <path d="M4 70 C26 62, 40 74, 58 50 S96 40, 116 58 S154 82, 178 46 S214 27, 236 34 L236 96 L4 96 Z" fill="color-mix(in srgb, var(--accent) 14%, transparent)" />
                </svg>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted">
                    <span>Próx. 7 dias</span>
                    <span className="text-right text-foreground">monitorando</span>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border p-2.5" style={{ borderColor: "var(--card-border)", background: "rgba(21,227,160,0.07)" }}>
                    <TrendingUp size={18} style={{ color: "var(--success)" }} />
                    <p className="mt-1 text-xs text-muted">Saúde</p>
                    <p className="font-bold text-foreground">Estável</p>
                </div>
                <div className="rounded-lg border p-2.5" style={{ borderColor: "var(--card-border)", background: "rgba(255,79,123,0.07)" }}>
                    <TrendingDown size={18} style={{ color: "var(--danger)" }} />
                    <p className="mt-1 text-xs text-muted">Risco</p>
                    <p className="font-bold text-foreground">Baixo</p>
                </div>
            </div>
        </aside>
    );
}
