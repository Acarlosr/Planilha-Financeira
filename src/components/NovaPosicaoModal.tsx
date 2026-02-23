"use client";

import { useState } from "react";
import { Plus, X, Briefcase, Hash, CalendarDays, DollarSign } from "lucide-react";

interface NovaPosicaoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (acao: any) => void;
}

export default function NovaPosicaoModal({ isOpen, onClose, onSave }: NovaPosicaoModalProps) {
    const [ticker, setTicker] = useState("");
    const [empresa, setEmpresa] = useState("");
    const [quantidade, setQuantidade] = useState("");
    const [precoMedio, setPrecoMedio] = useState("");
    const [dataCompra, setDataCompra] = useState("");
    const [corretora, setCorretora] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: `ac-${Date.now()}`,
            ticker: ticker.toUpperCase(),
            empresa,
            quantidade: parseInt(quantidade),
            precoMedio: parseFloat(precoMedio),
            valorAtual: parseFloat(precoMedio) * parseInt(quantidade), // Mock initial value
            corretora,
            dataCompra
        });

        onClose();
        // Reset form
        setTicker(""); setEmpresa(""); setQuantidade("");
        setPrecoMedio(""); setDataCompra(""); setCorretora("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className="w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                style={{ background: "linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)" }}
            >
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <Plus className="text-emerald-400" size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Nova Posição (Ação)</h2>
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
                            <label className="block text-sm font-medium text-muted mb-1.5">Ticker</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="text" required
                                    value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())}
                                    placeholder="Ex: ITSA4"
                                    maxLength={6}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-emerald-500/50 outline-none transition-all uppercase"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Empresa</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="text" required
                                    value={empresa} onChange={(e) => setEmpresa(e.target.value)}
                                    placeholder="Ex: Itaúsa"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-emerald-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Quantidade</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="number" required min="1"
                                    value={quantidade} onChange={(e) => setQuantidade(e.target.value)}
                                    placeholder="Ex: 100"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-emerald-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Preço Médio (R$)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="number" required step="0.01" min="0.01"
                                    value={precoMedio} onChange={(e) => setPrecoMedio(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-emerald-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Data Compra</label>
                            <div className="relative">
                                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="date" required
                                    value={dataCompra} onChange={(e) => setDataCompra(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-emerald-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Corretora (Opcional)</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="text"
                                    value={corretora} onChange={(e) => setCorretora(e.target.value)}
                                    placeholder="Ex: XP JPM"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-emerald-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 py-4 rounded-xl text-white font-bold text-lg transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                        style={{ background: "linear-gradient(135deg, #10B981 0%, #059669 100%)" }}
                    >
                        Confirmar Compra
                    </button>
                </form>
            </div>
        </div>
    );
}
