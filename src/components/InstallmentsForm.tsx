"use client";

import { useState } from "react";
import { format, addMonths } from "date-fns";
import { Calendar, CreditCard, Divide } from "lucide-react";
import { Database } from "@/types/database.types";

type Cartao = Database["public"]["Tables"]["cartoes"]["Row"];

export interface InstallmentsData {
    parcelada: boolean;
    numeroParcelas: number;
    dataPrimeiraParcela: string; // YYYY-MM-DD
    cartaoId: string | null;
}

interface InstallmentsFormProps {
    data: InstallmentsData;
    onChange: (data: InstallmentsData) => void;
    cartoes: Cartao[];
}

export default function InstallmentsForm({ data, onChange, cartoes }: InstallmentsFormProps) {
    const handleToggle = () => {
        onChange({
            ...data,
            parcelada: !data.parcelada,
            // Resetar valores se desativar? Não, melhor manter o estado caso o usuário ative de volta
        });
    };

    return (
        <div className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-200/50">
            {/* Toggle Parcelado */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${data.parcelada ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'}`}>
                        <Divide size={18} />
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Compra Parcelada?</p>
                        <p className="text-xs text-muted">Repetir despesa nos próximos meses</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleToggle}
                    className={`
                        relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                        ${data.parcelada ? 'bg-purple-600' : 'bg-gray-300'}
                    `}
                >
                    <span
                        className={`
                            inline-block w-5 h-5 transform bg-white rounded-full shadow transition duration-200 ease-in-out mt-0.5 ml-0.5
                            ${data.parcelada ? 'translate-x-6' : 'translate-x-0'}
                        `}
                    />
                </button>
            </div>

            {/* Campos de Parcelamento (Show/Hide) */}
            {data.parcelada && (
                <div className="grid grid-cols-2 gap-4 pt-2 animate-in slide-in-from-top-2 duration-200">
                    {/* Número de Parcelas */}
                    <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                            Qtd. Parcelas
                        </label>
                        <select
                            value={data.numeroParcelas}
                            onChange={(e) => onChange({ ...data, numeroParcelas: Number(e.target.value) })}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                        >
                            {[...Array(36)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {i + 1}x
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Data 1ª Parcela */}
                    <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                            Data 1ª Parcela
                        </label>
                        <input
                            type="date"
                            required={data.parcelada}
                            value={data.dataPrimeiraParcela}
                            onChange={(e) => onChange({ ...data, dataPrimeiraParcela: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                        />
                    </div>

                    {/* Seleção de Cartão */}
                    <div className="col-span-2">
                        <label className="block text-xs font-medium text-muted mb-1">
                            Vincular Cartão (Opcional)
                        </label>
                        <select
                            value={data.cartaoId || ""}
                            onChange={(e) => onChange({ ...data, cartaoId: e.target.value || null })}
                            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                        >
                            <option value="">Nenhum cartão selecionado</option>
                            {cartoes.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.nome} • {item.banco} ({item.bandeira})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Preview da projeção */}
                    <div className="col-span-2 bg-purple-50 rounded-lg p-3 text-xs text-purple-700">
                        <p className="font-medium mb-1">Projeção:</p>
                        <div className="flex justify-between opacity-80">
                            <span>1ª: {data.dataPrimeiraParcela ? format(new Date(data.dataPrimeiraParcela), 'dd/MM/yyyy') : '--'}</span>
                            <span>➜</span>
                            <span>Última: {data.dataPrimeiraParcela ? format(addMonths(new Date(data.dataPrimeiraParcela), data.numeroParcelas - 1), 'dd/MM/yyyy') : '--'}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
