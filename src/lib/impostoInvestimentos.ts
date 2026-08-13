/**
 * Motor de apuração de IR/DARF para Ações e FIIs.
 *
 * Funções puras, sem dependência de React/Supabase, para facilitar testes
 * (mesmo espírito de src/lib/finance.ts).
 *
 * Regras implementadas (vigentes em 2026 — a MP 1.303/2025 caducou e a
 * tabela regressiva/isenções anteriores seguem valendo):
 * - Ações swing trade: 15% sobre o ganho, isento se o total VENDIDO no mês
 *   (não o lucro) for ≤ R$ 20.000. Prejuízo apurado num mês isento não é
 *   compensável.
 * - Ações day trade: 20% sobre o ganho, sem isenção.
 * - FIIs: 20% sobre o ganho na venda de cotas, sem isenção (o rendimento
 *   mensal distribuído é isento, mas isso é outra apuração — não é
 *   tratado aqui).
 * - Compensação de prejuízo: só dentro do mesmo grupo (ações swing compensa
 *   com ações swing; ações day trade só com day trade; FII só com FII).
 * - DARF mínimo de R$ 10 — abaixo disso, acumula para o mês seguinte.
 * - Código DARF 6015 para ações e FIIs.
 *
 * IMPORTANTE: isto é uma ferramenta de organização, não substitui a
 * orientação de um contador. Sempre confira com um profissional antes de
 * pagar qualquer DARF.
 */

export interface VendaParaApuracao {
    classe: "acao" | "fii";
    modalidade: "swing_trade" | "day_trade";
    dataVenda: string; // YYYY-MM-DD
    valorVenda: number;
    resultado: number; // lucro (positivo) ou prejuízo (negativo)
}

export type GrupoApuracao = "acao_swing" | "acao_day_trade" | "fii";

export interface ResultadoVenda {
    valorVenda: number;
    valorCusto: number;
    resultado: number;
}

export interface ApuracaoMensal {
    competencia: string; // YYYY-MM
    grupo: GrupoApuracao;
    totalVendas: number;
    resultadoMes: number;
    isento: boolean;
    prejuizoUsado: number;
    prejuizoAcumuladoRestante: number;
    baseCalculo: number;
    aliquota: number;
    impostoAcumuladoAbaixoMinimo: number;
    impostoDevido: number;
    status: "isento" | "a_pagar" | "abaixo_do_minimo" | "sem_operacao_tributavel";
    codigoDarf: string;
    vencimento: string; // YYYY-MM-DD
}

export const CODIGO_DARF_ACOES_FII = "6015";
export const LIMITE_ISENCAO_ACOES_SWING = 20000;
export const VALOR_MINIMO_DARF = 10;

const ALIQUOTAS: Record<GrupoApuracao, number> = {
    acao_swing: 0.15,
    acao_day_trade: 0.2,
    fii: 0.2,
};

/**
 * Calcula o resultado (lucro/prejuízo) de uma venda a partir dos dados
 * digitados no formulário. Usado tanto para pré-visualização no modal de
 * venda quanto para montar o registro salvo em `vendas_ativos`.
 */
export function calcularResultadoVenda(
    quantidade: number,
    precoVenda: number,
    precoCusto: number,
    taxas: number = 0
): ResultadoVenda {
    const valorVenda = quantidade * precoVenda - taxas;
    const valorCusto = quantidade * precoCusto;
    return {
        valorVenda,
        valorCusto,
        resultado: valorVenda - valorCusto,
    };
}

function getGrupo(venda: VendaParaApuracao): GrupoApuracao {
    if (venda.classe === "fii") return "fii";
    return venda.modalidade === "day_trade" ? "acao_day_trade" : "acao_swing";
}

/**
 * Último dia útil (seg-sex) do mês seguinte à competência informada.
 * Não considera feriados nacionais/estaduais — apenas fins de semana.
 * Use como referência, não como data oficial: confirme no calendário da
 * Receita Federal antes de pagar o DARF.
 */
