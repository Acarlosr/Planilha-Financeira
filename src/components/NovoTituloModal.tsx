"use client";

import { useState } from "react";
import { Plus, X, Tag, CalendarDays, DollarSign, Percent } from "lucide-react";

interface NovoTituloModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (titulo: any) => void;
}

export default function NovoTituloModal({ isOpen, onClose, onSave }: NovoTituloModalProps) {
    const [nome, setNome] = useState("");
    const [tipo, setTipo] = useState("selic");
    const [dataCompra, setDataCompra] = useState("");
    const [vencimento, setVencimento] = useState("");
    const [valorAplicado, setValorAplicado] = useState("");
    const [taxa, setTaxa] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: `td-${Date.now()}`,
            titulo: nome,
            tipo,
            dataCompra,
            vencimento,
            valorAplicado: parseFloat(valorAplicado),
            quantidade: 1, // mock
            taxa,
            rendimentoAcumulado: 0
        });
        onClose();
        // Reset form
        setNome("");
        setTipo("selic");
        setDataCompra("");
        setVencimento("");
        setValorAplicado("");
        setTaxa("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className="w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                style={{ background: "linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)" }}
            >
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Plus className="text-blue-400" size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Novo Título Público</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Nome do Título</label>
                            <div className="relative">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Ex: Tesouro Selic 2029"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-blue-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Tipo do Título</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setTipo("selic")}
                                    className={`py-2 rounded-xl text-sm font-medium transition-all ${tipo === "selic"
                                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                                            : "bg-black/20 text-muted hover:bg-white/10"
                                        }`}
                                >
                                    Pós (Selic)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTipo("ipca")}
                                    className={`py-2 rounded-xl text-sm font-medium transition-all ${tipo === "ipca"
                                            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                                            : "bg-black/20 text-muted hover:bg-white/10"
                                        }`}
                                >
                                    Híbrido (IPCA)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTipo("pre")}
                                    className={`py-2 rounded-xl text-sm font-medium transition-all ${tipo === "pre"
                                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                                            : "bg-black/20 text-muted hover:bg-white/10"
                                        }`}
                                >
                                    Pré-fixado
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1.5">Data Compra</label>
                                <div className="relative">
                                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                    <input
                                        type="date"
                                        required
                                        value={dataCompra}
                                        onChange={(e) => setDataCompra(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-blue-500/50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1.5">Vencimento</label>
                                <div className="relative">
                                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                    <input
                                        type="date"
                                        required
                                        value={vencimento}
                                        onChange={(e) => setVencimento(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-blue-500/50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1.5">Valor Aplicado</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="30"
                                        required
                                        value={valorAplicado}
                                        onChange={(e) => setValorAplicado(e.target.value)}
                                        placeholder="0,00"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-blue-500/50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted mb-1.5">Rentabilidade (Taxa)</label>
                                <div className="relative">
                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={taxa}
                                        onChange={(e) => setTaxa(e.target.value)}
                                        placeholder="Ex: IPCA + 6,2%"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-blue-500/50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 py-4 rounded-xl text-white font-bold text-lg transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                        style={{ background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" }}
                    >
                        Adicionar Título
                    </button>
                </form>
            </div>
        </div>
    );
}
