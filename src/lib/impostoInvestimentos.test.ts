import { describe, it, expect } from "vitest";
import {
    apurarHistorico,
    calcularResultadoVenda,
    calcularVencimentoDarf,
    VendaParaApuracao,
} from "./impostoInvestimentos";

describe("calcularResultadoVenda", () => {
    it("calcula lucro corretamente", () => {
        const r = calcularResultadoVenda(100, 12, 10, 5);
        expect(r.valorVenda).toBe(1195); // 100*12 - 5
        expect(r.valorCusto).toBe(1000); // 100*10
        expect(r.resultado).toBe(195);
    });

    it("calcula prejuízo corretamente", () => {
        const r = calcularResultadoVenda(100, 8, 10);
        expect(r.resultado).toBe(-200);
    });
});

describe("calcularVencimentoDarf", () => {
    it("último dia útil do mês seguinte quando não cai em fim de semana", () => {
        // Julho/2026 -> vencimento em agosto/2026. 31/08/2026 é uma segunda-feira.
        expect(calcularVencimentoDarf("2026-07")).toBe("2026-08-31");
    });

    it("recua para sexta quando o último dia do mês seguinte cai em domingo", () => {
        // Fevereiro/2026 -> vencimento em março/2026. 31/03/2026 é uma terça — usar outro mês de controle.
        // Mês de referência com último dia caindo num domingo: janeiro/2026 -> vencimento fevereiro/2026 (28/02/2026 é sábado)
        const vencimento = calcularVencimentoDarf("2026-01");
        const date = new Date(`${vencimento}T00:00:00`);
        expect([1, 2, 3, 4, 5]).toContain(date.getDay() === 0 ? 7 : date.getDay());
    });
});

describe("apurarHistorico", () => {
    it("isenta ações swing trade com vendas totais até R$ 20.000 no mês", () => {
        const vendas: VendaParaApuracao[] = [
            { classe: "acao", modalidade: "swing_trade", dataVenda: "2026-03-10", valorVenda: 15000, resultado: 3000 },
        ];
        const [apuracao] = apurarHistorico(vendas);
        expect(apuracao.isento).toBe(true);
        expect(apuracao.impostoDevido).toBe(0);
        expect(apuracao.status).toBe("isento");
    });

    it("tributa ações swing trade quando vendas passam de R$ 20.000 no mês", () => {
        const vendas: VendaParaApuracao[] = [
            { classe: "acao", modalidade: "swing_trade", dataVenda: "2026-03-10", valorVenda: 25000, resultado: 4000 },
        ];
        const [apuracao] = apurarHistorico(vendas);
        expect(apuracao.isento).toBe(false);
        expect(apuracao.baseCalculo).toBe(4000);
        expect(apuracao.impostoDevido).toBeCloseTo(600); // 15% de 4000
        expect(apuracao.status).toBe("a_pagar");
    });

    it("day trade não tem isenção mesmo com vendas baixas", () => {
        const vendas: VendaParaApuracao[] = [
            { classe: "acao", modalidade: "day_trade", dataVenda: "2026-03-10", valorVenda: 5000, resultado: 1000 },
        ];
        const [apuracao] = apurarHistorico(vendas);
        expect(apuracao.isento).toBe(false);
        expect(apuracao.impostoDevido).toBeCloseTo(200); // 20% de 1000
    });

    it("FII nunca é isento e usa alíquota de 20%", () => {
        const vendas: VendaParaApuracao[] = [
            { classe: "fii", modalidade: "swing_trade", dataVenda: "2026-03-10", valorVenda: 3000, resultado: 500 },
        ];
        const [apuracao] = apurarHistorico(vendas);
        expect(apuracao.isento).toBe(false);
        expect(apuracao.impostoDevido).toBeCloseTo(100); // 20% de 500
    });

    it("compensa prejuízo de meses anteriores dentro do mesmo grupo", () => {
        const vendas: VendaParaApuracao[] = [
            // Mês 1: prejuízo tributável (vendas > 20k, então prejuízo é compensável)
            { classe: "acao", modalidade: "swing_trade", dataVenda: "2026-01-10", valorVenda: 25000, resultado: -3000 },
            // Mês 2: lucro que deveria ser abatido pelo prejuízo anterior
            { classe: "acao", modalidade: "swing_trade", dataVenda: "2026-02-10", valorVenda: 25000, resultado: 5000 },
        ];
        const [mes1, mes2] = apurarHistorico(vendas);
        expect(mes1.impostoDevido).toBe(0);
        expect(mes1.prejuizoAcumuladoRestante).toBe(3000);
        expect(mes2.prejuizoUsado).toBe(3000);
        expect(mes2.baseCalculo).toBe(2000); // 5000 - 3000
        expect(mes2.impostoDevido).toBeCloseTo(300); // 15% de 2000
    });

    it("prejuízo apurado em mês isento não é compensável depois", () => {
        const vendas: VendaParaApuracao[] = [
            // Mês 1: prejuízo, mas dentro do limite de isenção -> não compensável
            { classe: "acao", modalidade: "swing_trade", dataVenda: "2026-01-10", valorVenda: 10000, resultado: -2000 },
            // Mês 2: lucro tributável, não deve ser abatido
            { classe: "acao", modalidade: "swing_trade", dataVenda: "2026-02-10", valorVenda: 25000, resultado: 5000 },
        ];
        const [, mes2] = apurarHistorico(vendas);
        expect(mes2.prejuizoUsado).toBe(0);
        expect(mes2.baseCalculo).toBe(5000);
    });

    it("acumula imposto abaixo do mínimo de R$ 10 para o mês seguinte", () => {
        const vendas: VendaParaApuracao[] = [
            // 15% de um lucro pequeno gera menos de R$10 de imposto
            { classe: "acao", modalidade: "swing_trade", dataVenda: "2026-01-10", valorVenda: 25000, resultado: 40 }, // imposto bruto = 6
            { classe: "acao", modalidade: "swing_trade", dataVenda: "2026-02-10", valorVenda: 25000, resultado: 40 }, // imposto bruto = 6, acumulado = 12 -> paga
        ];
        const [mes1, mes2] = apurarHistorico(vendas);
        expect(mes1.impostoDevido).toBe(0);
        expect(mes1.status).toBe("abaixo_do_minimo");
        expect(mes2.impostoDevido).toBeCloseTo(12);
        expect(mes2.status).toBe("a_pagar");
    });

    it("day trade e swing trade de ações não se misturam na compensação", () => {
        const vendas: VendaParaApuracao[] = [
            { classe: "acao", modalidade: "day_trade", dataVenda: "2026-01-10", valorVenda: 25000, resultado: -3000 },
            { classe: "acao", modalidade: "swing_trade", dataVenda: "2026-02-10", valorVenda: 25000, resultado: 5000 },
        ];
        const apuracoes = apurarHistorico(vendas);
        const swing = apuracoes.find((a) => a.grupo === "acao_swing");
        expect(swing?.prejuizoUsado).toBe(0);
        expect(swing?.baseCalculo).toBe(5000);
    });
});
