"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Trash2, Inbox, ListFilter, Check } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useDashboardOverview, type RecentTransaction } from "@/hooks/useDashboardOverview";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";

const PAGE_SIZE = 8;

type TypeFilter = "todas" | "entrada" | "saida";

const filterLabels: Record<TypeFilter, string> = {
    todas: "Todas",
    entrada: "Entradas",
    saida: "Saídas",
};

const categoryColors: { [key: string]: string } = {
    Receita: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    Despesa: "bg-rose-500/15 text-rose-400 border-rose-500/25",
    Salário: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
    Moradia: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Freelance: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    Alimentação: "bg-sky-500/15 text-sky-300 border-sky-500/25",
    Utilidades: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    Investimentos: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    Outros: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

const formatBRL = (value: number) =>
    value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });

const todayISO = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

// O banco só guarda a data (sem hora), então a menor granularidade é o dia
const friendlyDate = (isoDate: string) => {
    const [y, m, d] = isoDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today.getTime() - date.getTime()) / 86_400_000);
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays === -1) return "Amanhã";
    if (diffDays > 1 && diffDays < 7) return `Há ${diffDays} dias`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

function TypeIcon({ type }: { type: RecentTransaction["type"] }) {
    const isIncome = type === "entrada";
    const color = isIncome ? "var(--success)" : "var(--danger)";
    return (
        <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{
                background: `color-mix(in srgb, ${color} 14%, transparent)`,
                boxShadow: `0 0 12px color-mix(in srgb, ${color} 18%, transparent)`,
            }}
            aria-hidden="true"
        >
            {isIncome ? (
                <ArrowUpRight size={16} style={{ color }} />
            ) : (
                <ArrowDownRight size={16} style={{ color }} />
            )}
        </div>
    );
}

function StatusBadge({ transaction }: { transaction: RecentTransaction }) {
    const pending = transaction.isoDate > todayISO();
    const label = pending ? "Pendente" : transaction.type === "entrada" ? "Recebido" : "Pago";
    const color = pending ? "var(--warning)" : "var(--success)";
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border"
            style={{
                color,
                borderColor: `color-mix(in srgb, ${color} 30%, transparent)`,
                background: `color-mix(in srgb, ${color} 10%, transparent)`,
            }}
        >
            <span
                className={`w-1.5 h-1.5 rounded-full ${pending ? "animate-pulse" : ""}`}
                style={{ background: color }}
                aria-hidden="true"
            />
            {label}
        </span>
    );
}

function ValueLabel({ transaction }: { transaction: RecentTransaction }) {
    const isIncome = transaction.type === "entrada";
    return (
        <span
            className="font-mono tabular-nums font-semibold"
            style={{ color: isIncome ? "var(--success)" : "var(--danger)" }}
        >
            {isIncome ? "+" : "-"} R$ {formatBRL(transaction.value)}
        </span>
    );
}

