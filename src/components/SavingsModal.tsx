"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

interface SavingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (saving: {
        description: string;
        value: number;
        date: string;
        type: string;
        meta: string;
    }) => void;
    metas: { id: string; nome: string; icone: string }[];
}

export default function SavingsModal({ isOpen, onClose, onSave, metas }: SavingsModalProps) {
    const [description, setDescription] = useState("");
    const [value, setValue] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [meta, setMeta] = useState(metas[0]?.id || "");
    const [type, setType] = useState<"deposito" | "retirada">("deposito");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formattedDate = new Date(date).toLocaleDateString('pt-BR');
            onSave({
                description,
                value: parseFloat(value.replace(',', '.')),
                date: formattedDate,
                type,
                meta,
            });

            // Reset form
            setDescription("");
            setValue("");
            setDate(new Date().toISOString().split('T')[0]);
            setMeta(metas[0]?.id || "");
            setType("deposito");
            onClose();
        } catch (error) {
            console.error("Error saving:", error);
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
                                background: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
                            }}
                        >
                            <Plus className="text-white" size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-white">
                            {type === "deposito" ? "Novo Depósito" : "Nova Retirada"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
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
                            onClick={() => setType("deposito")}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${type === "deposito"
                                    ? "bg-amber-500 text-white"
                                    : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Depósito
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("retirada")}
                            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${type === "retirada"
                                    ? "bg-red-500 text-white"
                                    : "text-gray-400 hover:text-white"
                                }`}
                        >
                            Retirada
                        </button>
                    </div>

                    {/* Meta Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Meta
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {metas.map((m) => (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setMeta(m.id)}
                                    className={`p-3 rounded-xl border text-center transition-all ${meta === m.id
                                            ? "border-amber-500 bg-amber-500/20 text-white"
                                            : "border-white/10 text-gray-400 hover:border-white/30"
                                        }`}
                                    style={{ background: meta === m.id ? undefined : "rgba(255, 255, 255, 0.03)" }}
                                >
                                    <span className="text-xl block mb-1">{m.icone}</span>
                                    <span className="text-xs">{m.nome.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Descrição
                        </label>
                        <input
                            type="text"
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ex: Depósito mensal"
                            className="w-full px-4 py-3 rounded-xl text-white placeholder:text-gray-500 outline-none transition-all border border-white/10 focus:border-amber-500/50"
                            style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        />
                    </div>

                    {/* Value */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Valor (R$)
                        </label>
                        <input
                            type="text"
                            required
                            value={value}
                            onChange={(e) => formatValue(e.target.value)}
                            placeholder="0,00"
                            className="w-full px-4 py-3 rounded-xl text-white placeholder:text-gray-500 outline-none transition-all border border-white/10 focus:border-amber-500/50"
                            style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Data
                        </label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all border border-white/10 focus:border-amber-500/50"
                            style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !description || !value}
                        className="w-full py-3.5 rounded-xl text-white font-semibold transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        style={{
                            background: type === "deposito"
                                ? "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)"
                                : "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
                            boxShadow: type === "deposito"
                                ? "0 4px 15px rgba(245, 158, 11, 0.4)"
                                : "0 4px 15px rgba(239, 68, 68, 0.4)"
                        }}
                    >
                        {loading ? "Salvando..." : (type === "deposito" ? "Adicionar Depósito" : "Registrar Retirada")}
                    </button>
                </form>
            </div>
        </div>
    );
}
