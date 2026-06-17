"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";
import Sidebar from "@/components/Sidebar";
import MonthYearPicker from "@/components/MonthYearPicker";
import InvestmentModal from "@/components/InvestmentModal";
import PrintExportButtons from "@/components/PrintExportButtons";
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
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";

// Dados vindos da constant
const { rentabilidade: rentabilidadeData, tipos: tiposInvestimento, transacoes } = aplicacaoData;
type TipoInvestimento = Database["public"]["Tables"]["tipos_investimento"]["Row"];
type Aplicacao = Database["public"]["Tables"]["aplicacoes"]["Row"];

const formatDisplayDate = (value: string) => {
    const [year, month, day] = value.split("-");
    return year && month && day ? `${day}/${month}/${year}` : value;
};

function AplicacaoContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentMonth = searchParams.get("month") ? parseInt(searchParams.get("month")!) : new Date().getMonth() + 1;
    const currentYear = searchParams.get("year") ? parseInt(searchParams.get("year")!) : new Date().getFullYear();

    const handleDateChange = (newDate: { month: number; year: number }) => {
        const params = new URLSearchParams(searchParams);
        params.set("month", newDate.month.toString());
        params.set("year", newDate.year.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [transacoesData, setTransacoesData] = useState(transacoes);
    const [tiposDb, setTiposDb] = useState<TipoInvestimento[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toasts, toast, removeToast } = useToast();

    const loadInvestments = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setTiposDb([]);
                setTransacoesData([]);
                return;
            }

            const [tiposResult, aplicacoesResult] = await Promise.all([
                supabase
                    .from("tipos_investimento")
                    .select("*")
                    .order("created_at", { ascending: true }),
                supabase
                    .from("aplicacoes")
                    .select("*")
                    .eq("user_id", user.id)
                    .order("data", { ascending: false }),
            ]);

            if (tiposResult.error) throw tiposResult.error;
            if (aplicacoesResult.error) throw aplicacoesResult.error;

            setTiposDb(tiposResult.data ?? []);
            setTransacoesData((aplicacoesResult.data ?? []).map((item: Aplicacao) => ({
                id: item.id,
                descricao: item.descricao,
                valor: Number(item.valor),
                data: formatDisplayDate(item.data),
                tipo: item.tipo_transacao,
                investimento: item.tipo_investimento_id,
            })));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao carregar aplicações";
            setError(message);
            setTiposDb([]);
            setTransacoesData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInvestments();
    }, [loadInvestments]);

    const getSaldoPorInvestimento = (investmentId: string) => {
        return transacoesData
            .filter((t) => t.investimento === investmentId)
            .reduce((sum, item) => sum + (item.tipo === "aporte" ? item.valor : -item.valor), 0);
    };
    const tiposSource = tiposDb.length > 0
        ? tiposDb.map((item) => ({
            id: item.id,
            nome: item.nome,
            saldo: 0,
            rentabilidade: 0,
            cor: item.cor,
            icone: item.icone,
        }))
        : tiposInvestimento;
    const tiposComSaldo = tiposSource.map((inv) => ({
        ...inv,
        saldo: getSaldoPorInvestimento(inv.id),
    }));
    const totalInvestido = tiposComSaldo.reduce((sum, inv) => sum + inv.saldo, 0);
    const rentabilidadeMedia = "0.0";
    const rendimentoSeteDias = 0;

    const getTransacoesFiltradas = () => {
        if (!activeFilter) return transacoesData;
        return transacoesData.filter((t) => t.investimento === activeFilter);
    };

    const investmentTypesForModal = useMemo(
        () => tiposDb.map((item) => ({ id: item.id, nome: item.nome, icone: item.icone })),
        [tiposDb]
    );

    const handleSaveInvestment = async (investment: any) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Faça login novamente para registrar aplicações.");
            throw new Error("Usuário não autenticado");
        }

        if (!tiposDb.some((item) => item.id === investment.investmentType)) {
            toast.error("Tipo de investimento inválido. Rode o script de reparo/seed no Supabase e recarregue a página.");
            throw new Error("Tipo de investimento inválido");
        }

        const { error: insertError } = await supabase.from("aplicacoes").insert({
            user_id: user.id,
            descricao: investment.description,
            valor: investment.value,
            data: investment.date,
            tipo_investimento_id: investment.investmentType,
            tipo_transacao: investment.type,
        });

        if (insertError) {
            toast.error(`Erro ao salvar aplicação: ${insertError.message}`);
            throw insertError;
        }

        await loadInvestments();
    };

    return (
        <div className="min-h-screen">
            <Sidebar />

            <main className="md:ml-64 p-4 pt-24 md:p-8 transition-all duration-300">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Aplicações</h1>
                            <p className="text-muted mt-1">
                                {loading ? "Carregando seus investimentos..." : "Acompanhe seus investimentos e rentabilidade"}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <PrintExportButtons title="Aplicações" period={`${currentMonth}/${currentYear}`} />
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="no-print flex items-center gap-2 px-5 py-3 text-foreground font-medium rounded-xl transition-all hover:shadow-lg"
                                style={{
                                    background: "linear-gradient(135deg, #FFD700 0%, #FFC700 100%)",
                                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
                                }}
                            >
                                <Plus size={20} />
                                Novo Aporte
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <p className="text-muted text-sm font-medium">Período de Referência</p>
                            <h2 className="text-xl font-bold text-foreground mt-1">Filtro de Visualização</h2>
                        </div>
                        <MonthYearPicker
                            date={{ month: currentMonth, year: currentYear }}
                            onChange={handleDateChange}
                        />
                    </div>

                    {error && (
                        <div className="mt-4 rounded-xl border p-4 text-sm text-red-300" style={{ borderColor: "rgba(248, 113, 113, 0.24)", background: "rgba(239, 68, 68, 0.08)" }}>
                            Não foi possível carregar aplicações: {error}
                        </div>
                    )}

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
                                + R$ {rendimentoSeteDias.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </h2>
                        </div>
                    </div>
                </header>

                {/* Investment Types */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {tiposComSaldo.map((inv) => {
                        const isActive = activeFilter === inv.id;
                        return (
                            <button
                                type="button"
                                key={inv.id}
                                onClick={() => setActiveFilter(isActive ? null : inv.id)}
                                className={`glass-card p-5 cursor-pointer text-left transition-all duration-300 hover:ring-2 hover:ring-[#7CFF6B] hover:shadow-[0_0_15px_rgba(124,255,107,0.3)] hover:scale-105 ${isActive ? "ring-2 ring-blue-400 ring-offset-2 scale-105" : ""
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
                            </button>
                        );
                    })}
                    {tiposDb.length === 0 && !loading && (
                        <div className="md:col-span-2 lg:col-span-4 glass-card p-6 text-sm text-muted">
                            Nenhum tipo de investimento cadastrado no Supabase. Rode o script de reparo/seed para habilitar novos aportes.
                        </div>
                    )}
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
                                ? `Transações - ${tiposComSaldo.find((i) => i.id === activeFilter)?.nome}`
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
                                    data-print-row="true"
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
                investmentTypes={investmentTypesForModal}
            />
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}

export default function AplicacaoPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <AplicacaoContent />
        </Suspense>
    );
}
