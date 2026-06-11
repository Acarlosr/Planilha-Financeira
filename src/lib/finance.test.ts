import { describe, it, expect } from "vitest";
import {
    getMonthRange,
    sumInRange,
    computeInvestmentsTotal,
    percentChange,
    formatCurrency,
} from "./finance";

describe("getMonthRange", () => {
    it("retorna início no dia 1 e fim no primeiro dia do mês seguinte", () => {
        const range = getMonthRange(new Date(2026, 1, 15)); // fevereiro/2026
        expect(range.start).toBe("2026-02-01");
        expect(range.end).toBe("2026-03-01");
    });

    it("trata a virada de ano corretamente", () => {
        const range = getMonthRange(new Date(2026, 11, 10)); // dezembro/2026
        expect(range.start).toBe("2026-12-01");
        expect(range.end).toBe("2027-01-01");
    });
});

describe("sumInRange", () => {
    const rows = [
        { valor: 100, data: "2026-02-01" },
        { valor: 50, data: "2026-02-28" },
        { valor: 999, data: "2026-03-01" }, // fora (fim é exclusivo)
        { valor: 10, data: "2026-01-31" }, // fora (antes do início)
    ];

    it("soma apenas valores dentro do intervalo [start, end)", () => {
        const range = getMonthRange(new Date(2026, 1, 10));
        expect(sumInRange(rows, range)).toBe(150);
    });

    it("retorna 0 quando não há valores no intervalo", () => {
        const range = getMonthRange(new Date(2026, 5, 10));
        expect(sumInRange(rows, range)).toBe(0);
    });
});

describe("computeInvestmentsTotal", () => {
    it("soma aportes e subtrai resgates", () => {
        const aplicacoes = [
            { valor: 1000, tipo_transacao: "aporte" },
            { valor: 300, tipo_transacao: "resgate" },
            { valor: 200, tipo_transacao: "aporte" },
        ];
        expect(computeInvestmentsTotal(aplicacoes)).toBe(900);
    });

    it("inclui o valor atual das metas de poupança", () => {
        const aplicacoes = [{ valor: 500, tipo_transacao: "aporte" }];
        const metas = [{ valor_atual: 250 }, { valor_atual: 100 }];
        expect(computeInvestmentsTotal(aplicacoes, metas)).toBe(850);
    });
});

describe("percentChange", () => {
    it("calcula a variação percentual positiva", () => {
        expect(percentChange(150, 100)).toBe(50);
    });

    it("calcula a variação percentual negativa", () => {
        expect(percentChange(80, 100)).toBeCloseTo(-20);
    });

    it("evita divisão por zero", () => {
        expect(percentChange(100, 0)).toBe(100);
        expect(percentChange(0, 0)).toBe(0);
    });
});

describe("formatCurrency", () => {
    it("formata como moeda brasileira", () => {
        const resultado = formatCurrency(1234.5);
        expect(resultado).toContain("1.234,50");
        expect(resultado).toContain("R$");
    });
});
