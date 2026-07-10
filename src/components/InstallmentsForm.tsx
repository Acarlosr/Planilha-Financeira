"use client";

import { format, addMonths, parseISO } from "date-fns";
import { Divide } from "lucide-react";
import { Database } from "@/types/database.types";

type Cartao = Database["public"]["Tables"]["cartoes"]["Row"];

const flagLabel: Record<string, string> = {
    Visa: "VISA",
    Mastercard: "MC",
    Amex: "AMEX",
    Elo: "ELO",
    Outros: "OUTROS",
};

const flagStyle: Record<string, string> = {
    Visa: "linear-gradient(135deg, #002890 0%, #0098F0 100%)",
    Mastercard: "linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)",
    Amex: "linear-gradient(135deg, #0098F0 0%, #54E0FF 100%)",
    Elo: "linear-gradient(135deg, #111827 0%, #64748b 100%)",
    Outros: "linear-gradient(135deg, #374151 0%, #9ca3af 100%)",
};

const manualBrands = ["Mastercard", "Visa", "Amex", "Outros"];
const suggestedBanks = ["Nubank", "C6", "Inter", "Bradesco", "Itaú", "Santander"];

export interface InstallmentsData {
    parcelada: boolean;
    tipoRepeticao: "recorrente" | "parcelada";
    baseValorParcelado: "total" | "parcela";
    numeroParcelas: number;
    dataPrimeiraParcela: string; // YYYY-MM-DD
    cartaoId: string | null;
    cartaoManual: boolean;
    cartaoBandeira: string;
    cartaoNome: string;
    cartaoDiaFechamento: number;
    cartaoDiaVencimento: number;
}

interface InstallmentsFormProps {
    data: InstallmentsData;
    onChange: (data: InstallmentsData) => void;
    cartoes: Cartao[];
}

