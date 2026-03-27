"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import SavingsModal from "@/components/SavingsModal";
import {
    Plus,
    Target,
    Calendar,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    PiggyBank,
    Trash2,
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

import { poupancaData } from "@/constants/financialData";

// Dados do gráfico de evolução e metas vindos da constant
const { evolucao: evolucaoData, metas, transacoes } = poupancaData;

export default function PoupancaPage() {
    const [activeMeta, setActiveMeta] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transacoesData, setTransacoesData] = useState(transacoes);

    const totalPoupanca = evolucaoData[evolucaoData.length - 1].valor;
    const totalMetas = metas.reduce((sum, meta) => sum + meta.valorMeta, 0);
    const totalEconomizado = metas.reduce((sum, meta) => sum + meta.valorAtual, 0);
    const progressoGeral = ((totalEconomizado / totalMetas) * 100).toFixed(1);

    const getTransacoesFiltradas = () => {
        if (!activeMeta) return transacoesData;
        return transacoesData.filter((t) => t.meta === activeMeta);
    };

    const handleSaveSaving = (saving: any) => {
        const newTransaction = {
            id: Date.now(),
            descricao: saving.description,
            valor: saving.value,
            data: saving.date,
            tipo: saving.type,
            meta: saving.meta,
        };
        setTransacoesData(prev => [newTransaction, ...prev]);
    };

    const handleDeleteTransaction = (id: number) => {
        setTransacoesData(prev => prev.filter(t => t.id !== id));
    };

    const calcularProgresso = (atual: number, meta: number) => {
        return ((atual / meta) * 100).toFixed(1);
    };

    return (
        <div className="min-h-screen">
            <Sidebar />

            <main className="ml-64 p-8 transition-all duration-300">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Poupança</h1>
                            <p className="text-muted mt-1">
                                Acompanhe suas economias e metas financeiras
                            </p>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-3 text-foreground font-medium rounded-xl transition-all hover:shadow-lg"
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
                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)" }}
                                >
                                    <PiggyBank size={20} className="text-white" />
                                </div>
                                <p className="text-muted text-sm font-medium">Total Poupado</p>
                            </div>
                            <h2 className="text-3xl font-bold text-foreground">
                                R$ {totalPoupanca.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </h2>
                        </div>

                        <div className="glass-card p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)" }}
                                >
                                    <Target size={20} className="text-white" />
                                </div>
                                <p className="text-muted text-sm font-medium">Progresso das Metas</p>
                            </div>
                            <h2 className="text-3xl font-bold text-emerald-400">
                                {progressoGeral}%
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
                                <p className="text-muted text-sm font-medium">Crescimento (30d)</p>
                            </div>
                            <h2 className="text-3xl font-bold text-[#FFD700]">
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
                                className={`glass-card p-5 cursor-pointer transition-all duration-300 ${isActive ? "ring-2 ring-amber-400 ring-offset-2 scale-105" : "hover:scale-102"
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
                                        <p className="text-xs text-muted">Progresso</p>
                                        <p className="text-lg font-bold text-foreground">{progresso}%</p>
                                    </div>
                                </div>

                                <h3 className="text-foreground font-bold mb-2">{meta.nome}</h3>

                                <div className="space-y-1 mb-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">Atual</span>
                                        <span className="font-semibold text-foreground">
                                            R$ {meta.valorAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">Meta</span>
                                        <span className="font-semibold text-foreground">
                                            R$ {meta.valorMeta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted">Faltam</span>
                                        <span className="font-semibold text-amber-400">
                                            R$ {faltante.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
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
                <div className="glass-card p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Evolução da Poupança</h2>
                            <p className="text-muted text-sm mt-1">Últimos 7 meses</p>
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
                                fill="url(#colorPoupanca)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Transactions */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-foreground">
                            {activeMeta
                                ? `Transações - ${metas.find((m) => m.id === activeMeta)?.nome}`
                                : "Todas as Transações"}
                        </h2>
                        {activeMeta && (
                            <button
                                onClick={() => setActiveMeta(null)}
                                className="text-sm text-[#FFD700] hover:text-[#FFC700] font-medium"
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
                                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-11 h-11 rounded-lg flex items-center justify-center ${isDeposito ? "bg-emerald-500/20" : "bg-red-500/20"
                                                }`}
                                        >
                                            {isDeposito ? (
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
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${isDeposito ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                                                    }`}>
                                                    {isDeposito ? "Depósito" : "Retirada"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold text-lg ${isDeposito ? "text-emerald-400" : "text-red-400"}`}>
                                            {isDeposito ? "+" : "-"} R$ {transacao.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </span>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Excluir "${transacao.descricao}"?`)) {
                                                    handleDeleteTransaction(transacao.id);
                                                }
                                            }}
                                            className="p-2 hover:bg-red-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} className="text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {activeMeta && getTransacoesFiltradas().length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted">Nenhuma transação nesta meta</p>
                        </div>
                    )}
                </div>
            </main>

            <SavingsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveSaving}
                metas={metas.map(m => ({ id: m.id, nome: m.nome, icone: m.icone }))}
            />
        </div>
    );
}
