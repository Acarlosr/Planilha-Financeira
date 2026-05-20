import { NextResponse } from "next/server";

type RadarCategory = "cambio" | "commodities" | "acoes" | "fiis";
type RadarTone = "positive" | "negative" | "neutral" | "warning";

interface RadarAsset {
    label: string;
    symbol: string;
    yahooSymbol: string;
    category: RadarCategory;
    currency: "BRL" | "USD";
    sector?: string;
}

interface RadarQuote extends RadarAsset {
    price: number | null;
    previousClose: number | null;
    changePercent: number | null;
    marketTime: string | null;
    source: string;
    error?: string;
}

interface RadarInsight {
    id: string;
    title: string;
    summary: string;
    value: string;
    detail: string;
    category: RadarCategory;
    tone: RadarTone;
}

const assets: RadarAsset[] = [
    { label: "Dólar comercial", symbol: "USDBRL", yahooSymbol: "USDBRL=X", category: "cambio", currency: "BRL" },
    { label: "Petróleo WTI", symbol: "WTI", yahooSymbol: "CL=F", category: "commodities", currency: "USD" },
    { label: "Petróleo Brent", symbol: "BRENT", yahooSymbol: "BZ=F", category: "commodities", currency: "USD" },
    { label: "Petrobras PN", symbol: "PETR4", yahooSymbol: "PETR4.SA", category: "acoes", currency: "BRL", sector: "Petróleo" },
    { label: "Vale ON", symbol: "VALE3", yahooSymbol: "VALE3.SA", category: "acoes", currency: "BRL", sector: "Mineração" },
    { label: "HGLG11", symbol: "HGLG11", yahooSymbol: "HGLG11.SA", category: "fiis", currency: "BRL", sector: "Logística" },
    { label: "VISC11", symbol: "VISC11", yahooSymbol: "VISC11.SA", category: "fiis", currency: "BRL", sector: "Shopping" },
    { label: "RZAG11", symbol: "RZAG11", yahooSymbol: "RZAG11.SA", category: "fiis", currency: "BRL", sector: "Agro" },
    { label: "MXRF11", symbol: "MXRF11", yahooSymbol: "MXRF11.SA", category: "fiis", currency: "BRL", sector: "Papel" },
];

const formatCurrency = (value: number | null, currency: "BRL" | "USD") => {
    if (value === null) return "Indisponível";
    return value.toLocaleString(currency === "BRL" ? "pt-BR" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "BRL" ? 2 : 2,
    });
};

const formatPercent = (value: number | null) => {
    if (value === null) return "variação indisponível";
    return `${value >= 0 ? "+" : ""}${value.toFixed(2).replace(".", ",")}%`;
};

const getTone = (changePercent: number | null): RadarTone => {
    if (changePercent === null) return "neutral";
    if (changePercent >= 1.5) return "positive";
    if (changePercent <= -1.5) return "negative";
    return "neutral";
};

const fetchRadarQuote = async (asset: RadarAsset): Promise<RadarQuote> => {
    try {
        const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(asset.yahooSymbol)}?range=1d&interval=1d`,
            { next: { revalidate: 180 } }
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        const meta = data?.chart?.result?.[0]?.meta;
        if (!meta) throw new Error("Cotacao indisponivel");

        const price = Number(meta.regularMarketPrice ?? meta.previousClose ?? 0) || null;
        const previousClose = Number(meta.previousClose ?? meta.chartPreviousClose ?? 0) || null;
        const changePercent = price !== null && previousClose
            ? ((price - previousClose) / previousClose) * 100
            : null;

        return {
            ...asset,
            price,
            previousClose,
            changePercent,
            marketTime: meta.regularMarketTime ? new Date(Number(meta.regularMarketTime) * 1000).toISOString() : null,
            source: "Yahoo Finance",
        };
    } catch (error) {
        return {
            ...asset,
            price: null,
            previousClose: null,
            changePercent: null,
            marketTime: null,
            source: "Fallback local",
            error: error instanceof Error ? error.message : "Erro ao buscar cotacao",
        };
    }
};

const buildInsight = (quote: RadarQuote): RadarInsight => {
    const variation = formatPercent(quote.changePercent);
    const movement = quote.changePercent === null
        ? "está com preço disponível, mas sem variação confiável da fonte"
        : `${quote.changePercent >= 0 ? "subiu" : "caiu"} ${variation}`;

    if (quote.category === "cambio") {
        return {
            id: quote.symbol,
            title: "Dólar em acompanhamento",
            summary: `O dólar ${movement} no último fechamento acompanhado.`,
            value: formatCurrency(quote.price, quote.currency),
            detail: "Pode afetar compras internacionais, cripto, viagens e empresas expostas ao câmbio.",
            category: quote.category,
            tone: getTone(quote.changePercent),
        };
    }

    if (quote.category === "commodities") {
        return {
            id: quote.symbol,
            title: quote.label,
            summary: `${quote.label} ${movement}.`,
            value: formatCurrency(quote.price, quote.currency),
            detail: "Movimento pode influenciar empresas ligadas a petróleo, energia e custos globais.",
            category: quote.category,
            tone: getTone(quote.changePercent),
        };
    }

    if (quote.category === "acoes") {
        return {
            id: quote.symbol,
            title: `${quote.label} (${quote.symbol})`,
            summary: `${quote.symbol} ${movement}.`,
            value: formatCurrency(quote.price, quote.currency),
            detail: quote.sector === "Petróleo"
                ? "Observe junto com petróleo e dólar antes de tirar conclusões sobre o ativo."
                : "Acompanhe fundamentos, setor e cenário macro antes de qualquer decisão.",
            category: quote.category,
            tone: getTone(quote.changePercent),
        };
    }

    return {
        id: quote.symbol,
        title: `${quote.symbol} - FII ${quote.sector}`,
        summary: `${quote.symbol} ${movement}.`,
        value: formatCurrency(quote.price, quote.currency),
        detail: `FII do segmento ${quote.sector}. Use como alerta de acompanhamento, não como recomendação.`,
        category: quote.category,
        tone: getTone(quote.changePercent),
    };
};

export async function GET() {
    const quotes = await Promise.all(assets.map(fetchRadarQuote));
    const insights = quotes
        .map(buildInsight)
        .sort((a, b) => {
            const order: Record<RadarCategory, number> = { cambio: 0, commodities: 1, acoes: 2, fiis: 3 };
            return order[a.category] - order[b.category];
        });

    return NextResponse.json({
        updatedAt: new Date().toISOString(),
        disclaimer: "Conteudo informativo. Nao e recomendacao de investimento.",
        quotes,
        insights,
    });
}
