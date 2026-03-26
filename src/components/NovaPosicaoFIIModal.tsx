"use client";

import { useState } from "react";
import { Plus, X, Building, Hash, CalendarDays, DollarSign, FileText } from "lucide-react";

interface NovaPosicaoFIIModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (fii: any) => void;
}

export default function NovaPosicaoFIIModal({ isOpen, onClose, onSave }: NovaPosicaoFIIModalProps) {
    const [ticker, setTicker] = useState("");
    const [nome, setNome] = useState("");
    const [setor, setSetor] = useState("Logística");
    const [quantidade, setQuantidade] = useState("");
    const [precoMedio, setPrecoMedio] = useState("");
    const [dataCompra, setDataCompra] = useState("");
    const [cnpj, setCnpj] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: `fii-${Date.now()}`,
            ticker: ticker.toUpperCase(),
            nome,
            cnpj: cnpj || undefined,
            setor,
            quantidade: parseInt(quantidade),
            precoMedio: parseFloat(precoMedio),
            valorAtual: parseFloat(precoMedio) * parseInt(quantidade), // mock initial
            dyAnual: 0, // Mock initial
            dataCompra
        });
        onClose();
        // Default reset
        setTicker(""); setNome(""); setSetor("Logística");
        setQuantidade(""); setPrecoMedio(""); setDataCompra(""); setCnpj("");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className="w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                style={{ background: "linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)" }}
            >
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <Plus className="text-purple-400" size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Nova Posição FII</h2>
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
                                    placeholder="Ex: HGLG11"
                                    maxLength={6}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-purple-500/50 outline-none transition-all uppercase"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Setor</label>
                            <div className="relative">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <select
                                    value={setor} onChange={(e) => setSetor(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground border border-white/5 focus:border-purple-500/50 outline-none transition-all appearance-none"
                                >
                                    <option value="Logística">Logística</option>
                                    <option value="Papel">Papel / CRI</option>
                                    <option value="Shoppings">Shoppings</option>
                                    <option value="Lajes Corporativas">Lajes Corporativas</option>
                                    <option value="Híbrido">Fundo de Fundos / Híbrido</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Nome do Fundo</label>
                        <input
                            type="text" required
                            value={nome} onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: CSHG Logística"
                            className="w-full px-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-purple-500/50 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">CNPJ do Fundo</label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                type="text"
                                value={cnpj}
                                onChange={(e) => {
                                    // Máscara de CNPJ: XX.XXX.XXX/XXXX-XX
                                    let v = e.target.value.replace(/\D/g, "").slice(0, 14);
                                    if (v.length > 12) v = v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, "$1.$2.$3/$4-$5");
                                    else if (v.length > 8) v = v.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, "$1.$2.$3/$4");
                                    else if (v.length > 5) v = v.replace(/(\d{2})(\d{3})(\d{1,3})/, "$1.$2.$3");
                                    else if (v.length > 2) v = v.replace(/(\d{2})(\d{1,3})/, "$1.$2");
                                    setCnpj(v);
                                }}
                                placeholder="00.000.000/0000-00"
                                maxLength={18}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-purple-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Qtd. Cotas</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="number" required min="1"
                                    value={quantidade} onChange={(e) => setQuantidade(e.target.value)}
                                    placeholder="Ex: 50"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-purple-500/50 outline-none transition-all"
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
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-purple-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Data da Primeira Compra</label>
                        <div className="relative">
                            <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                type="date" required
                                value={dataCompra} onChange={(e) => setDataCompra(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-purple-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 py-4 rounded-xl text-white font-bold text-lg transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                        style={{ background: "linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)" }}
                    >
                        Confirmar Posição
                    </button>
                </form>
            </div>
        </div>
    );
}
