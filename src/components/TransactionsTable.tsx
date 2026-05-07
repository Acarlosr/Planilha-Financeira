"use client";

import { ArrowUpRight, ArrowDownRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";

const categoryColors: { [key: string]: string } = {
    Salário: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    Moradia: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Freelance: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    Alimentação: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Utilidades: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    Investimentos: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    Outros: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

export default function TransactionsTable() {
    const { recentTransactions: transactions, loading, refetch } = useDashboardOverview();

    const handleDelete = async (id: string) => {
        const separatorIndex = id.indexOf("-");
        const type = id.slice(0, separatorIndex);
        const realId = id.slice(separatorIndex + 1);
        const table = type === "receita" ? "receitas" : "despesas";
        const { error } = await supabase.from(table).delete().eq("id", realId);
        if (error) {
            alert("Erro ao excluir transação. Tente novamente.");
            return;
        }
        refetch();
    };

    return (
        <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Transações Recentes</h2>
                    <p className="text-muted text-sm">Últimas movimentações da sua conta</p>
                </div>
                <Link
                    href="/receitas"
                    className="px-4 py-2 text-sm font-medium text-cyan-400 hover:bg-white/5 rounded-xl transition-colors border border-white/10"
                >
                    Ver todas
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                                Data
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                                Descrição
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                                Categoria
                            </th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider">
                                Valor
                            </th>
                            <th className="text-center py-3 px-4 text-xs font-semibold text-muted uppercase tracking-wider w-16">
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {!loading && transactions.map((transaction) => (
                            <tr
                                key={transaction.id}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                            >
                                <td className="py-4 px-4">
                                    <span className="text-sm text-muted">{transaction.date}</span>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${transaction.type === "entrada"
                                                ? "bg-emerald-500/20"
                                                : "bg-red-500/20"
                                                }`}
                                        >
                                            {transaction.type === "entrada" ? (
                                                <ArrowUpRight size={16} className="text-emerald-400" />
                                            ) : (
                                                <ArrowDownRight size={16} className="text-red-400" />
                                            )}
                                        </div>
                                        <span className="font-medium text-foreground group-hover:text-cyan-400 transition-colors">
                                            {transaction.description}
                                        </span>
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
                                <td className="py-4 px-4 text-right">
                                    <span
                                        className={`font-semibold ${transaction.type === "entrada"
                                            ? "text-emerald-400"
                                            : "text-red-400"
                                            }`}
                                    >
                                        {transaction.type === "entrada" ? "+" : "-"} R${" "}
                                        {transaction.value.toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                        })}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <button
                                        onClick={() => {
                                            if (confirm(`Excluir "${transaction.description}"?`)) {
                                                handleDelete(transaction.id);
                                            }
                                        }}
                                        className="p-2 hover:bg-red-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} className="text-red-400" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {loading && (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-muted">
                                    Carregando transações...
                                </td>
                            </tr>
                        )}
                        {!loading && transactions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-muted">
                                    Nenhuma transação encontrada.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <span className="text-sm text-muted">
                    Mostrando {transactions.length} transações
                </span>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-sm text-muted hover:bg-white/5 rounded-lg transition-colors">
                        Anterior
                    </button>
                    <button className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg">
                        1
                    </button>
                    <button className="px-3 py-1.5 text-sm text-muted hover:bg-white/5 rounded-lg transition-colors">
                        Próximo
                    </button>
                </div>
            </div>
        </div>
    );
}
