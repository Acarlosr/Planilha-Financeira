"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, CreditCard, FileText, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ReminderType = "cartao" | "boleto";
type ReminderStatus = "ok" | "warning" | "danger";

interface Reminder {
    id: string;
    type: ReminderType;
    title: string;
    detail: string;
    dueDate: string;
    amount: number;
    balanceAfter: number;
    status: ReminderStatus;
}

interface ExpenseRow {
    id: string;
    descricao: string;
    valor: number;
    data: string;
    cartao_id: string | null;
    boleto?: boolean | null;
    data_vencimento?: string | null;
}

interface CardRow {
    id: string;
    nome: string;
    bandeira: string;
    dia_fechamento?: number | null;
    dia_vencimento?: number | null;
}

const formatCurrency = (value: number) => value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
});

const formatShortDate = (value: string) => {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
};

const toISODate = (date: Date) => date.toISOString().slice(0, 10);

const getStatus = (balanceAfter: number, dueDate: string): ReminderStatus => {
    const today = toISODate(new Date());
    if (balanceAfter < 0) return "danger";
    if (dueDate <= today) return "warning";
    return "ok";
};

const statusStyles: Record<ReminderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    ok: {
        label: "Coberto",
        color: "var(--success)",
        bg: "color-mix(in srgb, var(--success) 10%, transparent)",
        icon: <CheckCircle2 size={16} />,
    },
    warning: {
        label: "Vence hoje",
        color: "var(--warning)",
        bg: "color-mix(in srgb, var(--warning) 12%, transparent)",
        icon: <AlertTriangle size={16} />,
    },
    danger: {
        label: "Saldo insuficiente",
        color: "var(--danger)",
        bg: "color-mix(in srgb, var(--danger) 10%, transparent)",
        icon: <AlertTriangle size={16} />,
    },
};

