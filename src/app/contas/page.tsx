"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import ContaModal, { ContaFormValues } from "@/components/ContaModal";
import EmptyState from "@/components/ui/EmptyState";
import { SkeletonCard } from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import { useContas, Conta } from "@/hooks/useContas";
import { useConfirm } from "@/hooks/useConfirm";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";
import { supabase } from "@/lib/supabase";
import { Plus, Wallet, Pencil, Trash2, Upload } from "lucide-react";
import Link from "next/link";

const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const TIPO_LABEL: Record<Conta["tipo"], string> = {
    corrente: "Conta Corrente",
    poupanca: "Poupança",
    carteira: "Carteira/Dinheiro",
    investimento: "Investimento",
    outro: "Outro",
};

export default function ContasPage() {
    const { contas, loading, error, insertConta, updateConta, deleteConta } = useContas();
    const { confirm, ConfirmDialog } = useConfirm();
    const { toasts, toast, removeToast } = useToast();

    const [saldosPorConta, setSaldosPorConta] = useState<Record<string, number>>({});
    const [loadingSaldos, setLoadingSaldos] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingConta, setEditingConta] = useState<Conta | null>(null);

    const loadSaldos = useCallback(async () => {
        try {
            setLoadingSaldos(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setSaldosPorConta({});
                return;
            }

            const [receitasResult, despesasResult] = await Promise.all([
                supabase.from("receitas").select("valor, conta_id").eq("user_id", user.id).not("conta_id", "is", null),
                supabase.from("despesas").select("valor, conta_id").eq("user_id", user.id).not("conta_id", "is", null),
            ]);

            const movimentacao: Record<string, number> = {};
            (receitasResult.data ?? []).forEach((r) => {
                if (!r.conta_id) return;
                movimentacao[r.conta_id] = (movimentacao[r.conta_id] ?? 0) + Number(r.valor);
            });
            (despesasResult.data ?? []).forEach((d) => {
                if (!d.conta_id) return;
                movimentacao[d.conta_id] = (movimentacao[d.conta_id] ?? 0) - Number(d.valor);
            });

            setSaldosPorConta(movimentacao);
        } finally {
            setLoadingSaldos(false);
        }
    }, []);

    useEffect(() => {
        loadSaldos();
    }, [loadSaldos]);

    const patrimonioTotal = contas.reduce(
        (sum, c) => sum + Number(c.saldo_inicial) + (saldosPorConta[c.id] ?? 0),
        0
    );

    const handleSave = async (values: ContaFormValues) => {
        try {
            if (editingConta) {
                await updateConta(editingConta.id, {
                    nome: values.nome,
                    instituicao: values.instituicao || null,
                    tipo: values.tipo,
                    cor: values.cor,
                    icone: values.icone,
                    saldo_inicial: values.saldoInicial,
                });
                toast.success("Conta atualizada.");
            } else {
                await insertConta({
                    nome: values.nome,
                    instituicao: values.instituicao || null,
                    tipo: values.tipo,
                    cor: values.cor,
                    icone: values.icone,
                    saldo_inicial: values.saldoInicial,
                });
                toast.success("Conta criada.");
            }
            setEditingConta(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro ao salvar conta");
        }
    };

    const handleDelete = async (conta: Conta) => {
        if (await confirm(`Excluir "${conta.nome}"? Os lançamentos vinculados a ela não são apagados, só ficam sem conta.`)) {
            try {
                await deleteConta(conta.id);
                toast.success("Conta excluída.");
                loadSaldos();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Erro ao excluir conta");
            }
        }
    };

    return (
        <div className="min-h-screen">
            <Sidebar />

            <main className="md:ml-64 p-4 pt-24 md:p-8 transition-all duration-300">
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Contas e Carteiras</h1>
                        <p className="text-muted mt-1">
                            Vincule receitas e despesas a uma conta para saber quanto tem em cada uma
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/contas/importar">
                            <Button variant="secondary">
                                <Upload size={20} />
                                Importar Extrato
                            </Button>
                        </Link>
                        <Button onClick={() => { setEditingConta(null); setIsModalOpen(true); }}>
                            <Plus size={20} />
                            Nova Conta
                        </Button>
                    </div>
                </header>

                {error && (
                    <div className="mb-6 rounded-xl border p-4 text-sm text-red-300" style={{ borderColor: "rgba(248, 113, 113, 0.24)", background: "rgba(239, 68, 68, 0.08)" }}>
                        Não foi possível carregar suas contas: {error}
                    </div>
                )}

                <div className="glass-card p-6 mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted">Patrimônio somado em contas vinculadas</p>
                        <p className="text-xs text-muted mt-0.5">Considera só receitas/despesas com uma conta selecionada.</p>
                    </div>
                    <span className="text-2xl font-bold text-foreground font-numeric">
                        {loadingSaldos ? "..." : formatCurrency(patrimonioTotal)}
                    </span>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                    </div>
                ) : contas.length === 0 ? (
                    <div className="glass-card">
                        <EmptyState
                            icon={Wallet}
                            title="Nenhuma conta cadastrada"
                            description="Crie sua primeira conta (banco, carteira, poupança) para começar a acompanhar o saldo separado de cada uma."
                            action={<Button onClick={() => setIsModalOpen(true)}><Plus size={18} />Nova Conta</Button>}
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {contas.map((conta) => {
                            const saldo = Number(conta.saldo_inicial) + (saldosPorConta[conta.id] ?? 0);
                            return (
                                <div key={conta.id} className="glass-card p-6 relative overflow-hidden group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                            style={{ background: `color-mix(in srgb, ${conta.cor} 20%, transparent)` }}
                                        >
                                            {conta.icone}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => { setEditingConta(conta); setIsModalOpen(true); }}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Pencil size={16} className="text-muted" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(conta)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} className="text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-muted text-sm font-medium mb-1">{conta.nome}</p>
                                    <h3 className={`text-2xl font-bold mb-1 font-numeric ${saldo >= 0 ? "text-foreground" : "text-red-400"}`}>
                                        {loadingSaldos ? "..." : formatCurrency(saldo)}
                                    </h3>
                                    <p className="text-xs text-muted">
                                        {TIPO_LABEL[conta.tipo]}{conta.instituicao ? ` · ${conta.instituicao}` : ""}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <ContaModal
                isOpen={isModalOpen}
                conta={editingConta}
                onClose={() => { setIsModalOpen(false); setEditingConta(null); }}
                onSave={async (values) => {
                    await handleSave(values);
                    loadSaldos();
                }}
            />

            <ToastContainer toasts={toasts} onRemove={removeToast} />
            {ConfirmDialog}
        </div>
    );
}
