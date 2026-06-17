"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MonthYearPicker from "@/components/MonthYearPicker";
import SavingsModal from "@/components/SavingsModal";
import PrintExportButtons from "@/components/PrintExportButtons";
import { supabase } from "@/lib/supabase";
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
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import { poupancaData, type MetaPoupanca, type Transacao } from "@/constants/financialData";

const { evolucao: emptySavingsEvolution } = poupancaData;

type SavingsTransaction = Transacao & {
    isoDate: string;
};

const monthLabels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const formatDisplayDate = (value: string) => {
    const [year, month, day] = value.split("-");
    return year && month && day ? `${day}/${month}/${year}` : value;
};

const buildSavingsEvolution = (transactions: SavingsTransaction[]) => {
    const now = new Date();
    let runningBalance = 0;

    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - 6 + index, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        runningBalance += transactions
            .filter((item) => {
                const [itemYear, itemMonth] = item.isoDate.split("-").map(Number);
                return itemYear === year && itemMonth === month;
            })
            .reduce((sum, item) => sum + (item.tipo === "deposito" ? item.valor : -item.valor), 0);

        return {
            mes: monthLabels[date.getMonth()],
            valor: Math.max(runningBalance, 0),
        };
    });
};

function PoupancaContent() {
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

    const [activeMeta, setActiveMeta] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [metas, setMetas] = useState<MetaPoupanca[]>([]);
    const [transacoesData, setTransacoesData] = useState<SavingsTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toasts, toast, removeToast } = useToast();

    const loadSavings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setMetas([]);
                setTransacoesData([]);
                return;
            }

            const [metasResult, poupancaResult] = await Promise.all([
                supabase
                    .from("metas_poupanca")
                    .select("id, nome, valor_meta, valor_atual, icone, cor")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: true }),
                supabase
                    .from("poupanca")
                    .select("id, descricao, valor, data, tipo_transacao, meta_id")
                    .eq("user_id", user.id)
                    .order("data", { ascending: false }),
            ]);

            if (metasResult.error) throw metasResult.error;
            if (poupancaResult.error) throw poupancaResult.error;

            setMetas((metasResult.data ?? []).map((meta) => ({
                id: meta.id,
                nome: meta.nome,
                valorMeta: Number(meta.valor_meta),
                valorAtual: Number(meta.valor_atual),
                cor: meta.cor,
                icone: meta.icone,
            })));

            setTransacoesData((poupancaResult.data ?? []).map((item) => ({
                id: item.id,
                descricao: item.descricao,
                valor: Number(item.valor),
                data: formatDisplayDate(item.data),
                isoDate: item.data,
                tipo: item.tipo_transacao,
                meta: item.meta_id ?? "",
            })));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao carregar poupança");
            setMetas([]);
            setTransacoesData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSavings();
    }, [loadSavings]);

    const totalPoupanca = transacoesData.reduce((sum, item) => sum + (item.tipo === "deposito" ? item.valor : -item.valor), 0);
    const totalMetas = metas.reduce((sum, meta) => sum + meta.valorMeta, 0);
    const totalEconomizado = metas.reduce((sum, meta) => sum + meta.valorAtual, 0);
    const progressoGeral = totalMetas > 0 ? ((totalEconomizado / totalMetas) * 100).toFixed(1) : "0.0";
    const evolucaoData = useMemo(
        () => transacoesData.length > 0 ? buildSavingsEvolution(transacoesData) : emptySavingsEvolution,
        [transacoesData]
    );
    const crescimentoTrintaDias = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        return transacoesData
            .filter((item) => new Date(`${item.isoDate}T00:00:00`) >= thirtyDaysAgo)
            .reduce((sum, item) => sum + (item.tipo === "deposito" ? item.valor : -item.valor), 0);
    }, [transacoesData]);

    const getTransacoesFiltradas = () => {
        if (!activeMeta) return transacoesData;
        return transacoesData.filter((t) => t.meta === activeMeta);
    };

    const handleSaveSaving = async (saving: any) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast.error("Faça login novamente para registrar poupança.");
            throw new Error("Usuário não autenticado");
        }

        const { error: insertError } = await supabase.from("poupanca").insert({
            user_id: user.id,
            descricao: saving.description,
            valor: saving.value,
            data: saving.date,
            tipo_transacao: saving.type,
            meta_id: saving.meta || null,
        });

        if (insertError) {
            toast.error(`Erro ao salvar aporte: ${insertError.message}`);
            throw insertError;
        }

        if (saving.meta) {
            const selectedMeta = metas.find((meta) => meta.id === saving.meta);
            if (selectedMeta) {
                await supabase
                    .from("metas_poupanca")
                    .update({
                        valor_atual: saving.type === "deposito"
                            ? selectedMeta.valorAtual + saving.value
                            : Math.max(selectedMeta.valorAtual - saving.value, 0),
                    })
                    .eq("id", saving.meta)
                    .eq("user_id", user.id);
            }
        }

        await loadSavings();
    };

    const handleDeleteTransaction = (id: number | string) => {
        setTransacoesData(prev => prev.filter(t => t.id !== id));
    };

    const calcularProgresso = (atual: number, meta: number) => {
        return meta > 0 ? ((atual / meta) * 100).toFixed(1) : "0.0";
    };

    return (
        <div className="min-h-screen">
            <Sidebar />

            <main className="md:ml-64 p-4 pt-24 md:p-8 transition-all duration-300">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Poupança</h1>
                            <p className="text-muted mt-1">
                                {loading ? "Carregando suas economias..." : "Acompanhe suas economias e metas financeiras"}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <PrintExportButtons title="Poupança" period={`${currentMonth}/${currentYear}`} />
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="no-print flex items-center gap-2 px-5 py-3 text-foreground font-medium rounded-xl transition-all hover:shadow-lg"
                                style={{
                                    background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
                                    boxShadow: "0 4px 15px rgba(245, 158, 11, 0.4)",
                                }}
                            >
                                <Plus size={20} />
                                Novo Depósito
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
                            Não foi possível carregar a poupança: {error}
                        </div>
                    )}

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
                                {crescimentoTrintaDias >= 0 ? "+" : "-"} R$ {Math.abs(crescimentoTrintaDias).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </h2>
                        </div>
                    </div>
                </header>

                {/* Metas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {metas.length === 0 && (
                        <div className="md:col-span-3 glass-card p-6 text-sm text-muted">
                            Nenhuma meta de poupança cadastrada. Os valores ficam zerados até você registrar depósitos ou metas reais.
                        </div>
                    )}
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
                                    data-print-row="true"
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

                    {getTransacoesFiltradas().length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted">{activeMeta ? "Nenhuma transação nesta meta" : "Nenhuma movimentação de poupança registrada"}</p>
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
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}

export default function PoupancaPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <PoupancaContent />
        </Suspense>
    );
}