export default function PaymentReminders() {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [monthlyIncome, setMonthlyIncome] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadReminders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setMonthlyIncome(0);
                setReminders([]);
                return;
            }

            const now = new Date();
            const nextMonthEnd = toISODate(new Date(now.getFullYear(), now.getMonth() + 2, 0));
            const today = toISODate(now);
            const nextFifteenDays = toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15));
            const monthStart = toISODate(new Date(now.getFullYear(), now.getMonth(), 1));

            const [receitasResult, despesasResult, cartoesResult] = await Promise.all([
                supabase
                    .from("receitas")
                    .select("valor")
                    .eq("user_id", user.id)
                    .gte("data", monthStart)
                    .lte("data", nextMonthEnd),
                supabase
                    .from("despesas")
                    .select("id, descricao, valor, data, cartao_id, boleto, data_vencimento")
                    .eq("user_id", user.id)
                    .or(
                        [
                            `and(cartao_id.not.is.null,data_vencimento.gte.${today},data_vencimento.lte.${nextFifteenDays})`,
                            `and(cartao_id.is.null,boleto.eq.true,data_vencimento.gte.${today},data_vencimento.lte.${nextFifteenDays})`,
                            `and(cartao_id.is.null,boleto.eq.true,data_vencimento.is.null,data.gte.${today},data.lte.${nextFifteenDays})`,
                        ].join(",")
                    )
                    .order("data_vencimento", { ascending: true }),
                supabase
                    .from("cartoes")
                    .select("id, nome, bandeira, dia_fechamento, dia_vencimento")
                    .eq("user_id", user.id),
            ]);

            if (receitasResult.error) throw receitasResult.error;

            const income = (receitasResult.data ?? []).reduce((sum, item) => sum + Number(item.valor), 0);
            const expenses = despesasResult.error ? [] : (despesasResult.data ?? []) as ExpenseRow[];
            const cards = cartoesResult.error ? [] : (cartoesResult.data ?? []) as CardRow[];
            const cardById = new Map(cards.map((card) => [card.id, card]));
            const cardStatementGroups = new Map<string, { card: CardRow; dueDate: string; amount: number }>();

            expenses
                .filter((expense) => expense.cartao_id && expense.data_vencimento)
                .forEach((expense) => {
                    const card = cardById.get(expense.cartao_id!);
                    if (!card || !expense.data_vencimento) return;
                    const key = `${card.id}|${expense.data_vencimento}`;
                    const current = cardStatementGroups.get(key) ?? {
                        card,
                        dueDate: expense.data_vencimento,
                        amount: 0,
                    };
                    current.amount += Number(expense.valor);
                    cardStatementGroups.set(key, current);
                });

            const cardReminders = Array.from(cardStatementGroups.values())
                .filter((group) => group.amount > 0)
                .map((group) => {
                    const balanceAfter = income - group.amount;
                    return {
                        id: `card-${group.card.id}-${group.dueDate}`,
                        type: "cartao" as const,
                        title: `Fatura ${group.card.bandeira}`,
                        detail: `${group.card.nome} - fecha dia ${group.card.dia_fechamento ?? 30}`,
                        dueDate: group.dueDate,
                        amount: group.amount,
                        balanceAfter,
                        status: getStatus(balanceAfter, group.dueDate),
                    };
                });

            const boletoReminders = expenses
                .filter((expense) => {
                    const dueDate = expense.data_vencimento ?? expense.data;
                    return Boolean(expense.boleto) && !expense.cartao_id && dueDate >= today && dueDate <= nextFifteenDays;
                })
                .map((expense) => {
                    const dueDate = expense.data_vencimento ?? expense.data;
                    const balanceAfter = income - Number(expense.valor);
                    return {
                        id: `expense-${expense.id}`,
                        type: "boleto" as const,
                        title: expense.descricao,
                        detail: "Conta ou boleto cadastrado",
                        dueDate,
                        amount: Number(expense.valor),
                        balanceAfter,
                        status: getStatus(balanceAfter, dueDate),
                    };
                });

            setMonthlyIncome(income);
            setReminders([...cardReminders, ...boletoReminders]
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .slice(0, 6));
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar lembretes");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReminders();
    }, [loadReminders]);

    const totalUpcoming = useMemo(
        () => reminders.reduce((sum, reminder) => sum + reminder.amount, 0),
        [reminders]
    );

    return (
        <section className="mb-8 glass-card overflow-hidden">
            <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between" style={{ borderColor: "var(--card-border)" }}>
                <div className="flex items-start gap-3">
                    <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: "color-mix(in srgb, var(--warning) 14%, transparent)", color: "var(--warning)" }}
                    >
                        <CalendarClock size={22} />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-bold text-foreground">Lembretes de vencimento</h2>
                            <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ background: "var(--warning)" }}>
                                Próximos
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-muted">
                            Cartões, contas e boletos cadastrados nas despesas, comparados com as receitas do período.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right text-xs text-muted">
                        <p>Receitas no período</p>
                        <p className="font-bold text-foreground">{formatCurrency(monthlyIncome)}</p>
                    </div>
                    <button
                        type="button"
                        onClick={loadReminders}
                        className="no-print flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium text-muted transition hover:text-foreground"
                        style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Atualizar
                    </button>
                </div>
            </div>

            <div className="p-5">
                {error && (
                    <div
                        className="mb-4 rounded-lg border p-4 text-sm"
                        style={{
                            borderColor: "color-mix(in srgb, var(--danger) 24%, transparent)",
                            background: "color-mix(in srgb, var(--danger) 8%, transparent)",
                            color: "var(--danger)",
                        }}
                    >
                        {error}
                    </div>
                )}

                {loading && reminders.length === 0 && (
                    <div className="py-8 text-center text-sm text-muted">Carregando lembretes financeiros...</div>
                )}

                {!loading && reminders.length === 0 && !error && (
                    <div className="rounded-lg border p-5 text-sm text-muted" style={{ borderColor: "var(--card-border)", background: "var(--card-bg-solid)" }}>
                        Nenhum vencimento próximo encontrado. Cadastre despesas com data de vencimento ou vincule compras a um cartão.
                    </div>
                )}

                {reminders.length > 0 && (
                    <>
                        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-lg border p-4" style={{ borderColor: "var(--card-border)", background: "var(--card-bg-solid)" }}>
                                <p className="text-xs text-muted">Total próximo</p>
                                <p className="mt-1 text-lg font-bold text-foreground">{formatCurrency(totalUpcoming)}</p>
                            </div>
                            <div className="rounded-lg border p-4" style={{ borderColor: "var(--card-border)", background: "var(--card-bg-solid)" }}>
                                <p className="text-xs text-muted">Após vencimentos</p>
                                <p className="mt-1 text-lg font-bold text-foreground">{formatCurrency(monthlyIncome - totalUpcoming)}</p>
                            </div>
                            <div className="rounded-lg border p-4" style={{ borderColor: "var(--card-border)", background: "var(--card-bg-solid)" }}>
                                <p className="text-xs text-muted">Alertas</p>
                                <p className="mt-1 text-lg font-bold text-foreground">{reminders.filter((item) => item.status !== "ok").length}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {reminders.map((reminder) => {
                                const status = statusStyles[reminder.status];
                                return (
                                    <article
                                        key={reminder.id}
                                        className="rounded-lg border p-3 flex flex-col gap-2"
                                        style={{ borderColor: "var(--card-border)", background: "var(--card-bg-solid)" }}
                                    >
                                        {/* Ícone + título */}
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                                                style={{
                                                    background: reminder.type === "cartao"
                                                        ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                                                        : "color-mix(in srgb, var(--warning) 10%, transparent)",
                                                    color: reminder.type === "cartao" ? "var(--accent)" : "var(--warning)",
                                                }}
                                            >
                                                {reminder.type === "cartao" ? <CreditCard size={14} /> : <FileText size={14} />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-xs font-bold text-foreground leading-tight truncate">{reminder.title}</h3>
                                                <p className="text-[10px] text-muted truncate">{reminder.detail}</p>
                                            </div>
                                        </div>

                                        {/* Data de vencimento */}
                                        <span
                                            className="self-start rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                            style={{ background: status.bg, color: status.color }}
                                        >
                                            {formatShortDate(reminder.dueDate)}
                                        </span>

                                        {/* Valores */}
                                        <div className="rounded-md p-2 flex flex-col gap-1" style={{ background: "rgba(255,255,255,0.04)" }}>
                                            <div className="flex items-center justify-between gap-1">
                                                <p className="text-[10px] text-muted whitespace-nowrap">Valor</p>
                                                <p className="text-xs font-bold text-foreground">{formatCurrency(reminder.amount)}</p>
                                            </div>
                                            <div className="flex items-center justify-between gap-1">
                                                <p className="text-[10px] text-muted whitespace-nowrap">Saldo restante</p>
                                                <p className="text-xs font-bold" style={{ color: reminder.balanceAfter < 0 ? "var(--danger)" : "var(--success)" }}>
                                                    {formatCurrency(reminder.balanceAfter)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: status.color }}>
                                            {status.icon}
                                            {status.label}
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
