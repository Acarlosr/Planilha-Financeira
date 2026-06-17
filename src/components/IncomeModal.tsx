"use client";

import { useEffect, useState } from "react";
import { X, Plus, Edit } from "lucide-react";

interface IncomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (income: {
        description: string;
        value: number;
        date: string;
        category: string;
    }) => void | Promise<void>;
    categorias: { id: string; label: string; icone: string }[];
    initialIncome?: {
        id: number | string;
        description: string;
        value: number;
        date: string;
        category: string;
    } | null;
}

export default function IncomeModal({ isOpen, onClose, onSave, categorias, initialIncome }: IncomeModalProps) {
    const [description, setDescription] = useState("");
    const [value, setValue] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState(categorias[0]?.id ?? "");
    const [loading, setLoading] = useState(false);
    const isEditing = Boolean(initialIncome);

    useEffect(() => {
        if (isOpen) {
            if (initialIncome) {
                setDescription(initialIncome.description);
                // Converte de dd/MM/yyyy para yyyy-MM-dd se necessário
                const isoDate = initialIncome.date.includes("/")
                    ? initialIncome.date.split("/").reverse().join("-")
                    : initialIncome.date;
                setDate(isoDate);
                setValue(initialIncome.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
                setCategory(initialIncome.category);
            } else {
                setDescription("");
                setValue("");
                setDate(new Date().toISOString().split('T')[0]);
                if (categorias.length > 0) setCategory(categorias[0].id);
            }
        }
    }, [isOpen, initialIncome]);

    useEffect(() => {
        if (isOpen && !initialIncome && categorias.length > 0 && !categorias.some((cat) => cat.id === category)) {
            setCategory(categorias[0].id);
        }
    }, [category, categorias, isOpen, initialIncome]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const numericValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
            await onSave({
                description,
                value: numericValue,
                date,
                category,
            });

            // Reset form
            setDescription("");
            setValue("");
            setDate(new Date().toISOString().split('T')[0]);
            setCategory(categorias[0]?.id ?? "");
            onClose();
        } catch (error) {
            console.error("Error saving income:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatValue = (val: string) => {
        // Remove non-numeric characters except comma and dot
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
                                background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                            }}
                        >
                            {isEditing ? <Edit className="text-white" size={20} /> : <Plus className="text-white" size={20} />}
                        </div>
                        <h2 className="text-xl font-bold text-foreground">{isEditing ? "Editar Receita" : "Nova Receita"}</h2>
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
                            placeholder="Ex: Salário Janeiro"
                            className="w-full px-4 py-3 rounded-xl text-white placeholder:text-muted outline-none transition-all border border-white/10 focus:border-emerald-500/50"
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
                            className="w-full px-4 py-3 rounded-xl text-white placeholder:text-muted outline-none transition-all border border-white/10 focus:border-emerald-500/50"
                            style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Data
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all border border-white/10 focus:border-emerald-500/50"
                                style={{ background: "rgba(255, 255, 255, 0.05)" }}
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Categoria
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {categorias.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategory(cat.id)}
                                    className={`p-3 rounded-xl border text-center transition-all ${category === cat.id
                                            ? "border-emerald-500 bg-emerald-500/20 text-white"
                                            : "border-white/10 text-gray-400 hover:border-white/30"
                                        }`}
                                    style={{ background: category === cat.id ? undefined : "rgba(255, 255, 255, 0.03)" }}
                                >
                                    <span className="text-xl block mb-1">{cat.icone}</span>
                                    <span className="text-xs">{cat.label.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>
                        {categorias.length === 0 && (
                            <p className="mt-2 text-xs text-red-300">
                                Cadastre as categorias de receita no Supabase antes de salvar.
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !description || !value || !category}
                        className="w-full py-3.5 rounded-xl text-foreground font-semibold transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                        style={{
                            background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                            boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)"
                        }}
                    >
                        {loading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Adicionar Receita"}
                    </button>
                </form>
            </div>
        </div>
    );
}