export default function TransactionsTable() {
    const { recentTransactions: transactions, loading, refetch } = useDashboardOverview();
    const { toasts, toast, removeToast } = useToast();
    const [filter, setFilter] = useState<TypeFilter>("todas");
    const [filterOpen, setFilterOpen] = useState(false);
    const [page, setPage] = useState(1);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!filterOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setFilterOpen(false);
            }
        };
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") setFilterOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [filterOpen]);

    const filtered = useMemo(
        () => (filter === "todas" ? transactions : transactions.filter((t) => t.type === filter)),
        [transactions, filter]
    );

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const selectFilter = (value: TypeFilter) => {
        setFilter(value);
        setPage(1);
        setFilterOpen(false);
    };

    const handleDelete = async (id: string) => {
        const separatorIndex = id.indexOf("-");
        const type = id.slice(0, separatorIndex);
        const realId = id.slice(separatorIndex + 1);
        const table = type === "receita" ? "receitas" : "despesas";
        const { error } = await supabase.from(table).delete().eq("id", realId);
        if (error) {
            toast.error("Erro ao excluir transação. Tente novamente.");
            return;
        }
        refetch();
    };

    const deleteButton = (transaction: RecentTransaction, alwaysVisible = false) => (
        <button
            onClick={() => {
                if (confirm(`Excluir "${transaction.description}"?`)) {
                    handleDelete(transaction.id);
                }
            }}
            aria-label={`Excluir transação ${transaction.description}`}
            className={`sidebar-focus p-2 hover:bg-red-500/20 rounded-lg transition-all ${
                alwaysVisible ? "" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
            }`}
        >
            <Trash2 size={16} className="text-red-400" aria-hidden="true" />
        </button>
    );

    const emptyState = (
        <div className="flex flex-col items-center justify-center py-14 text-center">
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                    background:
                        "linear-gradient(135deg, color-mix(in srgb, var(--secondary) 15%, transparent), color-mix(in srgb, var(--accent) 10%, transparent))",
                }}
                aria-hidden="true"
            >
                <Inbox size={28} style={{ color: "var(--secondary)" }} />
            </div>
            {filter === "todas" ? (
                <>
                    <p className="font-semibold text-foreground mb-1">Nenhuma transação ainda</p>
                    <p className="text-sm text-muted mb-5">Registre sua primeira receita ou despesa para começar.</p>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/receitas"
                            className="sidebar-focus px-4 py-2 text-sm font-semibold text-black rounded-lg transition-all hover:brightness-105"
                            style={{ background: "linear-gradient(135deg, var(--accent), var(--secondary))" }}
                        >
                            Nova receita
                        </Link>
                        <Link
                            href="/despesas"
                            className="sidebar-focus px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-white/5"
                            style={{ color: "var(--foreground)", borderColor: "var(--card-border)" }}
                        >
                            Nova despesa
                        </Link>
                    </div>
                </>
            ) : (
                <>
                    <p className="font-semibold text-foreground mb-1">Nada por aqui</p>
                    <p className="text-sm text-muted mb-5">
                        Nenhuma transação encontrada para o filtro “{filterLabels[filter]}”.
                    </p>
                    <button
                        onClick={() => selectFilter("todas")}
                        className="sidebar-focus px-4 py-2 text-sm font-medium rounded-lg border transition-colors hover:bg-white/5"
                        style={{ color: "var(--accent)", borderColor: "var(--card-border)" }}
                    >
                        Limpar filtro
                    </button>
                </>
            )}
        </div>
    );

    const skeletonRow = (key: number) => (
        <tr key={key} className="border-b border-white/5">
            <td className="py-4 px-4"><div className="skeleton h-4 w-16" /></td>
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    <div className="skeleton h-9 w-9 rounded-lg" />
                    <div className="skeleton h-4 w-40" />
                </div>
            </td>
            <td className="py-4 px-4"><div className="skeleton h-6 w-20 rounded-full" /></td>
            <td className="py-4 px-4"><div className="skeleton h-6 w-24 rounded-full" /></td>
            <td className="py-4 px-4"><div className="skeleton h-4 w-24 ml-auto" /></td>
            <td className="py-4 px-4" />
        </tr>
    );

    const skeletonCard = (key: number) => (
        <li key={key} className="rounded-xl border border-white/5 p-4">
            <div className="flex items-center gap-3">
                <div className="skeleton h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-3/5" />
                    <div className="skeleton h-3 w-2/5" />
                </div>
                <div className="skeleton h-4 w-20" />
            </div>
        </li>
    );

    return (
        <>
        <div className="glass-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Transações Recentes</h2>
                    <p className="text-muted text-sm">Últimas movimentações da sua conta</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setFilterOpen(!filterOpen)}
                            aria-haspopup="menu"
                            aria-expanded={filterOpen}
                            aria-label="Filtrar transações por tipo"
                            className="sidebar-focus flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-white/5 rounded-lg transition-colors border"
                            style={{ color: "var(--foreground)", borderColor: "var(--card-border)" }}
                        >
                            <ListFilter size={16} aria-hidden="true" />
                            {filterLabels[filter]}
                        </button>
                        {filterOpen && (
                            <div
                                role="menu"
                                aria-label="Tipo de transação"
                                className="dropdown-fade absolute right-0 mt-2 w-40 rounded-lg overflow-hidden z-20 border"
                                style={{
                                    background: "color-mix(in srgb, var(--card-bg-solid) 88%, transparent)",
                                    borderColor: "var(--card-border)",
                                    backdropFilter: "blur(16px)",
                                    boxShadow: "var(--shadow-glass)",
                                }}
                            >
                                {(Object.keys(filterLabels) as TypeFilter[]).map((value) => (
                                    <button
                                        key={value}
                                        role="menuitemradio"
                                        aria-checked={filter === value}
                                        onClick={() => selectFilter(value)}
                                        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors"
                                        style={{ color: filter === value ? "var(--accent)" : "var(--text-secondary)" }}
                                    >
                                        {filterLabels[value]}
                                        {filter === value && <Check size={14} aria-hidden="true" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <Link
                        href="/receitas"
                        className="sidebar-focus px-4 py-2 text-sm font-medium hover:bg-white/5 rounded-lg transition-colors border"
                        style={{ color: "var(--accent)", borderColor: "var(--card-border)" }}
                    >
                        Ver todas
                    </Link>
                </div>
            </div>

            {/* Desktop: tabela */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                    <caption className="sr-only">Transações recentes com data, descrição, categoria, status e valor</caption>
                    <thead>
                        <tr className="border-b border-white/10">
                            <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                                Data
                            </th>
                            <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                                Descrição
                            </th>
                            <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                                Categoria
                            </th>
                            <th scope="col" className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                                Valor
                            </th>
                            <th scope="col" className="text-center py-3 px-4 w-16">
                                <span className="sr-only">Ações</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && Array.from({ length: 5 }, (_, i) => skeletonRow(i))}
                        {!loading && pageItems.map((transaction) => (
                            <tr
                                key={transaction.id}
                                className="tx-row border-b border-white/5 group"
                                style={{
                                    boxShadow: `inset 3px 0 0 ${
                                        transaction.type === "entrada" ? "var(--success)" : "var(--danger)"
                                    }`,
                                }}
                            >
                                <td className="py-4 px-4">
                                    <span className="text-sm text-muted" title={transaction.date}>
                                        {friendlyDate(transaction.isoDate)}
                                    </span>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <TypeIcon type={transaction.type} />
                                        <span className="font-medium text-foreground">{transaction.description}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium border ${categoryColors[transaction.category] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
                                            }`}
                                    >
                                        {transaction.category}
                                    </span>
                                </td>
                                <td className="py-4 px-4">
                                    <StatusBadge transaction={transaction} />
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <ValueLabel transaction={transaction} />
                                </td>
                                <td className="py-4 px-4 text-center">{deleteButton(transaction)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && filtered.length === 0 && emptyState}
            </div>

            {/* Mobile: cards */}
            <ul className="md:hidden space-y-3">
                {loading && Array.from({ length: 3 }, (_, i) => skeletonCard(i))}
                {!loading && pageItems.map((transaction) => (
                    <li
                        key={transaction.id}
                        className="tx-card rounded-xl border border-white/5 p-4"
                        style={{
                            borderLeft: `3px solid ${
                                transaction.type === "entrada" ? "var(--success)" : "var(--danger)"
                            }`,
                        }}
                    >
                        <div className="flex items-start gap-3">
                            <TypeIcon type={transaction.type} />
                            <div className="min-w-0 flex-1">
                                <p className="font-medium text-foreground truncate">{transaction.description}</p>
                                <p className="text-xs text-muted mt-0.5" title={transaction.date}>
                                    {friendlyDate(transaction.isoDate)} · {transaction.category}
                                </p>
                                <div className="mt-2">
                                    <StatusBadge transaction={transaction} />
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <ValueLabel transaction={transaction} />
                                {deleteButton(transaction, true)}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            {!loading && filtered.length === 0 && <div className="md:hidden">{emptyState}</div>}

            {/* Paginação */}
            {!loading && filtered.length > 0 && (
                <nav
                    aria-label="Paginação de transações"
                    className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-white/10"
                >
                    <span className="text-sm text-muted">
                        Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} de {filtered.length}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="sidebar-focus px-3 py-1.5 text-sm text-muted hover:bg-white/5 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
                        >
                            Anterior
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                            <button
                                key={n}
                                onClick={() => setPage(n)}
                                aria-current={n === currentPage ? "page" : undefined}
                                aria-label={`Página ${n}`}
                                className={`sidebar-focus px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                    n === currentPage ? "text-white" : "text-muted hover:bg-white/5"
                                }`}
                                style={n === currentPage ? { background: "var(--accent)" } : undefined}
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="sidebar-focus px-3 py-1.5 text-sm text-muted hover:bg-white/5 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
                        >
                            Próximo
                        </button>
                    </div>
                </nav>
            )}
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
}
