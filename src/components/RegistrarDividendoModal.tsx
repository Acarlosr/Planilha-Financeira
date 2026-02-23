"use client";

import { useState } from "react";
import { Plus, X, HandCoins, CalendarDays, DollarSign, Hash } from "lucide-react";

interface RegistrarDividendoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dividendo: any) => void;
}

export default function RegistrarDividendoModal({ isOpen, onClose, onSave }: RegistrarDividendoModalProps) {
    const [ticker, setTicker] = useState("");
    const [tipo, setTipo] = useState("dividendo");
    const [dataEx, setDataEx] = useState("");
    const [dataPagamento, setDataPagamento] = useState("");
    const [valorPorCota, setValorPorCota] = useState("");
    const [quantidade, setQuantidade] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: `div-${Date.now()}`,
            ticker: ticker.toUpperCase(),
            tipo,
            dataEx,
            dataPagamento,
            valorPorCota: parseFloat(valorPorCota),
            quantidadeNaData: parseInt(quantidade),
            valorTotal: parseFloat(valorPorCota) * parseInt(quantidade)
        });

        onClose();
        // Default reset
        setTicker(""); setTipo("dividendo"); setDataEx("");
        setDataPagamento(""); setValorPorCota(""); setQuantidade("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className="w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                style={{ background: "linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)" }}
            >
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <HandCoins className="text-amber-400" size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Registrar Provento</h2>
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
                            <label className="block text-sm font-medium text-muted mb-1.5">Ativo (Ticker)</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="text" required
                                    value={ticker} onChange={(e) => setTicker(e.target.value.toUpperCase())}
                                    placeholder="Ex: ITSA4 ou HGLG11"
                                    maxLength={6}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-amber-500/50 outline-none transition-all uppercase"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Tipo do Provento</label>
                            <select
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-black/20 text-foreground border border-white/5 focus:border-amber-500/50 outline-none transition-all appearance-none"
                            >
                                <option value="dividendo">Dividendo</option>
                                <option value="jcp">Juros s/ Capital (JCP)</option>
                                <option value="rendimento_fii">Rendimento (FII)</option>
                                <option value="amortizacao">Amortização</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Data Com (Ex)</label>
                            <div className="relative">
                                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="date" required
                                    value={dataEx} onChange={(e) => setDataEx(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Data Pagamento</label>
                            <div className="relative">
                                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="date" required
                                    value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Valor por Cota (R$)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="number" required step="0.0001" min="0.0001"
                                    value={valorPorCota} onChange={(e) => setValorPorCota(e.target.value)}
                                    placeholder="0,0000"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Qtd. Cotas (Base)</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="number" required min="1"
                                    value={quantidade} onChange={(e) => setQuantidade(e.target.value)}
                                    placeholder="Qtd. que possuía"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 py-4 rounded-xl text-white font-bold text-lg transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                        style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" }}
                    >
                        Registrar Recebimento
                    </button>
                </form>
            </div>
        </div>
    );
}
