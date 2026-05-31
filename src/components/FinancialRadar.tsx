"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Bot, RefreshCw } from "lucide-react";

type RadarCategory = "cambio" | "commodities" | "acoes" | "fiis" | "cripto";
type RadarTone = "positive" | "negative" | "neutral" | "warning";

interface RadarInsight {
    id: string;
    title: string;
    summary: string;
    value: string;
    detail: string;
    category: RadarCategory;
    tone: RadarTone;
}

interface RadarPayload {
    updatedAt: string;
    disclaimer: string;
    insights: RadarInsight[];
}

const categoryLabel: Record<RadarCategory, string> = {
    cambio: "Câmbio",
    commodities: "Commodities",
    acoes: "Ações",
    fiis: "FIIs",
    cripto: "Cripto",
};

const toneStyles: Record<RadarTone, { color: string; bg: string; icon: React.ReactNode }> = {
    positive: {
        color: "var(--success)",
        bg: "color-mix(in srgb, var(--success) 10%, transparent)",
        icon: <ArrowUpRight size={16} />,
    },
    negative: {
        color: "var(--danger)",
        bg: "color-mix(in srgb, var(--danger) 10%, transparent)",
        icon: <ArrowDownRight size={16} />,
    },
    neutral: {
        color: "var(--accent)",
        bg: "color-mix(in srgb, var(--accent) 10%, transparent)",
        icon: <Activity size={16} />,
    },
    warning: {
        color: "var(--warning)",
        bg: "color-mix(in srgb, var(--warning) 10%, transparent)",
        icon: <AlertTriangle size={16} />,
    },
};

export default function FinancialRadar() {
    const [payload, setPayload] = useState<RadarPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadRadar = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("/api/market/radar");
            if (!response.ok) throw new Error("Não foi possível carregar o radar financeiro");
            const data = await response.json();
            setPayload(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar o radar");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRadar();
        const interval = window.setInterval(loadRadar, 180000);
        return () => window.clearInterval(interval);
    }, []);

    const insights = payload?.insights ?? [];

    return (
        <section className="mb-8 glass-card market-card overflow-hidden">
            <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between" style={{ borderColor: "var(--card-border)" }}>
                <div className="flex items-start gap-3">
                    <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }}
                    >
                        <Bot size={22} />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-bold text-foreground">Radar Financeiro Beta</h2>
                            <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ background: "var(--accent)" }}>
                                Agente
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-muted">
                            Leituras automáticas de dólar, petróleo, ações, FIIs e cripto com dados de mercado.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <p className="text-xs text-muted">
                        {payload?.updatedAt
                            ? `Atualizado ${new Date(payload.updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                            : "Aguardando atualização"}
                    </p>
                    <button
                        type="button"
                        onClick={loadRadar}
                        className="no-print flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-muted transition hover:text-foreground"
                        style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Atualizar
                    </button>
                </div>
            </div>

            <div className="p-5">
                {loading && insights.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted">Carregando radar financeiro...</div>
                )}

                {error && (
                    <div
                        className="mb-4 rounded-lg border p-4 text-sm"
                        style={{
                            borderColor: "color-mix(in srgb, var(--danger) 24%, transparent)",
                            background: "color-mix(in srgb, var(--danger) 8%, transparent)",
                            color: "var(--danger)",
                        }}
                    >
                        {error}
                    </div>
                )}

                {insights.length > 0 && (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {insights.slice(0, 12).map((insight) => {
                            const tone = toneStyles[insight.tone];
                            return (
                                <article
                                    key={insight.id}
                                    className="rounded-lg border p-4"
                                    style={{ borderColor: "var(--card-border)", background: "linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))" }}
                                >
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <span
                                            className="rounded-full px-2 py-1 text-xs font-semibold"
                                            style={{ background: tone.bg, color: tone.color }}
                                        >
                                            {categoryLabel[insight.category]}
                                        </span>
                                        <span className="flex items-center gap-1 text-sm font-bold" style={{ color: tone.color }}>
                                            {tone.icon}
                                            {insight.value}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground">{insight.title}</h3>
                                    <p className="mt-2 text-sm text-muted">{insight.summary}</p>
                                    <svg className="sparkline mt-3 h-10 w-full" viewBox="0 0 150 40" fill="none" aria-hidden="true" style={{ color: tone.color }}>
                                        <path d={insight.tone === "negative" ? "M2 9 C18 14, 32 8, 46 17 S73 31, 90 24 S120 27, 148 33" : "M2 31 C18 24, 32 28, 47 19 S76 11, 93 17 S121 8, 148 12"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                    </svg>
                                    <p className="mt-3 text-xs leading-relaxed text-muted">{insight.detail}</p>
                                </article>
                            );
                        })}
                    </div>
                )}

                <p className="mt-4 text-xs text-muted">
                    {payload?.disclaimer ?? "Conteúdo informativo. Não é recomendação de investimento."}
                </p>
            </div>
        </section>
    );
}
