import { NextResponse } from "next/server";

interface QuoteResponse {
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

const toYahooSymbol = (symbol: string) => {
    const normalized = normalizeSymbol(symbol);
    if (normalized.includes("=") || normalized.includes("^") || normalized.includes(".")) {
        return normalized;
    }
    return `${normalized}.SA`;
};

const fetchQuote = async (symbol: string): Promise<QuoteResponse> => {
    const normalized = normalizeSymbol(symbol);

    try {
        const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(toYahooSymbol(symbol))}?range=1d&interval=1d`,
            { next: { revalidate: 60 } }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) {
            throw new Error("Cotacao indisponivel");
        }

        const price = Number(meta.regularMarketPrice ?? meta.previousClose ?? 0) || null;
        const previousClose = Number(meta.previousClose ?? meta.chartPreviousClose ?? 0) || null;
        const change = price !== null && previousClose !== null ? price - previousClose : null;
        const changePercent = change !== null && previousClose ? (change / previousClose) * 100 : null;
        const marketTime = meta.regularMarketTime
            ? new Date(Number(meta.regularMarketTime) * 1000).toISOString()
            : null;

        return {
            symbol: normalized,
            price,
            previousClose,
            change,
            changePercent,
            currency: meta.currency ?? "BRL",
            marketTime,
            source: "Yahoo Finance",
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao buscar cotacao";
        return {
            symbol: normalized,
            price: null,
            previousClose: null,
            change: null,
            changePercent: null,
            currency: "BRL",
            marketTime: null,
            source: "Fallback local",
            error: message,
        };
    }
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbols = (searchParams.get("symbols") ?? "")
        .split(",")
        .map(normalizeSymbol)
        .filter(Boolean)
        .slice(0, 20);

    if (symbols.length === 0) {
        return NextResponse.json({ quotes: [], updatedAt: new Date().toISOString() });
    }

    const quotes = await Promise.all(symbols.map(fetchQuote));
    return NextResponse.json({ quotes, updatedAt: new Date().toISOString() });
}
