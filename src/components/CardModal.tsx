"use client";

import { useState } from "react";
import { X, CreditCard, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface CardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

const bancosPopulares = [
    { nome: "Itaú", cor: "#EC7000" },
    { nome: "Nubank", cor: "#820AD1" },
    { nome: "Bradesco", cor: "#CC092F" },
    { nome: "Santander", cor: "#EC0000" },
    { nome: "Banco do Brasil", cor: "#F8D117" },
    { nome: "Caixa", cor: "#005CA9" },
    { nome: "Inter", cor: "#FF7A00" },
    { nome: "C6 Bank", cor: "#232323" },
    { nome: "BTG Pactual", cor: "#001E62" },
    { nome: "XP Investimentos", cor: "#232323" },
    { nome: "Neon", cor: "#00E5FF" },
    { nome: "PicPay", cor: "#11C76F" },
    { nome: "Mercado Pago", cor: "#00B1EA" },
    { nome: "PagBank", cor: "#00B13F" },
    { nome: "Outro", cor: "#6B7280" },
];

const bandeiras = [
    { id: "Visa", label: "Visa", gradient: "from-blue-600 to-blue-400" },
    { id: "Mastercard", label: "Mastercard", gradient: "from-orange-600 to-orange-400" },
    { id: "Amex", label: "American Express", gradient: "from-emerald-600 to-emerald-400" },
    { id: "Elo", label: "Elo", gradient: "from-amber-500 to-yellow-400" },
] as const;

export default function CardModal({ isOpen, onClose, onSave }: CardModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        banco: "",
        bandeira: "Visa" as "Visa" | "Mastercard" | "Amex" | "Elo",
        nome: "",
        ultimos_digitos: "",
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const bancoInfo = bancosPopulares.find(b => b.nome === formData.banco);

            const { error } = await supabase.from("cartoes").insert({
                user_id: user.id,
                nome: formData.nome || `${formData.banco} ${formData.bandeira}`,
                banco: formData.banco,
                bandeira: formData.bandeira,
                ultimos_digitos: formData.ultimos_digitos || null,
                cor: bancoInfo?.cor || "#6B7280",
            });

            if (error) throw error;

            onSave();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar cartão:", error);
            alert("Erro ao salvar cartão. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <CreditCard size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Adicionar Cartão</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-muted">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Seleção de Banco */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instituição Financeira</label>
                        <select
                            required
                            value={formData.banco}
                            onChange={(e) => {
                                const banco = e.target.value;
                                setFormData(prev => ({
                                    ...prev,
                                    banco,
                                    nome: prev.nome || `${banco} ${prev.bandeira}`
                                }));
                            }}
                            className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                        >
                            <option value="">Selecione o banco...</option>
                            {bancosPopulares.map(b => (
                                <option key={b.nome} value={b.nome}>{b.nome}</option>
                            ))}
                        </select>
                    </div>

                    {/* Seleção de Bandeira */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bandeira</label>
                        <div className="grid grid-cols-2 gap-2">
                            {bandeiras.map(bandeira => {
                                const isSelected = formData.bandeira === bandeira.id;
                                return (
                                    <button
                                        key={bandeira.id}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, bandeira: bandeira.id }))}
                                        className={`
                                            flex items-center gap-2 p-3 rounded-xl border transition-all text-left
                                            ${isSelected
                                                ? "border-purple-500 bg-purple-50 ring-1 ring-purple-500"
                                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                            }
                                        `}
                                    >
                                        <div className={`w-8 h-5 rounded bg-gradient-to-r ${bandeira.gradient} flex items-center justify-center text-[8px] text-white font-bold`}>
                                            {bandeira.id.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span className={`text-sm font-medium ${isSelected ? 'text-purple-700' : 'text-gray-600'}`}>
                                            {bandeira.label}
                                        </span>
                                        {isSelected && <Check size={16} className="ml-auto text-purple-600" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                        {/* Nome do Cartão */}
                        <div className="col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Apelido do Cartão</label>
                            <input
                                type="text"
                                required
                                value={formData.nome}
                                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                                placeholder="Ex: Nubank Principal"
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            />
                        </div>

                        {/* Últimos Dígitos */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Final (4 dig)</label>
                            <input
                                type="text"
                                maxLength={4}
                                pattern="\d{4}"
                                value={formData.ultimos_digitos}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setFormData(prev => ({ ...prev, ultimos_digitos: val }));
                                }}
                                placeholder="1234"
                                className="w-full px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-center tracking-widest"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-gray-700 font-medium bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 text-white font-medium bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 rounded-xl shadow-lg shadow-purple-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Salvando...</span>
                                </>
                            ) : (
                                <span>Adicionar Cartão</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
