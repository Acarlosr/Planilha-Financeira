// Parser genérico de nota de corretagem (texto já extraído de um PDF).
// Layout varia muito entre corretoras — este parser é "melhor esforço":
// reconhece o padrão mais comum de linha de negociação e deixa tudo
// editável numa tela de revisão antes de gravar qualquer coisa.

export interface TradeExtraido {
    tipoOperacao: "compra" | "venda";
    ticker: string;
    quantidade: number;
    precoUnitario: number;
    valorOperacao: number;
    taxaAlocada: number;
}

/** Linha típica: "C VISTA PETR4 PETROBRAS PN N2 100 28,50 2.850,00 D" (ou "V" pra venda). */
const REGEX_TRADE =
    /\b([CV])\s+VISTA\s+([A-Z]{4}\d{1,2})\s+[A-ZÀ-Ú0-9 .\/]{0,40}?\s(\d{1,3}(?:\.\d{3})*)\s+([\d.,]+)\s+([\d.,]+)\s*[DC]?\b/g;

const parseNumeroBR = (bruto: string): number => {
    const limpo = bruto.replace(/\./g, "").replace(",", ".");
    return parseFloat(limpo);
};

/** Extrai as linhas de negociação (compra/venda) do texto bruto da nota. */
export function extrairTrades(texto: string): TradeExtraido[] {
    const trades: TradeExtraido[] = [];
    const regex = new RegExp(REGEX_TRADE);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(texto)) !== null) {
        const [, cv, ticker, quantidadeBruta, precoBruto, valorBruto] = match;
        const quantidade = parseNumeroBR(quantidadeBruta);
        const precoUnitario = parseNumeroBR(precoBruto);
        const valorOperacao = parseNumeroBR(valorBruto);

        if (isNaN(quantidade) || isNaN(precoUnitario) || isNaN(valorOperacao) || quantidade <= 0) continue;

        trades.push({
            tipoOperacao: cv === "C" ? "compra" : "venda",
            ticker,
            quantidade,
            precoUnitario,
            valorOperacao,
            taxaAlocada: 0,
        });
    }

    return trades;
}

const ROTULOS_TAXA = [
    /taxa de liquida[cç][aã]o/i,
    /taxa de registro/i,
    /emolumentos/i,
    /corretagem/i,
    /taxa a\.n\.a/i,
    /iss/i,
    /outras/i,
];

/** Soma os valores das linhas de taxas/emolumentos/corretagem da nota. */
export function extrairTaxasTotais(texto: string): number {
    const linhas = texto.split(/\r\n|\r|\n/);
    let total = 0;

    for (const linha of linhas) {
        const ehLinhaDeTaxa = ROTULOS_TAXA.some((padrao) => padrao.test(linha));
        if (!ehLinhaDeTaxa) continue;

        const valores = linha.match(/-?\d{1,3}(?:\.\d{3})*,\d{2}/g);
        if (!valores || valores.length === 0) continue;

        const ultimoValor = parseNumeroBR(valores[valores.length - 1]);
        if (!isNaN(ultimoValor)) total += ultimoValor;
    }

    return Math.round(total * 100) / 100;
}

/** Procura "Data pregão" (ou variações) no texto e devolve em yyyy-mm-dd. */
export function extrairDataPregao(texto: string): string | null {
    const match = texto.match(/data\s+(?:do\s+)?preg[aã]o[:\s]*([0-3]?\d)\/([01]?\d)\/(\d{4})/i);
    if (!match) return null;
    const [, dia, mes, ano] = match;
    return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
}

/** Distribui o total de taxas entre os trades, proporcionalmente ao valor de cada operação. */
export function alocarTaxas(trades: TradeExtraido[], taxasTotais: number): TradeExtraido[] {
    const somaValores = trades.reduce((acc, t) => acc + t.valorOperacao, 0);
    if (somaValores <= 0 || taxasTotais === 0) return trades;

    return trades.map((t) => ({
        ...t,
        taxaAlocada: Math.round((taxasTotais * (t.valorOperacao / somaValores)) * 100) / 100,
    }));
}

/** Heurística: tickers terminados em "11" costumam ser FIIs (nem sempre — units de ações também usam "11"). */
export function classificarTicker(ticker: string): "acao" | "fii" {
    return /11$/.test(ticker) ? "fii" : "acao";
}

export interface NotaCorretagemParseada {
    dataPregao: string | null;
    trades: TradeExtraido[];
}

/** Orquestra a extração completa: trades + taxas alocadas + data do pregão. */
export function parseNotaCorretagem(texto: string): NotaCorretagemParseada {
    const trades = extrairTrades(texto);
    const taxasTotais = extrairTaxasTotais(texto);
    const dataPregao = extrairDataPregao(texto);

    return {
        dataPregao,
        trades: alocarTaxas(trades, taxasTotais),
    };
}
