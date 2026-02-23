"use client";

import { useState } from "react";
import { Plus, X, Building, CalendarDays, DollarSign, Percent } from "lucide-react";

interface NovoTituloRFModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (titulo: any) => void;
}

export default function NovoTituloRFModal({ isOpen, onClose, onSave }: NovoTituloRFModalProps) {
    const [tipo, setTipo] = useState("CDB");
    const [instituicao, setInstituicao] = useState("");
    const [indexador, setIndexador] = useState("CDI");
    const [taxa, setTaxa] = useState("");
    const [dataAplicacao, setDataAplicacao] = useState("");
    const [vencimento, setVencimento] = useState("");
    const [valorAplicado, setValorAplicado] = useState("");

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: `rf-${Date.now()}`,
            tipo,
            instituicao,
            indexador,
            taxa,
            dataAplicacao,
            vencimento,
            valorAplicado: parseFloat(valorAplicado),
            rendimentoAcumulado: 0
        });

        onClose();
        // Default reset
        setTipo("CDB"); setInstituicao(""); setIndexador("CDI"); setTaxa("");
        setDataAplicacao(""); setVencimento(""); setValorAplicado("");
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
                            <Plus className="text-amber-400" size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Novo Título (RF Privada)</h2>
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
                            <label className="block text-sm font-medium text-muted mb-1.5">Tipo do Título</label>
                            <select
                                value={tipo} onChange={(e) => setTipo(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-black/20 text-foreground border border-white/5 focus:border-amber-500/50 outline-none transition-all appearance-none"
                            >
                                <option value="CDB">CDB</option>
                                <option value="LCI">LCI (Isento de IR)</option>
                                <option value="LCA">LCA (Isento de IR)</option>
                                <option value="Debênture">Debênture</option>
                                <option value="CRI">CRI</option>
                                <option value="CRA">CRA</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Indexador</label>
                            <select
                                value={indexador} onChange={(e) => setIndexador(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-black/20 text-foreground border border-white/5 focus:border-amber-500/50 outline-none transition-all appearance-none"
                            >
                                <option value="CDI">CDI (Pós-fixado)</option>
                                <option value="IPCA">IPCA (Híbrido)</option>
                                <option value="pre">Pré-fixado</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Instituição Emissora</label>
                            <div className="relative">
                                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="text" required
                                    value={instituicao} onChange={(e) => setInstituicao(e.target.value)}
                                    placeholder="Ex: Banco Master"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Taxa de Rendimento</label>
                            <div className="relative">
                                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="text" required
                                    value={taxa} onChange={(e) => setTaxa(e.target.value)}
                                    placeholder="Ex: 120% CDI"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Data da Aplicação</label>
                            <div className="relative">
                                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="date" required
                                    value={dataAplicacao} onChange={(e) => setDataAplicacao(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Data de Vencimento</label>
                            <div className="relative">
                                <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="date" required
                                    value={vencimento} onChange={(e) => setVencimento(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Valor Aplicado (R$)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                type="number" required step="0.01" min="0.01"
                                value={valorAplicado} onChange={(e) => setValorAplicado(e.target.value)}
                                placeholder="0,00"
                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full mt-6 py-4 rounded-xl text-white font-bold text-lg transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                        style={{ background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" }}
                    >
                        Adicionar Título
                    </button>
                </form>
            </div>
        </div>
    );
}
