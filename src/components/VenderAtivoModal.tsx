"use client";

import { useEffect, useState } from "react";
import { ArrowDownCircle, X, Hash, CalendarDays, DollarSign } from "lucide-react";
import { calcularResultadoVenda } from "@/lib/impostoInvestimentos";

export interface AtivoParaVenda {
    id: string;
    ticker: string;
    quantidade: number;
    precoMedio: number;
}

interface VenderAtivoModalProps {
    isOpen: boolean;
    ativo: AtivoParaVenda | null;
    onClose: () => void;
    onConfirm: (input: {
        quantidade: number;
        precoVenda: number;
        taxas: number;
        dataVenda: string;
        modalidade: "swing_trade" | "day_trade";
    }) => Promise<void> | void;
}

export default function VenderAtivoModal({ isOpen, ativo, onClose, onConfirm }: VenderAtivoModalProps) {
    const [quantidade, setQuantidade] = useState("");
    const [precoVenda, setPrecoVenda] = useState("");
    const [taxas, setTaxas] = useState("");
    const [dataVenda, setDataVenda] = useState(() => new Date().toISOString().slice(0, 10));
    const [modalidade, setModalidade] = useState<"swing_trade" | "day_trade">("swing_trade");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && ativo) {
            setQuantidade(String(ativo.quantidade));
            setPrecoVenda("");
            setTaxas("");
            setDataVenda(new Date().toISOString().slice(0, 10));
            setModalidade("swing_trade");
        }
    }, [isOpen, ativo]);

    if (!isOpen || !ativo) return null;

    const quantidadeNum = parseFloat(quantidade) || 0;
    const precoVendaNum = parseFloat(precoVenda) || 0;
    const taxasNum = parseFloat(taxas) || 0;
    const preview = calcularResultadoVenda(quantidadeNum, precoVendaNum, ativo.precoMedio, taxasNum);
    const excedeQuantidade = quantidadeNum > ativo.quantidade;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (excedeQuantidade || quantidadeNum <= 0 || precoVendaNum <= 0) return;

        setSubmitting(true);
        try {
            await onConfirm({
                quantidade: quantidadeNum,
                precoVenda: precoVendaNum,
                taxas: taxasNum,
                dataVenda,
                modalidade,
            });
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className="w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                style={{ background: "linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)" }}
            >
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <ArrowDownCircle className="text-red-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Vender {ativo.ticker}</h2>
                            <p className="text-xs text-muted mt-0.5">
                                Posição atual: {ativo.quantidade} cotas a {ativo.precoMedio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Quantidade</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="number" required min="0.00000001" step="any"
                                    max={ativo.quantidade}
                                    value={quantidade} onChange={(e) => setQuantidade(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-red-500/50 outline-none transition-all"
                                />
                            </div>
                            {excedeQuantidade && (
                                <p className="text-xs text-red-400 mt-1">Você só tem {ativo.quantidade} cotas.</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Preço de Venda (R$)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="number" required step="0.01" min="0.01"
                                    value={precoVenda} onChange={(e) => setPrecoVenda(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-red-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Data da Venda</label>
                            <div className="relative">
                                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="date" required
                                    value={dataVenda} onChange={(e) => setDataVenda(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-red-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Taxas / Corretagem (Opcional)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="number" step="0.01" min="0"
                                    value={taxas} onChange={(e) => setTaxas(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-red-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Modalidade</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setModalidade("swing_trade")}
                                className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${modalidade === "swing_trade" ? "border-red-500/60 bg-red-500/10 text-foreground" : "border-white/5 bg-black/20 text-muted"}`}
                            >
                                Swing Trade
                            </button>
                            <button
                                type="button"
                                onClick={() => setModalidade("day_trade")}
                                className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${modalidade === "day_trade" ? "border-red-500/60 bg-red-500/10 text-foreground" : "border-white/5 bg-black/20 text-muted"}`}
                            >
                                Day Trade
                            </button>
                        </div>
                        <p className="text-xs text-muted mt-1.5">
                            Day trade = compra e venda do mesmo ativo no mesmo dia. Tributação e regras de isenção são diferentes.
                        </p>
                    </div>

                    {quantidadeNum > 0 && precoVendaNum > 0 && (
                        <div className="rounded-xl border border-white/10 bg-black/20 p-4 flex items-center justify-between">
                            <span className="text-sm text-muted">Resultado estimado da venda</span>
                            <span className={`font-bold ${preview.resultado >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                {preview.resultado >= 0 ? "+" : ""}
                                {preview.resultado.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting || excedeQuantidade}
                        className="w-full mt-2 py-4 rounded-xl text-white font-bold text-lg transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)" }}
                    >
                        {submitting ? "Registrando..." : "Confirmar Venda"}
                    </button>
                </form>
            </div>
        </div>
    );
}
