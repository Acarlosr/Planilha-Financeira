"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import UserMenu from "@/components/UserMenu";
import ThemeToggle from "@/components/ThemeToggle";
import CardFormModal from "@/components/CardFormModal";
import { useCartoes } from "@/hooks/useCartoes";
import { supabase } from "@/lib/supabase";
import {
    CreditCard,
    Plus,
    Trash2,
    Wallet,
    CalendarClock,
    TrendingDown,
    Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";

interface FaturaPorCartao {
    cartaoId: string;
    total: number;
    quantidade: number;
}

const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const getBandeiraGradient = (bandeira: string) => {
    switch (bandeira.toLowerCase()) {
        case "visa":
            return "linear-gradient(135deg, #002890 0%, #0098F0 100%)";
        case "mastercard":
            return "linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)";
        case "amex":
            return "linear-gradient(135deg, #0098F0 0%, #54E0FF 100%)";
        case "elo":
            return "linear-gradient(135deg, #111827 0%, #64748b 100%)";
        default:
            return "linear-gradient(135deg, #374151 0%, #9ca3af 100%)";
    }
};

export default function CartoesPage() {
    const { cartoes, loading, refetch } = useCartoes();
    const [modalOpen, setModalOpen] = useState(false);
    const [faturas, setFaturas] = useState<FaturaPorCartao[]>([]);
    const [faturasLoading, setFaturasLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { toasts, toast, removeToast } = useToast();

    // Carrega o total da fatura aberta (despesas do mês vinculadas a cada cartão)
    const carregarFaturas = useCallback(async () => {
        try {
            setFaturasLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setFaturas([]);
                return;
            }

            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
                .toISOString()
                .slice(0, 10);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                .toISOString()
                .slice(0, 10);

            const { data, error } = await supabase
                .from("despesas")
                .select("valor, cartao_id")
                .eq("user_id", user.id)
                .not("cartao_id", "is", null)
                .gte("data", monthStart)
                .lte("data", monthEnd);

            if (error) throw error;

            const agrupado = new Map<string, FaturaPorCartao>();
            (data ?? []).forEach((item) => {
                if (!item.cartao_id) return;
                const atual = agrupado.get(item.cartao_id) ?? {
                    cartaoId: item.cartao_id,
                    total: 0,
                    quantidade: 0,
                };
                atual.total += Number(item.valor);
                atual.quantidade += 1;
                agrupado.set(item.cartao_id, atual);
            });

            setFaturas(Array.from(agrupado.values()));
        } catch (err) {
            console.error("Erro ao carregar faturas:", err);
            setFaturas([]);
        } finally {
            setFaturasLoading(false);
        }
    }, []);

    useEffect(() => {
        carregarFaturas();
    }, [carregarFaturas]);

    const faturaPorCartao = useMemo(() => {
        const mapa = new Map<string, FaturaPorCartao>();
        faturas.forEach((f) => mapa.set(f.cartaoId, f));
        return mapa;
    }, [faturas]);

    const totalLimite = useMemo(
        () => cartoes.reduce((sum, c) => sum + Number(c.limite ?? 0), 0),
        [cartoes]
    );
    const totalFatura = useMemo(
        () => faturas.reduce((sum, f) => sum + f.total, 0),
        [faturas]
    );
    const limiteDisponivel = Math.max(totalLimite - totalFatura, 0);

    const handleDelete = async (id: string, nome: string) => {
        const confirmar = window.confirm(
            `Excluir o cartão "${nome}"? As despesas vinculadas a ele serão mantidas, mas perderão o vínculo com o cartão.`
        );
        if (!confirmar) return;

        try {
            setDeletingId(id);
            const { error } = await supabase.from("cartoes").delete().eq("id", id);
            if (error) throw error;
            await refetch();
            await carregarFaturas();
        } catch (err) {
            console.error("Erro ao excluir cartão:", err);
            toast.error("Não foi possível excluir o cartão.");
        } finally {
            setDeletingId(null);
        }
    };

    const handleSave = async () => {
        await refetch();
        await carregarFaturas();
    };

    return (
        <div className="min-h-screen">
            <Sidebar />

            <main className="md:ml-64 p-4 pt-24 md:p-8 transition-all duration-300">
                {/* Header */}
                <header className="flex flex-col gap-5 mb-8 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                            Cartões de crédito
                        </h1>
                        <p className="text-muted mt-1 max-w-2xl">
                            Gerencie seus cartões, acompanhe limites e a fatura aberta do mês com base
                            nas despesas vinculadas.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-white transition-all hover:brightness-110"
                            style={{
                                background: "var(--accent)",
                                boxShadow: "0 10px 24px color-mix(in srgb, var(--accent) 22%, transparent)",
                            }}
                        >
                            <Plus size={18} />
                            Novo cartão
                        </button>
                        <ThemeToggle />
                        <UserMenu />
                    </div>
                </header>

                {/* Cards de resumo */}
                <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="glass-card p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-muted text-sm font-medium mb-1">Limite total</p>
                                <h3 className="text-2xl font-bold text-foreground">
                                    {formatCurrency(totalLimite)}
                                </h3>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-400 text-white">
                                <Wallet size={22} />
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-muted text-sm font-medium mb-1">Fatura do mês</p>
                                <h3 className="text-2xl font-bold" style={{ color: "var(--danger)" }}>
                                    {formatCurrency(totalFatura)}
                                </h3>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-400 text-white">
                                <TrendingDown size={22} />
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-muted text-sm font-medium mb-1">Limite disponível</p>
                                <h3 className="text-2xl font-bold" style={{ color: "var(--success)" }}>
                                    {formatCurrency(limiteDisponivel)}
                                </h3>
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-400 text-white">
                                <CreditCard size={22} />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Lista de cartões */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--accent)" }} />
                    </div>
                ) : cartoes.length === 0 ? (
                    <div
                        className="glass-card flex flex-col items-center justify-center gap-4 py-16 text-center"
                    >
                        <div className="flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}>
                            <CreditCard size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">Nenhum cartão cadastrado</h3>
                            <p className="text-muted mt-1 max-w-md">
                                Cadastre seu primeiro cartão para acompanhar limites, faturas e vincular
                                despesas parceladas.
                            </p>
                        </div>
                        <button
                            onClick={() => setModalOpen(true)}
                            className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-white transition-all hover:brightness-110"
                            style={{ background: "var(--accent)" }}
                        >
                            <Plus size={18} />
                            Adicionar cartão
                        </button>
                    </div>
                ) : (
                    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {cartoes.map((cartao) => {
                            const fatura = faturaPorCartao.get(cartao.id);
                            const totalFaturaCartao = fatura?.total ?? 0;
                            const limite = Number(cartao.limite ?? 0);
                            const percentualUso = limite > 0
                                ? Math.min((totalFaturaCartao / limite) * 100, 100)
                                : 0;

                            return (
                                <article key={cartao.id} className="glass-card overflow-hidden p-0">
                                    {/* Visual do cartão */}
                                    <div
                                        className="relative p-5 text-white"
                                        style={{ background: getBandeiraGradient(cartao.bandeira) }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-xs uppercase tracking-wide opacity-80">
                                                    {cartao.banco}
                                                </p>
                                                <h3 className="text-lg font-bold">{cartao.nome}</h3>
                                            </div>
                                            <span className="rounded bg-white/20 px-2 py-1 text-xs font-bold uppercase">
                                                {cartao.bandeira}
                                            </span>
                                        </div>
                                        <div className="mt-8 flex items-end justify-between">
                                            <p className="font-mono text-base tracking-widest">
                                                •••• •••• •••• {cartao.ultimos_digitos || "••••"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detalhes */}
                                    <div className="p-5">
                                        <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                                            <div>
                                                <p className="text-muted text-xs">Fatura do mês</p>
                                                <p className="font-bold" style={{ color: "var(--danger)" }}>
                                                    {faturasLoading ? "—" : formatCurrency(totalFaturaCartao)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted text-xs">Limite</p>
                                                <p className="font-bold text-foreground">
                                                    {formatCurrency(limite)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Barra de uso do limite */}
                                        {limite > 0 && (
                                            <div className="mb-4">
                                                <div className="mb-1 flex items-center justify-between text-xs text-muted">
                                                    <span>Uso do limite</span>
                                                    <span>{percentualUso.toFixed(0)}%</span>
                                                </div>
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                                                    <div
                                                        className="h-full rounded-full transition-all"
                                                        style={{
                                                            width: `${percentualUso}%`,
                                                            background:
                                                                percentualUso > 80
                                                                    ? "var(--danger)"
                                                                    : percentualUso > 50
                                                                        ? "var(--warning)"
                                                                        : "var(--success)",
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between border-t pt-3 text-xs text-muted" style={{ borderColor: "var(--card-border)" }}>
                                            <span className="flex items-center gap-1.5">
                                                <CalendarClock size={14} />
                                                Vence dia {cartao.dia_vencimento ?? "—"}
                                            </span>
                                            <button
                                                onClick={() => handleDelete(cartao.id, cartao.nome)}
                                                disabled={deletingId === cartao.id}
                                                className="flex items-center gap-1.5 rounded-lg px-2 py-1 font-medium transition-colors hover:text-red-500 disabled:opacity-50"
                                                style={{ color: "var(--danger)" }}
                                            >
                                                {deletingId === cartao.id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={14} />
                                                )}
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </section>
                )}

                <footer className="text-center py-8 text-muted text-sm">
                    © 2026 FinançasPro. Desenvolvido para suas finanças.
                </footer>
            </main>

            <CardFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
            />
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}
