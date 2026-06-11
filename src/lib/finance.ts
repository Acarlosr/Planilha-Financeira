/**
 * Funções puras de cálculo financeiro.
 * Mantidas sem dependências de React/Supabase para facilitar testes.
 */

export interface DateRange {
    start: string; // YYYY-MM-DD (inclusivo)
    end: string; // YYYY-MM-DD (exclusivo)
}

export interface ValorComData {
    valor: number;
    data: string; // YYYY-MM-DD
}

/**
 * Retorna o intervalo [início, fim) do mês da data informada.
 * O fim é o primeiro dia do mês seguinte (exclusivo).
 */
export function getMonthRange(date: Date): DateRange {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
    };
}

/**
 * Soma os valores cujas datas estão dentro do intervalo [start, end).
 */
export function sumInRange(rows: ValorComData[], range: DateRange): number {
    return rows
        .filter((item) => item.data >= range.start && item.data < range.end)
        .reduce((sum, item) => sum + Number(item.valor), 0);
}

/**
 * Calcula o total investido considerando aportes (somam) e resgates (subtraem).
 */
export function computeInvestmentsTotal(
    aplicacoes: Array<{ valor: number; tipo_transacao: string }>,
    metasPoupanca: Array<{ valor_atual: number }> = []
): number {
    const totalAplicacoes = aplicacoes.reduce((sum, item) => {
        const value = Number(item.valor);
        return item.tipo_transacao === "resgate" ? sum - value : sum + value;
    }, 0);

    const totalPoupanca = metasPoupanca.reduce(
        (sum, item) => sum + Number(item.valor_atual),
        0
    );

    return totalAplicacoes + totalPoupanca;
}

/**
 * Variação percentual entre o valor atual e o anterior.
 * Retorna 0 quando o valor anterior é 0 (evita divisão por zero).
 */
export function percentChange(current: number, previous: number): number {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / previous) * 100;
}

/**
 * Formata um número como moeda brasileira (BRL).
 */
export function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}
