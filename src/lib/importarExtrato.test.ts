import { describe, it, expect } from "vitest";
import {
    parseOFX,
    detectarDelimitadorCSV,
    parseLinhaCSV,
    parseCSV,
    sugerirMapeamentoCSV,
    parseValorBR,
    parseDataParaISO,
    converterLinhasCSV,
    marcarPossiveisDuplicatas,
} from "./importarExtrato";

describe("parseOFX", () => {
    const ofxExemplo = `OFXHEADER:100
DATA:OFXSGML
VERSION:102

<OFX>
<BANKMSGSRSV1>
<STMTTRNRS>
<STMTRS>
<BANKTRANLIST>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20260110120000[-3:BRT]
<TRNAMT>-45.90
<FITID>2026011000001
<MEMO>PADARIA SAO JOAO
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20260115000000
<TRNAMT>2500.00
<FITID>2026011500001
<MEMO>SALARIO
</STMTTRN>
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>`;

    it("extrai as transações com data, valor e tipo corretos", () => {
        const transacoes = parseOFX(ofxExemplo);
        expect(transacoes).toHaveLength(2);

        expect(transacoes[0]).toEqual({
            data: "2026-01-10",
            descricao: "PADARIA SAO JOAO",
            valor: 45.9,
            tipo: "despesa",
        });

        expect(transacoes[1]).toEqual({
            data: "2026-01-15",
            descricao: "SALARIO",
            valor: 2500,
            tipo: "receita",
        });
    });

    it("retorna array vazio para conteúdo sem transações", () => {
        expect(parseOFX("<OFX></OFX>")).toEqual([]);
    });
});

describe("detectarDelimitadorCSV", () => {
    it("detecta ponto e vírgula", () => {
        expect(detectarDelimitadorCSV("Data;Descrição;Valor")).toBe(";");
    });

    it("detecta vírgula", () => {
        expect(detectarDelimitadorCSV("Date,Description,Amount")).toBe(",");
    });
});

describe("parseLinhaCSV", () => {
    it("faz split simples", () => {
        expect(parseLinhaCSV("10/01/2026;Padaria;-45,90", ";")).toEqual([
            "10/01/2026",
            "Padaria",
            "-45,90",
        ]);
    });

    it("respeita campos entre aspas contendo o delimitador", () => {
        expect(parseLinhaCSV('10/01/2026;"Padaria, pão e leite";-45,90', ";")).toEqual([
            "10/01/2026",
            "Padaria, pão e leite",
            "-45,90",
        ]);
    });
});

describe("parseCSV", () => {
    it("separa cabeçalho e linhas", () => {
        const csv = "Data;Descrição;Valor\n10/01/2026;Padaria;-45,90\n15/01/2026;Salário;2500,00";
        const { cabecalhos, linhas } = parseCSV(csv);
        expect(cabecalhos).toEqual(["Data", "Descrição", "Valor"]);
        expect(linhas).toHaveLength(2);
        expect(linhas[0]).toEqual(["10/01/2026", "Padaria", "-45,90"]);
    });
});

describe("sugerirMapeamentoCSV", () => {
    it("acha as colunas por nome em português", () => {
        expect(sugerirMapeamentoCSV(["Data", "Histórico", "Valor"])).toEqual({
            data: 0,
            descricao: 1,
            valor: 2,
        });
    });

    it("acha as colunas por nome em inglês", () => {
        expect(sugerirMapeamentoCSV(["Date", "Description", "Amount"])).toEqual({
            data: 0,
            descricao: 1,
            valor: 2,
        });
    });

    it("retorna -1 para colunas não reconhecidas", () => {
        expect(sugerirMapeamentoCSV(["Col A", "Col B", "Col C"])).toEqual({
            data: -1,
            descricao: -1,
            valor: -1,
        });
    });
});

describe("parseValorBR", () => {
    it("formato brasileiro com milhar", () => {
        expect(parseValorBR("1.234,56")).toBeCloseTo(1234.56);
    });

    it("formato brasileiro sem milhar", () => {
        expect(parseValorBR("45,90")).toBeCloseTo(45.9);
    });

    it("formato com ponto decimal (sem milhar)", () => {
        expect(parseValorBR("45.90")).toBeCloseTo(45.9);
    });

    it("negativo", () => {
        expect(parseValorBR("-45,90")).toBeCloseTo(-45.9);
    });

    it("com prefixo R$", () => {
        expect(parseValorBR("R$ 45,90")).toBeCloseTo(45.9);
    });
});

describe("parseDataParaISO", () => {
    it("formato dd/mm/yyyy", () => {
        expect(parseDataParaISO("10/01/2026")).toBe("2026-01-10");
    });

    it("formato dd-mm-yyyy", () => {
        expect(parseDataParaISO("10-01-2026")).toBe("2026-01-10");
    });

    it("formato yyyy-mm-dd", () => {
        expect(parseDataParaISO("2026-01-10")).toBe("2026-01-10");
    });

    it("retorna null para formato desconhecido", () => {
        expect(parseDataParaISO("não é uma data")).toBeNull();
    });
});

describe("converterLinhasCSV", () => {
    it("converte linhas em transações usando o mapeamento", () => {
        const linhas = [
            ["10/01/2026", "Padaria", "-45,90"],
            ["15/01/2026", "Salário", "2.500,00"],
        ];
        const transacoes = converterLinhasCSV(linhas, { data: 0, descricao: 1, valor: 2 });

        expect(transacoes).toEqual([
            { data: "2026-01-10", descricao: "Padaria", valor: 45.9, tipo: "despesa" },
            { data: "2026-01-15", descricao: "Salário", valor: 2500, tipo: "receita" },
        ]);
    });

    it("ignora linhas com valor zero ou data inválida", () => {
        const linhas = [
            ["10/01/2026", "Saldo", "0,00"],
            ["data-invalida", "Algo", "10,00"],
        ];
        expect(converterLinhasCSV(linhas, { data: 0, descricao: 1, valor: 2 })).toEqual([]);
    });
});

describe("marcarPossiveisDuplicatas", () => {
    it("marca como duplicata quando já existe lançamento com mesma data e valor", () => {
        const importadas = [
            { data: "2026-01-10", descricao: "Padaria", valor: 45.9, tipo: "despesa" as const },
            { data: "2026-01-15", descricao: "Salário", valor: 2500, tipo: "receita" as const },
        ];
        const existentes = [{ data: "2026-01-10", valor: 45.9, descricao: "Padaria São João" }];

        const resultado = marcarPossiveisDuplicatas(importadas, existentes);
        expect(resultado[0].duplicada).toBe(true);
        expect(resultado[1].duplicada).toBe(false);
    });
});
