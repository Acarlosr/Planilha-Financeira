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
}

interface CardRow {
    id: string;
    nome: string;
    bandeira: string;
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

const getNextDueDate = (dueDay: number, now: Date) => {
    const safeDay = Math.min(Math.max(dueDay || 10, 1), 28);
    const currentMonthDue = new Date(now.getFullYear(), now.getMonth(), safeDay);
    if (currentMonthDue >= new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
        return currentMonthDue;
    }
    return new Date(now.getFullYear(), now.getMonth() + 1, safeDay);
};

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
            const monthStart = toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
            const nextMonthEnd = toISODate(new Date(now.getFullYear(), now.getMonth() + 2, 0));
            const today = toISODate(now);
            const nextFifteenDays = toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 15));

            const [receitasResult, despesasResult, cartoesResult] = await Promise.all([
                supabase
                    .from("receitas")
                    .select("valor")
                    .eq("user_id", user.id)
                    .gte("data", monthStart)
                    .lte("data", nextMonthEnd),
                supabase
                    .from("despesas")
                    .select("id, descricao, valor, data, cartao_id")
                    .eq("user_id", user.id)
                    .gte("data", monthStart)
                    .lte("data", nextMonthEnd)
                    .order("data", { ascending: true }),
                supabase
                    .from("cartoes")
                    .select("id, nome, bandeira, dia_vencimento")
                    .eq("user_id", user.id),
            ]);

            if (receitasResult.error) throw receitasResult.error;
            if (despesasResult.error) throw despesasResult.error;
            if (cartoesResult.error) throw cartoesResult.error;

            const income = (receitasResult.data ?? []).reduce((sum, item) => sum + Number(item.valor), 0);
            const expenses = (despesasResult.data ?? []) as ExpenseRow[];
            const cards = (cartoesResult.data ?? []) as CardRow[];

            const cardReminders = cards
                .map((card) => {
                    const dueDate = toISODate(getNextDueDate(card.dia_vencimento ?? 10, now));
                    const amount = expenses
                        .filter((expense) => expense.cartao_id === card.id)
                        .reduce((sum, expense) => sum + Number(expense.valor), 0);

                    if (amount <= 0) return null;

                    const balanceAfter = income - amount;
                    return {
                        id: `card-${card.id}`,
                        type: "cartao" as const,
                        title: `Vencimento ${card.bandeira}`,
                        detail: `${card.nome} - dia ${card.dia_vencimento ?? 10}`,
                        dueDate,
                        amount,
                        balanceAfter,
                        status: getStatus(balanceAfter, dueDate),
                    };
                })
                .filter(Boolean) as Reminder[];

            const boletoReminders = expenses
                .filter((expense) => !expense.cartao_id && expense.data >= today && expense.data <= nextFifteenDays)
                .map((expense) => {
                    const balanceAfter = income - Number(expense.valor);
                    return {
                        id: `expense-${expense.id}`,
                        type: "boleto" as const,
                        title: expense.descricao,
                        detail: "Conta ou boleto cadastrado",
                        dueDate: expense.data,
                        amount: Number(expense.valor),
                        balanceAfter,
                        status: getStatus(balanceAfter, expense.data),
                    };
                });

            setMonthlyIncome(income);
            setReminders([...cardReminders, ...boletoReminders]
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .slice(0, 6));
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

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {reminders.map((reminder) => {
                                const status = statusStyles[reminder.status];
                                return (
                                    <article
                                        key={reminder.id}
                                        className="rounded-lg border p-4"
                                        style={{ borderColor: "var(--card-border)", background: "var(--card-bg-solid)" }}
                                    >
                                        <div className="mb-3 flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                                                    style={{
                                                        background: reminder.type === "cartao"
                                                            ? "color-mix(in srgb, var(--accent) 10%, transparent)"
                                                            : "color-mix(in srgb, var(--warning) 10%, transparent)",
                                                        color: reminder.type === "cartao" ? "var(--accent)" : "var(--warning)",
                                                    }}
                                                >
                                                    {reminder.type === "cartao" ? <CreditCard size={18} /> : <FileText size={18} />}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-foreground">{reminder.title}</h3>
                                                    <p className="text-xs text-muted">{reminder.detail}</p>
                                                </div>
                                            </div>
                                            <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: status.bg, color: status.color }}>
                                                {formatShortDate(reminder.dueDate)}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-xs text-muted">Valor</p>
                                                <p className="font-bold text-foreground">{formatCurrency(reminder.amount)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted">Saldo após pagar</p>
                                                <p className="font-bold" style={{ color: reminder.balanceAfter < 0 ? "var(--danger)" : "var(--foreground)" }}>
                                                    {formatCurrency(reminder.balanceAfter)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center gap-2 text-xs font-semibold" style={{ color: status.color }}>
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
