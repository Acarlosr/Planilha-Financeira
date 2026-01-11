"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
    Plus,
    Target,
    Calendar,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    PiggyBank,
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

// Dados do gráfico de evolução
const evolucaoData = [
    { mes: "Jul", valor: 10200 },
    { mes: "Ago", valor: 10850 },
    { mes: "Set", valor: 11100 },
    { mes: "Out", valor: 11450 },
    { mes: "Nov", valor: 11900 },
    { mes: "Dez", valor: 12450 },
    { mes: "Jan", valor: 13100 },
];

// Metas de poupança
const metas = [
    {
        id: "emergencia",
        nome: "Reserva de Emergência",
        valorAtual: 8500.0,
        valorMeta: 15000.0,
        cor: "from-red-500 to-red-400",
        icone: "🚨",
    },
    {
        id: "viagem",
        nome: "Viagem Europa",
        valorAtual: 3200.0,
        valorMeta: 12000.0,
        cor: "from-blue-500 to-blue-400",
        icone: "✈️",
    },
    {
        id: "carro",
        nome: "Carro Novo",
        valorAtual: 1400.0,
        valorMeta: 30000.0,
        cor: "from-purple-500 to-purple-400",
        icone: "🚗",
    },
];

interface TransactionItem {
    id: number;
    tipo: "deposito" | "retirada";
    descricao: string;
    valor: number;
    data: string;
    meta?: string;
}

const transacoes: TransactionItem[] = [
    { id: 1, tipo: "deposito", descricao: "Depósito mensal - Reserva", valor: 650.0, data: "05/01/2026", meta: "emergencia" },
    { id: 2, tipo: "deposito", descricao: "Extra freelance - Viagem", valor: 800.0, data: "08/01/2026", meta: "viagem" },
    { id: 3, tipo: "deposito", descricao: "Economia do mês", valor: 500.0, data: "10/01/2026" },
    { id: 4, tipo: "retirada", descricao: "Emergência médica", valor: 450.0, data: "12/01/2026", meta: "emergencia" },
    { id: 5, tipo: "deposito", descricao: "13º salário - Carro", valor: 1000.0, data: "20/12/2025", meta: "carro" },
    { id: 6, tipo: "deposito", descricao: "Depósito mensal - Reserva", valor: 650.0, data: "05/12/2025", meta: "emergencia" },
    { id: 7, tipo: "deposito", descricao: "Bônus trabalho - Viagem", valor: 1200.0, data: "15/12/2025", meta: "viagem" },
    { id: 8, tipo: "deposito", descricao: "Economia do mês", valor: 550.0, data: "28/12/2025" },
    { id: 9, tipo: "retirada", descricao: "Conserto carro", valor: 380.0, data: "10/12/2025" },
    { id: 10, tipo: "deposito", descricao: "Venda de item - Viagem", valor: 450.0, data: "18/11/2025", meta: "viagem" },
];

