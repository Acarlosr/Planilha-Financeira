"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import InvestmentModal from "@/components/InvestmentModal";
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

import { aplicacaoData } from "@/constants/financialData";

// Dados vindos da constant
const { rentabilidade: rentabilidadeData, tipos: tiposInvestimento, transacoes } = aplicacaoData;

export default function AplicacaoPage() {
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transacoesData, setTransacoesData] = useState(transacoes);

    const totalInvestido = tiposInvestimento.reduce((sum, inv) => sum + inv.saldo, 0);
    const rentabilidadeMedia = (tiposInvestimento.reduce((sum, inv) => sum + inv.rentabilidade, 0) / tiposInvestimento.length).toFixed(1);

    const getTransacoesFiltradas = () => {
        if (!activeFilter) return transacoesData;
        return transacoesData.filter((t) => t.investimento === activeFilter);
    };

    const handleSaveInvestment = (investment: any) => {
        const newTransaction = {
            id: Date.now(),
            descricao: investment.description,
            valor: investment.value,
            data: investment.date,
            tipo: investment.type,
            investimento: investment.investmentType,
        };
        setTransacoesData(prev => [newTransaction, ...prev]);
    };

    return (
        <div className="min-h-screen">
            <Sidebar />

            <main className="ml-64 p-8 transition-all duration-300">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Aplicações</h1>
                            <p className="text-muted mt-1">
                                Acompanhe seus investimentos e rentabilidade
                            </p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-3 text-foreground font-medium rounded-xl transition-all hover:shadow-lg"
                            style={{
                                background: "linear-gradient(135deg, #FFD700 0%, #FFC700 100%)",
                                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
                            }}
                        >
                            <Plus size={20} />
                            Novo Aporte
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFC700 100%)" }}
                                >
                                    <DollarSign size={20} className="text-white" />
                                </div>
                                <p className="text-muted text-sm font-medium">Total Investido</p>
                            </div>
                            <h2 className="text-3xl font-bold text-foreground">
                                R$ {totalInvestido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </h2>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)" }}
                                >
                                    <Percent size={20} className="text-white" />
                                </div>
                                <p className="text-muted text-sm font-medium">Rentabilidade Média</p>
                            </div>
                            <h2 className="text-3xl font-bold text-emerald-400">
                                {rentabilidadeMedia}% a.a.
                            </h2>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, #A855F7 0%, #C084FC 100%)" }}
                                >
                                    <TrendingUp size={20} className="text-white" />
                                </div>
                                <p className="text-muted text-sm font-medium">Rendimento (7 dias)</p>
                            </div>
                            <h2 className="text-3xl font-bold text-[#FFD700]">
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
                            <Link href={`/aplicacao/${inv.id}`} key={inv.id}>
                                <div
                                    className={`glass-card p-5 cursor-pointer transition-all duration-300 hover:ring-2 hover:ring-[#7CFF6B] hover:shadow-[0_0_15px_rgba(124,255,107,0.3)] hover:scale-105 ${isActive ? "ring-2 ring-blue-400 ring-offset-2 scale-105" : ""
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${inv.cor} text-2xl`}
                                            style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" }}
                                        >
                                            {inv.icone}
                                        </div>
                                        <div className="flex items-center gap-1 text-emerald-400">
                                            <ArrowUpRight size={16} />
                                            <span className="text-sm font-bold">{inv.rentabilidade}%</span>
                                        </div>
                                    </div>
                                    <h3 className="text-muted text-sm font-medium mb-1">{inv.nome}</h3>
                                    <p className="text-2xl font-bold text-foreground">
                                        R$ {inv.saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Chart */}
                <div className="glass-card p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Evolução do Patrimônio</h2>
                            <p className="text-muted text-sm mt-1">Últimos 7 meses</p>
                        </div>
                        <div className="flex items-center gap-2 text-[#FFD700]">
                            <Calendar size={18} />
                            <span className="text-sm font-medium">Jul 2025 - Jan 2026</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={rentabilidadeData}>
                            <defs>
                                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2D5F3F" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#2D5F3F" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="mes" stroke="#94a3b8" style={{ fontSize: "12px" }} />
                            <YAxis stroke="#94a3b8" style={{ fontSize: "12px" }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "rgba(10, 22, 40, 0.95)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    borderRadius: "12px",
                                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                                    color: "#fff"
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="valor"
                                stroke="#C7FF3D"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorValor)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Transactions */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-foreground">
                            {activeFilter
                                ? `Transações - ${tiposInvestimento.find((i) => i.id === activeFilter)?.nome}`
                                : "Todas as Transações"}
                        </h2>
                        {activeFilter && (
                            <button
                                onClick={() => setActiveFilter(null)}
                                className="text-sm text-[#FFD700] hover:text-[#FFC700] font-medium"
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
                                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-11 h-11 rounded-lg flex items-center justify-center ${isAporte ? "bg-emerald-500/20" : "bg-red-500/20"
                                                }`}
                                        >
                                            {isAporte ? (
                                                <ArrowUpRight size={20} className="text-emerald-400" />
                                            ) : (
                                                <ArrowDownRight size={20} className="text-red-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{transacao.descricao}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-muted">{transacao.data}</span>
                                                <span className="text-xs text-muted">•</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${isAporte ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                                                    }`}>
                                                    {isAporte ? "Aporte" : "Resgate"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`font-bold text-lg ${isAporte ? "text-emerald-400" : "text-red-400"}`}>
                                        {isAporte ? "+" : "-"} R$ {transacao.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {activeFilter && getTransacoesFiltradas().length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted">Nenhuma transação neste investimento</p>
                        </div>
                    )}
                </div>
            </main>

            <InvestmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveInvestment}
            />
        </div>
    );
}
