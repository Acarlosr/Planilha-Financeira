import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const allowedCurrencies = new Set(["brl", "usd"]);

const fetchWithTimeout = async (url: string, timeoutMs = 8000, options?: RequestInit) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
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
    const requestedCurrency = searchParams.get("currency")?.toLowerCase() ?? "brl";
    const currency = allowedCurrencies.has(requestedCurrency) ? requestedCurrency : "brl";

    try {
        const response = await fetchWithTimeout(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=1h,24h,7d,30d&locale=pt`,
            8000,
            { next: { revalidate: 60 } } as RequestInit
        );

        if (!response.ok) {
            throw new Error(`CoinGecko HTTP ${response.status}`);
        }

        const coins = await response.json();

        return NextResponse.json({
            source: "CoinGecko",
            updatedAt: new Date().toISOString(),
            currency,
            coins,
        });
    } catch (error) {
        const message = error instanceof Error
            ? (error.name === "AbortError" ? "Timeout ao conectar com CoinGecko" : error.message)
            : "Erro ao carregar mercado cripto";

        return NextResponse.json(
            { source: "CoinGecko", updatedAt: new Date().toISOString(), currency, coins: [], error: message },
            { status: 502 }
        );
    }
}
