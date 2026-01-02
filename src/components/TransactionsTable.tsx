"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Transaction {
    id: number;
    date: string;
    description: string;
    category: string;
    value: number;
    type: "entrada" | "saida";
}

const transactions: Transaction[] = [
    {
        id: 1,
        date: "02/01/2026",
        description: "Salário Janeiro",
        category: "Salário",
        value: 8500.0,
        type: "entrada",
    },
    {
        id: 2,
        date: "02/01/2026",
        description: "Aluguel",
        category: "Moradia",
        value: 1800.0,
        type: "saida",
    },
    {
        id: 3,
        date: "01/01/2026",
        description: "Freelance - Projeto Web",
        category: "Freelance",
        value: 3200.0,
        type: "entrada",
    },
    {
        id: 4,
        date: "31/12/2025",
        description: "Supermercado",
        category: "Alimentação",
        value: 650.0,
        type: "saida",
    },
    {
        id: 5,
        date: "30/12/2025",
        description: "Conta de Luz",
        category: "Utilidades",
        value: 180.0,
        type: "saida",
    },
    {
        id: 6,
        date: "28/12/2025",
        description: "Dividendos - Ações",
        category: "Investimentos",
        value: 420.0,
        type: "entrada",
    },
    {
        id: 7,
        date: "27/12/2025",
        description: "Internet",
        category: "Utilidades",
        value: 120.0,
        type: "saida",
    },
    {
        id: 8,
        date: "25/12/2025",
        description: "Presente de Natal",
        category: "Outros",
        value: 350.0,
        type: "saida",
    },
];

const categoryColors: { [key: string]: string } = {
    Salário: "bg-emerald-100 text-emerald-700",
    Moradia: "bg-blue-100 text-blue-700",
    Freelance: "bg-purple-100 text-purple-700",
    Alimentação: "bg-orange-100 text-orange-700",
    Utilidades: "bg-gray-100 text-gray-700",
    Investimentos: "bg-indigo-100 text-indigo-700",
    Outros: "bg-pink-100 text-pink-700",
};

export default function TransactionsTable() {
    return (
        <div className="soft-card p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Transações Recentes</h2>
                    <p className="text-gray-500 text-sm">Últimas movimentações da sua conta</p>
                </div>
                <button
                    className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                >
                    Ver todas
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Data
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Descrição
                            </th>
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Categoria
                            </th>
                            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Valor
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((transaction) => (
                            <tr
                                key={transaction.id}
                                className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group"
                            >
                                <td className="py-4 px-4">
                                    <span className="text-sm text-gray-600">{transaction.date}</span>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${transaction.type === "entrada"
                                                    ? "bg-emerald-100"
                                                    : "bg-red-100"
                                                }`}
                                        >
                                            {transaction.type === "entrada" ? (
                                                <ArrowUpRight size={16} className="text-emerald-600" />
                                            ) : (
                                                <ArrowDownRight size={16} className="text-red-500" />
                                            )}
                                        </div>
                                        <span className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors">
                                            {transaction.description}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${categoryColors[transaction.category] || "bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {transaction.category}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                    <span
                                        className={`font-semibold ${transaction.type === "entrada"
                                                ? "text-emerald-600"
                                                : "text-red-500"
                                            }`}
                                    >
                                        {transaction.type === "entrada" ? "+" : "-"} R${" "}
                                        {transaction.value.toLocaleString("pt-BR", {
                                            minimumFractionDigits: 2,
                                        })}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                    Mostrando 1-8 de 48 transações
                </span>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        Anterior
                    </button>
                    <button className="px-3 py-1.5 text-sm text-white bg-purple-500 rounded-lg">
                        1
                    </button>
                    <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        2
                    </button>
                    <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        3
                    </button>
                    <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        Próximo
                    </button>
                </div>
            </div>
        </div>
    );
}