export default function InstallmentsForm({ data, onChange, cartoes }: InstallmentsFormProps) {
    const noCardSelected = !data.cartaoId && !data.cartaoManual;
    const isInstallmentPurchase = data.tipoRepeticao === "parcelada";

    const handleToggle = () => {
        onChange({
            ...data,
            parcelada: !data.parcelada,
            // Resetar valores se desativar? Não, melhor manter o estado caso o usuário ative de volta
        });
    };

    return (
        <div className="space-y-4 rounded-xl border border-white/10 p-3 sm:p-4" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
            {/* Toggle Parcelado */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${data.parcelada ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-muted'}`}>
                        <Divide size={18} />
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium text-white">Repetir despesa?</p>
                        <p className="text-xs text-muted">Assinatura mensal ou compra parcelada no cartão</p>
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
                <div className="grid grid-cols-1 gap-3 pt-2 animate-in slide-in-from-top-2 duration-200 sm:grid-cols-2 sm:gap-4">
                    <div className="grid grid-cols-1 gap-2 sm:col-span-2 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => onChange({ ...data, tipoRepeticao: "recorrente" })}
                            className="rounded-lg border px-3 py-2 text-center transition-all sm:text-left"
                            style={{
                                background: data.tipoRepeticao === "recorrente" ? "color-mix(in srgb, var(--accent) 13%, transparent)" : "rgba(255, 255, 255, 0.04)",
                                borderColor: data.tipoRepeticao === "recorrente" ? "color-mix(in srgb, var(--secondary) 35%, transparent)" : "rgba(255, 255, 255, 0.1)",
                            }}
                        >
                            <span className="block text-sm font-medium text-foreground">Assinatura mensal</span>
                            <span className="block text-xs text-muted">Repete o valor cheio todo mês</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange({ ...data, tipoRepeticao: "parcelada" })}
                            className="rounded-lg border px-3 py-2 text-center transition-all sm:text-left"
                            style={{
                                background: data.tipoRepeticao === "parcelada" ? "color-mix(in srgb, var(--accent) 13%, transparent)" : "rgba(255, 255, 255, 0.04)",
                                borderColor: data.tipoRepeticao === "parcelada" ? "color-mix(in srgb, var(--secondary) 35%, transparent)" : "rgba(255, 255, 255, 0.1)",
                            }}
                        >
                            <span className="block text-sm font-medium text-foreground">Compra parcelada</span>
                            <span className="block text-xs text-muted">Valor total ou valor de cada parcela</span>
                        </button>
                    </div>

                    {isInstallmentPurchase && (
                        <div className="space-y-2 sm:col-span-2">
                            <label className="block text-center text-xs font-medium text-muted sm:text-left">
                                O valor informado é:
                            </label>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => onChange({ ...data, baseValorParcelado: "total" })}
                                    className="rounded-lg border px-3 py-2 text-center transition-all sm:text-left"
                                    style={{
                                        background: data.baseValorParcelado === "total" ? "color-mix(in srgb, var(--accent) 13%, transparent)" : "rgba(255, 255, 255, 0.04)",
                                        borderColor: data.baseValorParcelado === "total" ? "color-mix(in srgb, var(--secondary) 35%, transparent)" : "rgba(255, 255, 255, 0.1)",
                                    }}
                                >
                                    <span className="block text-sm font-medium text-foreground">Valor total da compra</span>
                                    <span className="block text-xs text-muted">Ex: R$ 1.100,00 em 10x vira R$ 110,00/mês</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onChange({ ...data, baseValorParcelado: "parcela" })}
                                    className="rounded-lg border px-3 py-2 text-center transition-all sm:text-left"
                                    style={{
                                        background: data.baseValorParcelado === "parcela" ? "color-mix(in srgb, var(--accent) 13%, transparent)" : "rgba(255, 255, 255, 0.04)",
                                        borderColor: data.baseValorParcelado === "parcela" ? "color-mix(in srgb, var(--secondary) 35%, transparent)" : "rgba(255, 255, 255, 0.1)",
                                    }}
                                >
                                    <span className="block text-sm font-medium text-foreground">Valor de cada parcela</span>
                                    <span className="block text-xs text-muted">Ex: R$ 110,00 em 10x lança R$ 110,00/mês</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Número de Meses */}
                    <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                            {isInstallmentPurchase ? "Qtd. parcelas" : "Qtd. meses"}
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

                    {/* Data 1º Débito */}
                    <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                            {isInstallmentPurchase ? "Data 1ª parcela" : "Data 1º débito"}
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
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-200 sm:col-span-2">
                        <p className="mb-2 text-center font-medium text-red-400 sm:text-left">Projeção:</p>
                        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center opacity-80">
                            <span>{isInstallmentPurchase ? "1ª" : "1º"}: {data.dataPrimeiraParcela ? format(parseISO(data.dataPrimeiraParcela), 'dd/MM/yyyy') : '--'}</span>
                            <span>➜</span>
                            <span>{isInstallmentPurchase ? "Última" : "Último"}: {data.dataPrimeiraParcela ? format(addMonths(parseISO(data.dataPrimeiraParcela), data.numeroParcelas - 1), 'dd/MM/yyyy') : '--'}</span>
                        </div>
                        <div className="mt-2 text-center text-muted sm:text-left">
                            {isInstallmentPurchase
                                ? data.baseValorParcelado === "total"
                                    ? "O sistema vai dividir o valor informado pela quantidade de parcelas."
                                    : "O sistema vai repetir o valor informado em cada parcela."
                                : "Ex: Netflix de R$ 20,99 por 8 meses vira R$ 20,99 em cada mês."}
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
                        onClick={() => onChange({ ...data, cartaoId: null, cartaoManual: false })}
                        className="rounded-lg border px-3 py-2 text-center text-sm transition-all sm:text-left"
                        style={{
                            background: noCardSelected ? "color-mix(in srgb, var(--accent) 13%, transparent)" : "rgba(255, 255, 255, 0.04)",
                            borderColor: noCardSelected ? "color-mix(in srgb, var(--secondary) 35%, transparent)" : "rgba(255, 255, 255, 0.1)",
                            color: noCardSelected ? "var(--foreground)" : "var(--text-secondary)",
                        }}
                    >
                        Sem cartão
                    </button>
                    <button
                        type="button"
                        onClick={() => onChange({ ...data, cartaoId: null, cartaoManual: true })}
                        className="rounded-lg border px-3 py-2 text-center text-sm transition-all sm:text-left"
                        style={{
                            background: data.cartaoManual ? "color-mix(in srgb, var(--accent) 13%, transparent)" : "rgba(255, 255, 255, 0.04)",
                            borderColor: data.cartaoManual ? "color-mix(in srgb, var(--secondary) 35%, transparent)" : "rgba(255, 255, 255, 0.1)",
                            color: data.cartaoManual ? "var(--foreground)" : "var(--text-secondary)",
                        }}
                    >
                        Informar cartão
                    </button>
                    {cartoes.map((item) => {
                        const selected = data.cartaoId === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => onChange({ ...data, cartaoId: item.id, cartaoManual: false })}
                                className="rounded-lg border px-3 py-2 text-center text-sm transition-all sm:text-left"
                                style={{
                                    background: selected ? "color-mix(in srgb, var(--accent) 13%, transparent)" : "rgba(255, 255, 255, 0.04)",
                                    borderColor: selected ? "color-mix(in srgb, var(--secondary) 35%, transparent)" : "rgba(255, 255, 255, 0.1)",
                                }}
                            >
                                <span className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                    <span
                                        className="rounded px-2 py-1 text-[10px] font-bold text-white"
                                        style={{ background: flagStyle[item.bandeira] || flagStyle.Elo }}
                                    >
                                        {flagLabel[item.bandeira] || "OUTROS"}
                                    </span>
                                    <span className="text-foreground">{item.nome}</span>
                                </span>
                                <span className="mt-1 block text-center text-xs text-muted sm:text-left">
                                    {item.banco}{item.ultimos_digitos ? ` • final ${item.ultimos_digitos}` : ""}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {data.cartaoId && (
                    <div className="mt-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-muted" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                        {(() => {
                            const selectedCard = cartoes.find((item) => item.id === data.cartaoId);
                            return selectedCard?.dia_vencimento
                                ? `Fatura fecha todo dia ${selectedCard.dia_fechamento ?? 30} e vence todo dia ${selectedCard.dia_vencimento}.`
                                : "Cartão selecionado sem vencimento cadastrado.";
                        })()}
                    </div>
                )}

                {data.cartaoManual && (
                    <div className="mt-3 space-y-3 rounded-lg border border-white/10 p-3" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                        <div>
                            <label className="mb-2 block text-xs font-medium text-muted">Bandeira do cartão</label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {manualBrands.map((brand) => {
                                    const selected = data.cartaoBandeira === brand;
                                    return (
                                        <button
                                            key={brand}
                                            type="button"
                                            onClick={() => onChange({ ...data, cartaoBandeira: brand })}
                                            className="rounded-lg border px-2 py-2 text-xs font-bold text-white transition-all"
                                            style={{
                                                background: flagStyle[brand],
                                                borderColor: selected ? "var(--accent)" : "rgba(255, 255, 255, 0.12)",
                                                boxShadow: selected ? "0 0 0 2px color-mix(in srgb, var(--accent) 35%, transparent)" : "none",
                                            }}
                                        >
                                            {flagLabel[brand]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-muted">Nome do cartão ou banco</label>
                            <input
                                type="text"
                                value={data.cartaoNome}
                                onChange={(e) => onChange({ ...data, cartaoNome: e.target.value })}
                                placeholder="Ex: Nubank, C6, Inter, Itaú..."
                                className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-red-500/50"
                                style={{ background: "rgba(255, 255, 255, 0.05)" }}
                            />
                            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                                {suggestedBanks.map((bank) => (
                                    <button
                                        key={bank}
                                        type="button"
                                        onClick={() => onChange({ ...data, cartaoNome: bank })}
                                        className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-muted transition hover:text-white"
                                    >
                                        {bank}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-muted">Dia de fechamento</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={data.cartaoDiaFechamento}
                                    onChange={(e) => onChange({
                                        ...data,
                                        cartaoDiaFechamento: Math.min(Math.max(Number(e.target.value) || 30, 1), 31),
                                    })}
                                    className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-red-500/50"
                                    style={{ background: "rgba(255, 255, 255, 0.05)" }}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-muted">Dia de vencimento</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="31"
                                    value={data.cartaoDiaVencimento}
                                    onChange={(e) => onChange({
                                        ...data,
                                        cartaoDiaVencimento: Math.min(Math.max(Number(e.target.value) || 10, 1), 31),
                                    })}
                                    className="w-full rounded-lg border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-red-500/50"
                                    style={{ background: "rgba(255, 255, 255, 0.05)" }}
                                />
                            </div>
                            <p className="text-xs text-muted sm:col-span-2">
                                Compras no crédito entram no mês do vencimento calculado pela fatura.
                            </p>
                        </div>
                    </div>
                )}

                {cartoes.length === 0 && !data.cartaoManual && (
                    <p className="mt-2 text-xs text-muted">
                        Nenhum cartão cadastrado ainda. Você pode informar a bandeira e o banco nesta despesa.
                    </p>
                )}
            </div>
        </div>
    );
}