export default function PoupancaPage() {
    const [activeMeta, setActiveMeta] = useState<string | null>(null);

    const totalPoupanca = evolucaoData[evolucaoData.length - 1].valor;
    const totalMetas = metas.reduce((sum, meta) => sum + meta.valorMeta, 0);
    const totalEconomizado = metas.reduce((sum, meta) => sum + meta.valorAtual, 0);
    const progressoGeral = ((totalEconomizado / totalMetas) * 100).toFixed(1);

    const getTransacoesFiltradas = () => {
        if (!activeMeta) return transacoes;
        return transacoes.filter((t) => t.meta === activeMeta);
    };

    const calcularProgresso = (atual: number, meta: number) => {
        return ((atual / meta) * 100).toFixed(1);
    };

    return (
        <div className="min-h-screen" style={{ background: "#FDFBF7" }}>
            <Sidebar />

            <main className="ml-64 p-8 transition-all duration-300">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Poupança</h1>
                            <p className="text-gray-500 mt-1">
                                Acompanhe suas economias e metas financeiras
                            </p>
                        </div>
                        <button
                            className="flex items-center gap-2 px-5 py-3 text-white font-medium rounded-xl transition-all hover:shadow-lg"
                            style={{
                                background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
                                boxShadow: "0 4px 15px rgba(245, 158, 11, 0.4)",
                            }}
                        >
                            <Plus size={20} />
                            Novo Depósito
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="soft-card p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)" }}
                                >
                                    <PiggyBank size={20} className="text-white" />
                                </div>
                                <p className="text-gray-500 text-sm font-medium">Total Poupado</p>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">
                                R$ {totalPoupanca.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </h2>
                        </div>

                        <div className="soft-card p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)" }}
                                >
                                    <Target size={20} className="text-white" />
                                </div>
                                <p className="text-gray-500 text-sm font-medium">Progresso das Metas</p>
                            </div>
                            <h2 className="text-3xl font-bold text-emerald-600">
                                {progressoGeral}%
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
                                <p className="text-gray-500 text-sm font-medium">Crescimento (30d)</p>
                            </div>
                            <h2 className="text-3xl font-bold text-purple-600">
                                + R$ 650,00
                            </h2>
                        </div>
                    </div>
                </header>

                {/* Metas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {metas.map((meta) => {
                        const progresso = calcularProgresso(meta.valorAtual, meta.valorMeta);
                        const isActive = activeMeta === meta.id;
                        const faltante = meta.valorMeta - meta.valorAtual;

                        return (
                            <div
                                key={meta.id}
                                onClick={() => setActiveMeta(isActive ? null : meta.id)}
                                className={`soft-card p-5 cursor-pointer transition-all duration-300 ${isActive ? "ring-2 ring-amber-400 ring-offset-2 scale-105" : "hover:scale-102"
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${meta.cor} text-2xl`}
                                        style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
                                    >
                                        {meta.icone}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Progresso</p>
                                        <p className="text-lg font-bold text-gray-800">{progresso}%</p>
                                    </div>
                                </div>

                                <h3 className="text-gray-800 font-bold mb-2">{meta.nome}</h3>

                                <div className="space-y-1 mb-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Atual</span>
                                        <span className="font-semibold text-gray-800">
                                            R$ {meta.valorAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Meta</span>
                                        <span className="font-semibold text-gray-800">
                                            R$ {meta.valorMeta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Faltam</span>
                                        <span className="font-semibold text-amber-600">
                                            R$ {faltante.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${progresso}%`,
                                            background: `linear-gradient(to right, ${meta.cor.split(" ")[1]}, ${meta.cor.split(" ")[3]})`,
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Chart */}
                <div className="soft-card p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Evolução da Poupança</h2>
                            <p className="text-gray-500 text-sm mt-1">Últimos 7 meses</p>
                        </div>
                        <div className="flex items-center gap-2 text-amber-500">
                            <Calendar size={18} />
                            <span className="text-sm font-medium">Jul 2025 - Jan 2026</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={evolucaoData}>
                            <defs>
                                <linearGradient id="colorPoupanca" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
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
                                stroke="#F59E0B"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorPoupanca)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Transactions */}
                <div className="soft-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            {activeMeta
                                ? `Transações - ${metas.find((m) => m.id === activeMeta)?.nome}`
                                : "Todas as Transações"}
                        </h2>
                        {activeMeta && (
                            <button
                                onClick={() => setActiveMeta(null)}
                                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                            >
                                Ver todas
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {getTransacoesFiltradas().map((transacao) => {
                            const isDeposito = transacao.tipo === "deposito";
                            return (
                                <div
                                    key={transacao.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-11 h-11 rounded-lg flex items-center justify-center ${isDeposito ? "bg-emerald-100" : "bg-red-100"
                                                }`}
                                        >
                                            {isDeposito ? (
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
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${isDeposito ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                                    }`}>
                                                    {isDeposito ? "Depósito" : "Retirada"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`font-bold text-lg ${isDeposito ? "text-emerald-600" : "text-red-600"}`}>
                                        {isDeposito ? "+" : "-"} R$ {transacao.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {activeMeta && getTransacoesFiltradas().length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-400">Nenhuma transação nesta meta</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
