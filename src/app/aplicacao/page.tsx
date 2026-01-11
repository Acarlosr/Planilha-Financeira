"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
    Plus,
    TrendingUp,
    Calendar,
    DollarSign,
    Percent,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

// Dados do gráfico de rentabilidade
const rentabilidadeData = [
    { mes: "Jul", valor: 42000 },
    { mes: "Ago", valor: 43200 },
    { mes: "Set", valor: 43800 },
    { mes: "Out", valor: 44100 },
    { mes: "Nov", valor: 44900 },
    { mes: "Dez", valor: 45800 },
    { mes: "Jan", valor: 47200 },
];

// Tipos de investimento
const tiposInvestimento = [
    {
        id: "tesouro",
        nome: "Tesouro Direto",
        saldo: 18500.0,
        rentabilidade: 12.5,
        cor: "from-blue-500 to-blue-400",
        icone: "🏛️",
    },
    {
        id: "acoes",
        nome: "Ações",
        saldo: 15200.0,
        rentabilidade: 18.3,
        cor: "from-green-500 to-green-400",
        icone: "📈",
    },
    {
        id: "fiis",
        nome: "Fundos Imobiliários",
        saldo: 8900.0,
        rentabilidade: 9.7,
        cor: "from-purple-500 to-purple-400",
        icone: "🏢",
    },
    {
        id: "cdb",
        nome: "CDB/LCI/LCA",
        saldo: 3200.0,
        rentabilidade: 11.2,
        cor: "from-amber-500 to-amber-400",
        icone: "💰",
    },
];

interface TransactionItem {
    id: number;
    tipo: "aporte" | "resgate";
    descricao: string;
    valor: number;
    data: string;
    investimento: string;
}

const transacoes: TransactionItem[] = [
    { id: 1, tipo: "aporte", descricao: "Aporte mensal - Tesouro Selic", valor: 1000.0, data: "05/01/2026", investimento: "tesouro" },
    { id: 2, tipo: "aporte", descricao: "Compra ITSA4 - 100 ações", valor: 850.0, data: "08/01/2026", investimento: "acoes" },
    { id: 3, tipo: "aporte", descricao: "Aporte FII HGLG11", valor: 500.0, data: "10/01/2026", investimento: "fiis" },
    { id: 4, tipo: "resgate", descricao: "Resgate parcial CDB", valor: 2000.0, data: "12/01/2026", investimento: "cdb" },
    { id: 5, tipo: "aporte", descricao: "Compra PETR4 - 50 ações", valor: 1200.0, data: "15/12/2025", investimento: "acoes" },
    { id: 6, tipo: "aporte", descricao: "Aporte Tesouro IPCA+", valor: 1500.0, data: "20/12/2025", investimento: "tesouro" },
    { id: 7, tipo: "aporte", descricao: "Aporte FII MXRF11", valor: 600.0, data: "22/12/2025", investimento: "fiis" },
    { id: 8, tipo: "resgate", descricao: "Venda VALE3 - 80 ações", valor: 3500.0, data: "28/12/2025", investimento: "acoes" },
];

