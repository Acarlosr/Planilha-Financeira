import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

const fetchWithTimeout = async (url: string, timeoutMs = 8000, options?: RequestInit) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
};

const fetchQuote = async (symbol: string): Promise<QuoteResponse> => {
    const normalized = normalizeSymbol(symbol);

    try {
        const response = await fetchWithTimeout(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(toYahooSymbol(symbol))}?range=1d&interval=1d`,
            8000,
            { next: { revalidate: 60 } } as RequestInit
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) throw new Error("Cotacao indisponivel");

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
        const message = error instanceof Error
            ? (error.name === "AbortError" ? "Timeout ao buscar cotação" : error.message)
            : "Erro ao buscar cotacao";
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
    // Verificar autenticação
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
