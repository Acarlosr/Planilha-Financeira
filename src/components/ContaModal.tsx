"use client";

import { useEffect, useState } from "react";
import { X, Wallet } from "lucide-react";
import Button from "@/components/ui/Button";
import { Conta } from "@/hooks/useContas";

export interface ContaFormValues {
    nome: string;
    instituicao: string;
    tipo: "corrente" | "poupanca" | "carteira" | "investimento" | "outro";
    cor: string;
    icone: string;
    saldoInicial: number;
}

interface ContaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (values: ContaFormValues) => Promise<void> | void;
    conta?: Conta | null;
}

const TIPOS: { value: ContaFormValues["tipo"]; label: string }[] = [
    { value: "corrente", label: "Conta Corrente" },
    { value: "poupanca", label: "Poupança" },
    { value: "carteira", label: "Carteira/Dinheiro" },
    { value: "investimento", label: "Investimento" },
    { value: "outro", label: "Outro" },
];

const CORES = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#06B6D4", "#EF4444", "#6B7280"];
const ICONES = ["🏦", "💳", "💰", "🐷", "👛", "📈", "🏛️", "💵"];

export default function ContaModal({ isOpen, onClose, onSave, conta }: ContaModalProps) {
    const [nome, setNome] = useState("");
    const [instituicao, setInstituicao] = useState("");
    const [tipo, setTipo] = useState<ContaFormValues["tipo"]>("corrente");
    const [cor, setCor] = useState(CORES[0]);
    const [icone, setIcone] = useState(ICONES[0]);
    const [saldoInicial, setSaldoInicial] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const isEditing = Boolean(conta);

    useEffect(() => {
        if (!isOpen) return;
        if (conta) {
            setNome(conta.nome);
            setInstituicao(conta.instituicao ?? "");
            setTipo(conta.tipo);
            setCor(conta.cor);
            setIcone(conta.icone);
            setSaldoInicial(String(conta.saldo_inicial));
        } else {
            setNome("");
            setInstituicao("");
            setTipo("corrente");
            setCor(CORES[0]);
            setIcone(ICONES[0]);
            setSaldoInicial("");
        }
    }, [isOpen, conta]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSave({
                nome,
                instituicao,
                tipo,
                cor,
                icone,
                saldoInicial: parseFloat(saldoInicial.replace(",", ".")) || 0,
            });
            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className="w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
                style={{ background: "linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)" }}
            >
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Wallet className="text-blue-400" size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{isEditing ? "Editar Conta" : "Nova Conta"}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Nome da conta</label>
                        <input
                            type="text" required
                            value={nome} onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: Nubank, Carteira, Itaú"
                            className="w-full px-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-blue-500/50 outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Instituição (opcional)</label>
                            <input
                                type="text"
                                value={instituicao} onChange={(e) => setInstituicao(e.target.value)}
                                placeholder="Ex: Nu Pagamentos"
                                className="w-full px-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-blue-500/50 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1.5">Tipo</label>
                            <select
                                value={tipo} onChange={(e) => setTipo(e.target.value as ContaFormValues["tipo"])}
                                className="w-full px-4 py-3 rounded-xl bg-black/20 text-foreground border border-white/5 focus:border-blue-500/50 outline-none transition-all"
                            >
                                {TIPOS.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Saldo inicial (R$)</label>
                        <input
                            type="number" step="0.01"
                            value={saldoInicial} onChange={(e) => setSaldoInicial(e.target.value)}
                            placeholder="0,00"
                            className="w-full px-4 py-3 rounded-xl bg-black/20 text-foreground placeholder:text-muted/50 border border-white/5 focus:border-blue-500/50 outline-none transition-all"
                        />
                        <p className="text-xs text-muted mt-1.5">
                            Saldo que a conta já tinha antes de você começar a lançar receitas/despesas vinculadas a ela aqui.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Ícone</label>
                        <div className="flex flex-wrap gap-2">
                            {ICONES.map((i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setIcone(i)}
                                    className={`w-10 h-10 rounded-lg text-lg flex items-center justify-center border transition-all ${icone === i ? "border-blue-500 bg-blue-500/20" : "border-white/5 bg-black/20"}`}
                                >
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-1.5">Cor</label>
                        <div className="flex flex-wrap gap-2">
                            {CORES.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setCor(c)}
                                    aria-label={`Selecionar cor ${c}`}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${cor === c ? "border-white scale-110" : "border-transparent"}`}
                                    style={{ background: c }}
                                />
                            ))}
                        </div>
                    </div>

                    <Button type="submit" variant="primary" loading={submitting} className="w-full mt-2">
                        {isEditing ? "Salvar Alterações" : "Criar Conta"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
