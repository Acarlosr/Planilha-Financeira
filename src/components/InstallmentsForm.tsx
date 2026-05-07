"use client";

import { format, addMonths } from "date-fns";
import { Divide } from "lucide-react";
import { Database } from "@/types/database.types";

type Cartao = Database["public"]["Tables"]["cartoes"]["Row"];

const flagLabel: Record<string, string> = {
    Visa: "VISA",
    Mastercard: "MC",
    Amex: "AMEX",
    Elo: "ELO",
};

const flagStyle: Record<string, string> = {
    Visa: "linear-gradient(135deg, #002890 0%, #0098F0 100%)",
    Mastercard: "linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)",
    Amex: "linear-gradient(135deg, #0098F0 0%, #54E0FF 100%)",
    Elo: "linear-gradient(135deg, #111827 0%, #64748b 100%)",
};

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
        <div className="space-y-4 p-4 rounded-xl border border-white/10" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
            {/* Toggle Parcelado */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${data.parcelada ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-muted'}`}>
                        <Divide size={18} />
                    </div>
                    <div>
                        <p className="font-medium text-white">Compra Parcelada?</p>
                        <p className="text-xs text-muted">Repetir despesa nos próximos meses</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleToggle}
                    className={`
                        relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-0
                        ${data.parcelada ? 'bg-red-500' : 'bg-white/10'}
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
                            className="w-full px-3 py-2 rounded-lg text-white text-sm focus:border-red-500/50 focus:ring-0 outline-none border border-white/10"
                            style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        >
                            {[...Array(36)].map((_, i) => (
                                <option key={i + 1} value={i + 1} className="text-gray-800">
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
                            className="w-full px-3 py-2 rounded-lg text-white text-sm focus:border-red-500/50 focus:ring-0 outline-none border border-white/10"
                            style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        />
                    </div>

                    {/* Preview da projeção */}
                    <div className="col-span-2 rounded-lg p-3 text-xs text-red-200 border border-red-500/20 bg-red-500/5">
                        <p className="font-medium mb-1 text-red-400">Projeção:</p>
                        <div className="flex justify-between opacity-80">
                            <span>1ª: {data.dataPrimeiraParcela ? format(new Date(data.dataPrimeiraParcela), 'dd/MM/yyyy') : '--'}</span>
                            <span>➜</span>
                            <span>Última: {data.dataPrimeiraParcela ? format(addMonths(new Date(data.dataPrimeiraParcela), data.numeroParcelas - 1), 'dd/MM/yyyy') : '--'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Seleção de Cartão */}
            <div>
                <label className="block text-xs font-medium text-muted mb-1">
                    Cartão de crédito (opcional)
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => onChange({ ...data, cartaoId: null })}
                        className="rounded-lg border px-3 py-2 text-left text-sm transition-all"
                        style={{
                            background: !data.cartaoId ? "color-mix(in srgb, var(--accent) 13%, transparent)" : "rgba(255, 255, 255, 0.04)",
                            borderColor: !data.cartaoId ? "color-mix(in srgb, var(--secondary) 35%, transparent)" : "rgba(255, 255, 255, 0.1)",
                            color: !data.cartaoId ? "var(--foreground)" : "var(--text-secondary)",
                        }}
                    >
                        Sem cartão
                    </button>
                    {cartoes.map((item) => {
                        const selected = data.cartaoId === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onChange({ ...data, cartaoId: item.id })}
                                className="rounded-lg border px-3 py-2 text-left text-sm transition-all"
                                style={{
                                    background: selected ? "color-mix(in srgb, var(--accent) 13%, transparent)" : "rgba(255, 255, 255, 0.04)",
                                    borderColor: selected ? "color-mix(in srgb, var(--secondary) 35%, transparent)" : "rgba(255, 255, 255, 0.1)",
                                }}
                            >
                                <span className="flex items-center gap-2">
                                    <span
                                        className="rounded px-2 py-1 text-[10px] font-bold text-white"
                                        style={{ background: flagStyle[item.bandeira] || flagStyle.Elo }}
                                    >
                                        {flagLabel[item.bandeira] || "OUTROS"}
                                    </span>
                                    <span className="text-foreground">{item.nome}</span>
                                </span>
                                <span className="mt-1 block text-xs text-muted">
                                    {item.banco}{item.ultimos_digitos ? ` • final ${item.ultimos_digitos}` : ""}
                                </span>
                            </button>
                        );
                    })}
                </div>
                {cartoes.length === 0 && (
                    <p className="mt-2 text-xs text-muted">
                        Nenhum cartão cadastrado ainda. Você pode salvar a despesa sem cartão.
                    </p>
                )}
            </div>
        </div>
    );
}
