import { NextResponse } from "next/server";

const allowedCurrencies = new Set(["brl", "usd"]);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const requestedCurrency = searchParams.get("currency")?.toLowerCase() ?? "brl";
    const currency = allowedCurrencies.has(requestedCurrency) ? requestedCurrency : "brl";

    try {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=1h,24h,7d,30d&locale=pt`,
            { next: { revalidate: 60 } }
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
        return NextResponse.json(
            {
                source: "CoinGecko",
                updatedAt: new Date().toISOString(),
                currency,
                coins: [],
                error: error instanceof Error ? error.message : "Erro ao carregar mercado cripto",
            },
            { status: 502 }
        );
    }
}