export default function AplicacaoPage() {
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const totalInvestido = tiposInvestimento.reduce((sum, inv) => sum + inv.saldo, 0);
    const rentabilidadeMedia = (tiposInvestimento.reduce((sum, inv) => sum + inv.rentabilidade, 0) / tiposInvestimento.length).toFixed(1);

    const getTransacoesFiltradas = () => {
        if (!activeFilter) return transacoes;
        return transacoes.filter((t) => t.investimento === activeFilter);
    };

    return (
        <div className="min-h-screen" style={{ background: "#FDFBF7" }}>
            <Sidebar />

            <main className="ml-64 p-8 transition-all duration-300">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Aplicações</h1>
                            <p className="text-gray-500 mt-1">
                                Acompanhe seus investimentos e rentabilidade
                            </p>
                        </div>
                        <button
                            className="flex items-center gap-2 px-5 py-3 text-white font-medium rounded-xl transition-all hover:shadow-lg"
                            style={{
                                background: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
                                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
                            }}
                        >
                            <Plus size={20} />
                            Novo Aporte
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="soft-card p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)" }}
                                >
                                    <DollarSign size={20} className="text-white" />
                                </div>
                                <p className="text-gray-500 text-sm font-medium">Total Investido</p>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">
                                R$ {totalInvestido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </h2>
                        </div>

                        <div className="soft-card p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)" }}
                                >
                                    <Percent size={20} className="text-white" />
                                </div>
                                <p className="text-gray-500 text-sm font-medium">Rentabilidade Média</p>
                            </div>
                            <h2 className="text-3xl font-bold text-emerald-600">
                                {rentabilidadeMedia}% a.a.
                            </h2>
                        </div>

                        <div className="soft-card p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, #A855F7 0%, #C084FC 100%)" }}
                                >
                                    <TrendingUp size={20} className="text-white" />
                                </div>
                                <p className="text-gray-500 text-sm font-medium">Rendimento (7 dias)</p>
                            </div>
                            <h2 className="text-3xl font-bold text-purple-600">
                                + R$ 1.420,00
                            </h2>
                        </div>
                    </div>
                </header>

                {/* Investment Types */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {tiposInvestimento.map((inv) => {
                        const isActive = activeFilter === inv.id;
                        return (
                            <div
                                key={inv.id}
                                onClick={() => setActiveFilter(isActive ? null : inv.id)}
                                className={`soft-card p-5 cursor-pointer transition-all duration-300 ${isActive ? "ring-2 ring-blue-400 ring-offset-2 scale-105" : "hover:scale-102"
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${inv.cor} text-2xl`}
                                        style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
                                    >
                                        {inv.icone}
                                    </div>
                                    <div className="flex items-center gap-1 text-emerald-600">
                                        <ArrowUpRight size={16} />
                                        <span className="text-sm font-bold">{inv.rentabilidade}%</span>
                                    </div>
                                </div>
                                <h3 className="text-gray-600 text-sm font-medium mb-1">{inv.nome}</h3>
                                <p className="text-2xl font-bold text-gray-800">
                                    R$ {inv.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Chart */}
                <div className="soft-card p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Evolução do Patrimônio</h2>
                            <p className="text-gray-500 text-sm mt-1">Últimos 7 meses</p>
                        </div>
                        <div className="flex items-center gap-2 text-blue-500">
                            <Calendar size={18} />
                            <span className="text-sm font-medium">Jul 2025 - Jan 2026</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={rentabilidadeData}>
                            <defs>
                                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                            <XAxis dataKey="mes" stroke="#9CA3AF" style={{ fontSize: "12px" }} />
                            <YAxis stroke="#9CA3AF" style={{ fontSize: "12px" }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#FFFFFF",
                                    border: "none",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="valor"
                                stroke="#3B82F6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorValor)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Transactions */}
                <div className="soft-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            {activeFilter
                                ? `Transações - ${tiposInvestimento.find((i) => i.id === activeFilter)?.nome}`
                                : "Todas as Transações"}
                        </h2>
                        {activeFilter && (
                            <button
                                onClick={() => setActiveFilter(null)}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Ver todas
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {getTransacoesFiltradas().map((transacao) => {
                            const isAporte = transacao.tipo === "aporte";
                            return (
                                <div
                                    key={transacao.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-11 h-11 rounded-lg flex items-center justify-center ${isAporte ? "bg-emerald-100" : "bg-red-100"
                                                }`}
                                        >
                                            {isAporte ? (
                                                <ArrowUpRight size={20} className="text-emerald-600" />
                                            ) : (
                                                <ArrowDownRight size={20} className="text-red-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{transacao.descricao}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-gray-500">{transacao.data}</span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${isAporte ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                                    }`}>
                                                    {isAporte ? "Aporte" : "Resgate"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`font-bold text-lg ${isAporte ? "text-emerald-600" : "text-red-600"}`}>
                                        {isAporte ? "+" : "-"} R$ {transacao.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {activeFilter && getTransacoesFiltradas().length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-400">Nenhuma transação neste investimento</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
