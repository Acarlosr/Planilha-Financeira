"use client";

import { useEffect, useMemo, useState } from "react";

export interface MarketQuote {
    symbol: string;
    price: number | null;
    previousClose: number | null;
    change: number | null;
    changePercent: number | null;
    currency: string;
    marketTime: string | null;
    source: string;
    error?: string;
}

const normalizeSymbol = (symbol: string) => symbol.trim().toUpperCase().replace(/\.SA$/, "");

export function useMarketQuotes(symbols: string[]) {
    const [quotes, setQuotes] = useState<Record<string, MarketQuote>>({});
    const [updatedAt, setUpdatedAt] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const key = useMemo(() => {
        const unique = Array.from(new Set(symbols.map(normalizeSymbol).filter(Boolean)));
        return unique.sort().join(",");
    }, [symbols]);

    useEffect(() => {
        if (!key) {
            setQuotes({});
            setUpdatedAt(null);
            return;
        }

        let isMounted = true;

        async function loadQuotes() {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`/api/market/quote?symbols=${encodeURIComponent(key)}`);
                if (!response.ok) throw new Error("Nao foi possivel carregar as cotacoes");

                const payload: { quotes?: MarketQuote[]; updatedAt?: string } = await response.json();
                if (!isMounted) return;

                const nextQuotes = (payload.quotes ?? []).reduce<Record<string, MarketQuote>>((acc, quote) => {
                    acc[normalizeSymbol(quote.symbol)] = quote;
                    return acc;
                }, {});

                setQuotes(nextQuotes);
                setUpdatedAt(payload.updatedAt ?? new Date().toISOString());
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : "Erro ao carregar cotacoes");
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        loadQuotes();
        const interval = window.setInterval(loadQuotes, 60000);

        return () => {
            isMounted = false;
            window.clearInterval(interval);
        };
    }, [key]);

    return { quotes, updatedAt, loading, error };
}