export function calcularVencimentoDarf(competencia: string): string {
    const [year, month] = competencia.split("-").map(Number);
    // Primeiro dia do mês seguinte ao mês seguinte (mês subsequente à competência + 1)
    const firstDayAfterNext = new Date(year, month, 1); // month já é o mês seguinte (0-indexed = mês atual + 1)
    const lastDayNextMonth = new Date(firstDayAfterNext.getFullYear(), firstDayAfterNext.getMonth() + 1, 0);

    const day = lastDayNextMonth.getDay(); // 0 = domingo, 6 = sábado
    if (day === 0) lastDayNextMonth.setDate(lastDayNextMonth.getDate() - 2);
    if (day === 6) lastDayNextMonth.setDate(lastDayNextMonth.getDate() - 1);

    const y = lastDayNextMonth.getFullYear();
    const m = String(lastDayNextMonth.getMonth() + 1).padStart(2, "0");
    const d = String(lastDayNextMonth.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/**
 * Apura, mês a mês e por grupo (ações swing / ações day trade / FII), o
 * imposto devido a partir do histórico completo de vendas. Precisa do
 * histórico completo (não só do mês consultado) para arrastar corretamente
 * prejuízo compensável e imposto acumulado abaixo do mínimo de R$ 10.
 */
export function apurarHistorico(vendas: VendaParaApuracao[]): ApuracaoMensal[] {
    const porGrupo = new Map<GrupoApuracao, Map<string, VendaParaApuracao[]>>();

    for (const venda of vendas) {
        const grupo = getGrupo(venda);
        const competencia = venda.dataVenda.slice(0, 7); // YYYY-MM
        if (!porGrupo.has(grupo)) porGrupo.set(grupo, new Map());
        const meses = porGrupo.get(grupo)!;
        if (!meses.has(competencia)) meses.set(competencia, []);
        meses.get(competencia)!.push(venda);
    }

    const resultado: ApuracaoMensal[] = [];

    for (const [grupo, meses] of porGrupo) {
        const competencias = Array.from(meses.keys()).sort();
        let prejuizoAcumulado = 0;
        let impostoAcumuladoAbaixoMinimo = 0;
        const aliquota = ALIQUOTAS[grupo];

        for (const competencia of competencias) {
            const vendasDoMes = meses.get(competencia)!;
            const totalVendas = vendasDoMes.reduce((sum, v) => sum + v.valorVenda, 0);
            const resultadoMes = vendasDoMes.reduce((sum, v) => sum + v.resultado, 0);

            const isento = grupo === "acao_swing" && totalVendas <= LIMITE_ISENCAO_ACOES_SWING;

            let prejuizoUsado = 0;
            let baseCalculo = 0;
            let impostoDevido = 0;
            let status: ApuracaoMensal["status"];

            if (isento) {
                // Prejuízo apurado em operação isenta não é compensável.
                status = "isento";
            } else if (resultadoMes > 0) {
                prejuizoUsado = Math.min(prejuizoAcumulado, resultadoMes);
                baseCalculo = resultadoMes - prejuizoUsado;
                prejuizoAcumulado -= prejuizoUsado;

                const impostoBruto = baseCalculo * aliquota;
                impostoAcumuladoAbaixoMinimo += impostoBruto;

                if (impostoAcumuladoAbaixoMinimo >= VALOR_MINIMO_DARF) {
                    impostoDevido = impostoAcumuladoAbaixoMinimo;
                    impostoAcumuladoAbaixoMinimo = 0;
                    status = "a_pagar";
                } else {
                    status = impostoBruto > 0 ? "abaixo_do_minimo" : "sem_operacao_tributavel";
                }
            } else if (resultadoMes < 0) {
                prejuizoAcumulado += Math.abs(resultadoMes);
                status = "sem_operacao_tributavel";
            } else {
                status = "sem_operacao_tributavel";
            }

            resultado.push({
                competencia,
                grupo,
                totalVendas,
                resultadoMes,
                isento,
                prejuizoUsado,
                prejuizoAcumuladoRestante: prejuizoAcumulado,
                baseCalculo,
                aliquota,
                impostoAcumuladoAbaixoMinimo,
                impostoDevido,
                status,
                codigoDarf: CODIGO_DARF_ACOES_FII,
                vencimento: calcularVencimentoDarf(competencia),
            });
        }
    }

    return resultado.sort((a, b) => a.competencia.localeCompare(b.competencia) || a.grupo.localeCompare(b.grupo));
}

export const GRUPO_LABEL: Record<GrupoApuracao, string> = {
    acao_swing: "Ações — Swing Trade",
    acao_day_trade: "Ações — Day Trade",
    fii: "Fundos Imobiliários (FIIs)",
};
