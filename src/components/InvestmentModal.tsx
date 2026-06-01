"use client";

import { useState } from "react";
import { useEffect } from "react";
import { X, Plus } from "lucide-react";

interface InvestmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (investment: {
        description: string;
        value: number;
        date: string;
        type: string;
        investmentType: string;
    }) => void | Promise<void>;
    investmentTypes: { id: string; nome: string; icone: string }[];
}

export default function InvestmentModal({ isOpen, onClose, onSave, investmentTypes }: InvestmentModalProps) {
    const [description, setDescription] = useState("");
    const [value, setValue] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<"aporte" | "resgate">("aporte");
    const [investmentType, setInvestmentType] = useState(investmentTypes[0]?.id ?? "");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && investmentTypes.length > 0 && !investmentTypes.some((item) => item.id === investmentType)) {
            setInvestmentType(investmentTypes[0].id);
        }
    }, [investmentType, investmentTypes, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await onSave({
                description,
                value: parseFloat(value.replace(',', '.')),
                date,
                type,
                investmentType,
            });

            // Reset form
            setDescription("");
            setValue("");
            setDate(new Date().toISOString().split('T')[0]);
            setType("aporte");
            setInvestmentType(investmentTypes[0]?.id ?? "");
            onClose();
        } catch (error) {
            console.error("Error saving investment:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatValue = (val: string) => {
        const cleaned = val.replace(/[^\d,\.]/g, '');
        setValue(cleaned);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-md mx-4 rounded-2xl border border-white/10 p-6 animate-in zoom-in-95 duration-200"
                style={{
                    background: "rgba(15, 23, 42, 0.95)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                                background: "linear-gradient(135deg, #FFD700 0%, #FFC700 100%)",
                            }}
                        >
                            <Plus className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">
                            {type === "aporte" ? "Novo Aporte" : "Novo Resgate"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type Toggle */}
                    <div className="flex gap-2 p-1 rounded-xl border border-white/10" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                        <button
                            type="button"
                            onClick={() => setType("aporte")}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${type === "aporte"
                                ? "bg-blue-500 text-white"
                                : "text-gray-400 hover:text-foreground"
                                }`}
                        >
                            Aporte
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("resgate")}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${type === "resgate"
                                ? "bg-red-500 text-white"
                                : "text-gray-400 hover:text-foreground"
                                }`}
                        >
                            Resgate
                        </button>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Tipo de aplicação
                        </label>
                        <select
                            required
                            value={investmentType}
                            onChange={(e) => setInvestmentType(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all border border-white/10 focus:border-blue-500/50"
                            style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        >
                            {investmentTypes.map((item) => (
                                <option key={item.id} value={item.id} className="text-gray-900">
                                    {item.icone} {item.nome}
                                </option>
                            ))}
                        </select>
                        {investmentTypes.length === 0 && (
                            <p className="mt-2 text-xs text-red-300">
                                Cadastre os tipos de investimento no Supabase antes de salvar.
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Descrição
                        </label>
                        <input
                            type="text"
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ex: Aporte Tesouro Selic"
                            className="w-full px-4 py-3 rounded-xl text-white placeholder:text-muted outline-none transition-all border border-white/10 focus:border-blue-500/50"
                            style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        />
                    </div>

                    {/* Value */}
                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Valor (R$)
                        </label>
                        <input
                            type="text"
                            required
                            value={value}
                            onChange={(e) => formatValue(e.target.value)}
                            placeholder="0,00"
                            className="w-full px-4 py-3 rounded-xl text-white placeholder:text-muted outline-none transition-all border border-white/10 focus:border-blue-500/50"
                            style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Data
                        </label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all border border-white/10 focus:border-blue-500/50"
                            style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !description || !value || !investmentType}
                        className="w-full py-3.5 rounded-xl text-foreground font-semibold transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        style={{
                            background: type === "aporte"
                                ? "linear-gradient(135deg, #FFD700 0%, #FFC700 100%)"
                                : "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
                            boxShadow: type === "aporte"
                                ? "0 4px 15px rgba(59, 130, 246, 0.4)"
                                : "0 4px 15px rgba(239, 68, 68, 0.4)"
                        }}
                    >
                        {loading ? "Salvando..." : (type === "aporte" ? "Adicionar Aporte" : "Registrar Resgate")}
                    </button>
                </form>
            </div>
        </div>
    );
}
