import { describe, it, expect } from "vitest";
import {
    extrairTrades,
    extrairTaxasTotais,
    extrairDataPregao,
    alocarTaxas,
    classificarTicker,
    parseNotaCorretagem,
} from "./importarNotaCorretagem";

const notaExemplo = `
NOTA DE CORRETAGEM
Nr. nota 123456   Data pregão 15/01/2026
1-BOVESPA C VISTA PETR4 PETROBRAS PN N2 100 28,50 2.850,00 D
1-BOVESPA V VISTA VALE3 VALE ON NM 50 68,32 3.416,00 C
1-BOVESPA C VISTA HGLG11 CSHG LOGISTICA FII 20 165,40 3.308,00 D

Resumo dos Negócios
Taxa de liquidação                 1,23
Taxa de Registro B3                0,45
Emolumentos                        2,10
Corretagem                         0,00
`;

describe("extrairTrades", () => {
    it("reconhece compras e vendas com ticker, quantidade, preço e valor", () => {
        const trades = extrairTrades(notaExemplo);
        expect(trades).toHaveLength(3);

        expect(trades[0]).toMatchObject({
            tipoOperacao: "compra",
            ticker: "PETR4",
            quantidade: 100,
            precoUnitario: 28.5,
            valorOperacao: 2850,
        });

        expect(trades[1]).toMatchObject({
            tipoOperacao: "venda",
            ticker: "VALE3",
            quantidade: 50,
            precoUnitario: 68.32,
            valorOperacao: 3416,
        });

        expect(trades[2]).toMatchObject({
            tipoOperacao: "compra",
            ticker: "HGLG11",
            quantidade: 20,
            precoUnitario: 165.4,
            valorOperacao: 3308,
        });
    });

    it("retorna vazio para texto sem linhas de negociação", () => {
        expect(extrairTrades("nada relevante aqui")).toEqual([]);
    });
});

describe("extrairTaxasTotais", () => {
    it("soma taxa de liquidação, registro, emolumentos e corretagem", () => {
        expect(extrairTaxasTotais(notaExemplo)).toBeCloseTo(1.23 + 0.45 + 2.1 + 0);
    });

    it("retorna 0 quando não há linhas de taxa", () => {
        expect(extrairTaxasTotais("sem nada de taxas aqui")).toBe(0);
    });
});

describe("extrairDataPregao", () => {
    it("acha a data do pregão e converte pra ISO", () => {
        expect(extrairDataPregao(notaExemplo)).toBe("2026-01-15");
    });

    it("retorna null se não achar", () => {
        expect(extrairDataPregao("sem data aqui")).toBeNull();
    });
});

describe("alocarTaxas", () => {
    it("distribui proporcionalmente ao valor de cada trade", () => {
        const trades = [
            { tipoOperacao: "compra" as const, ticker: "A", quantidade: 1, precoUnitario: 100, valorOperacao: 100, taxaAlocada: 0 },
            { tipoOperacao: "compra" as const, ticker: "B", quantidade: 1, precoUnitario: 300, valorOperacao: 300, taxaAlocada: 0 },
        ];
        const resultado = alocarTaxas(trades, 4);
        expect(resultado[0].taxaAlocada).toBeCloseTo(1);
        expect(resultado[1].taxaAlocada).toBeCloseTo(3);
    });

    it("não altera nada se não houver taxas", () => {
        const trades = [{ tipoOperacao: "compra" as const, ticker: "A", quantidade: 1, precoUnitario: 100, valorOperacao: 100, taxaAlocada: 0 }];
        expect(alocarTaxas(trades, 0)).toEqual(trades);
    });
});

describe("classificarTicker", () => {
    it("classifica tickers terminados em 11 como FII", () => {
        expect(classificarTicker("HGLG11")).toBe("fii");
        expect(classificarTicker("MXRF11")).toBe("fii");
    });

    it("classifica os demais como ação", () => {
        expect(classificarTicker("PETR4")).toBe("acao");
        expect(classificarTicker("VALE3")).toBe("acao");
    });
});

describe("parseNotaCorretagem", () => {
    it("orquestra extração de trades, data e taxas alocadas", () => {
        const resultado = parseNotaCorretagem(notaExemplo);
        expect(resultado.dataPregao).toBe("2026-01-15");
        expect(resultado.trades).toHaveLength(3);
        const somaTaxas = resultado.trades.reduce((acc, t) => acc + t.taxaAlocada, 0);
        expect(somaTaxas).toBeCloseTo(3.78, 1);
    });
});
