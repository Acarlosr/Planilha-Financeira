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

export interface CreditCardBillingRule {
    closingDay?: number | null;
    dueDay?: number | null;
}

const clampBillingDay = (day: number | null | undefined, fallback: number) => {
    const value = Number(day ?? fallback);
    if (!Number.isFinite(value)) return fallback;
    return Math.min(Math.max(Math.trunc(value), 1), 31);
};

const daysInMonth = (year: number, monthIndex: number) =>
    new Date(year, monthIndex + 1, 0).getDate();

const formatDateParts = (year: number, monthIndex: number, day: number) => {
    const safeDay = Math.min(day, daysInMonth(year, monthIndex));
    return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
};

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
 * Calcula o vencimento da fatura que receberá uma compra no cartão.
 *
 * Exemplo: compra em 2026-07-01, fechamento dia 30 e vencimento dia 10
 * entra na fatura que fecha em julho e vence em 2026-08-10.
 */
export function getCreditCardDueDate(
    purchaseDate: string,
    { closingDay, dueDay }: CreditCardBillingRule
): string {
    const [year, month, day] = purchaseDate.split("-").map(Number);
    if (!year || !month || !day) return purchaseDate;

    const purchaseMonthIndex = month - 1;
    const closing = clampBillingDay(closingDay, 30);
    const due = clampBillingDay(dueDay, 10);
    const closingDayInPurchaseMonth = Math.min(closing, daysInMonth(year, purchaseMonthIndex));

    const closingMonthOffset = day <= closingDayInPurchaseMonth ? 0 : 1;
    const closingDate = new Date(year, purchaseMonthIndex + closingMonthOffset, 1);
    const dueMonthOffset = due > closing ? 0 : 1;
    const dueDate = new Date(
        closingDate.getFullYear(),
        closingDate.getMonth() + dueMonthOffset,
        1
    );

    return formatDateParts(dueDate.getFullYear(), dueDate.getMonth(), due);
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
