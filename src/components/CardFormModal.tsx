"use client";

import { useState } from "react";
import { X, Hash, Type } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";

interface CardFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

const BANKS = [
    { value: "Nubank", label: "Nubank", color: "purple" },
    { value: "Itaú", label: "Itaú", color: "orange" },
    { value: "Bradesco", label: "Bradesco", color: "red" },
    { value: "Santander", label: "Santander", color: "red" },
    { value: "Inter", label: "Inter", color: "orange" },
    { value: "C6 Bank", label: "C6 Bank", color: "black" },
    { value: "XP", label: "XP", color: "black" },
    { value: "Outro", label: "Outro", color: "gray" },
];

const BRANDS = ["Mastercard", "Visa", "Amex", "Elo", "Hipercard"];

export default function CardFormModal({ isOpen, onClose, onSave }: CardFormModalProps) {
    const [loading, setLoading] = useState(false);
    const { toasts, toast, removeToast } = useToast();
    const [formData, setFormData] = useState({
        nome: "",
        banco: "Nubank",
        bandeira: "Mastercard",
        ultimos_digitos: "",
        limite: "",
        dia_fechamento: "1",
        dia_vencimento: "10",
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const selectedBank = BANKS.find(b => b.value === formData.banco);

            const { error } = await supabase.from("cartoes").insert({
                user_id: user.id,
                nome: formData.nome,
                banco: formData.banco,
                bandeira: formData.bandeira,
                ultimos_digitos: formData.ultimos_digitos,
                cor: selectedBank?.color || "gray",
                limite: parseFloat(formData.limite) || 0,
                dia_fechamento: parseInt(formData.dia_fechamento),
                dia_vencimento: parseInt(formData.dia_vencimento),
            });

            if (error) throw error;
            onSave();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar cartão:", error);
            toast.error("Erro ao salvar cartão.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Adicionar Cartão</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-muted">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Cartão</label>
                        <div className="relative">
                            <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                required
                                value={formData.nome}
                                onChange={e => setFormData({ ...formData, nome: e.target.value })}
                                placeholder="Ex: Nubank Platinum"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-200 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                            <select
                                value={formData.banco}
                                onChange={e => setFormData({ ...formData, banco: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-200 outline-none"
                            >
                                {BANKS.map(b => (
                                    <option key={b.value} value={b.value}>{b.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bandeira</label>
                            <select
                                value={formData.bandeira}
                                onChange={e => setFormData({ ...formData, bandeira: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-200 outline-none"
                            >
                                {BRANDS.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Últimos 4 Dígitos</label>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    maxLength={4}
                                    value={formData.ultimos_digitos}
                                    onChange={e => setFormData({ ...formData, ultimos_digitos: e.target.value })}
                                    placeholder="1234"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-200 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Limite (R$)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs">R$</span>
                                <input
                                    type="number"
                                    value={formData.limite}
                                    onChange={e => setFormData({ ...formData, limite: e.target.value })}
                                    placeholder="0,00"
                                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-200 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dia Fechamento</label>
                            <input
                                type="number" min="1" max="31"
                                value={formData.dia_fechamento}
                                onChange={e => setFormData({ ...formData, dia_fechamento: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-200 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dia Vencimento</label>
                            <input
                                type="number" min="1" max="31"
                                value={formData.dia_vencimento}
                                onChange={e => setFormData({ ...formData, dia_vencimento: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-200 outline-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 px-4 py-3 text-white font-medium bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-70">
                            {loading ? "Salvando..." : "Salvar Cartão"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        </>
    );
}
