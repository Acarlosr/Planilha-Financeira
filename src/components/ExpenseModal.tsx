"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Tag, AlignLeft, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import InstallmentsForm, { InstallmentsData } from "./InstallmentsForm";
import { Database } from "@/types/database.types";
import { addMonths, format, parseISO } from "date-fns";
import { v4 as uuidv4 } from 'uuid';

type Cartao = Database["public"]["Tables"]["cartoes"]["Row"];
type Categoria = Database["public"]["Tables"]["categorias_despesa"]["Row"];

const INTERNET_TV_CELULAR_CATEGORY_ID = "650e8400-e29b-41d4-a716-446655440011";

const telecomServiceOptions = ["Internet", "Plano celular", "TV a cabo"];
const telecomProviderOptions = ["Vivo", "Claro", "IPTV"];
const telecomDetailPattern = /\s-\s(?:Internet|Plano celular|TV a cabo)\s(?:Vivo|Claro|IPTV)$/;

const removeTelecomDetail = (value: string) => value.replace(telecomDetailPattern, "");

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    cartoes: Cartao[];
    categorias: Categoria[];
    onSaveLocal?: (expenses: any[]) => void;
    initialCategoryId?: string | null;
    initialExpense?: {
        id: string;
        description: string;
        value: number;
        date: string;
        isoDate?: string;
        category: string;
        cardLabel?: string | null;
    } | null;
}

export default function ExpenseModal({ isOpen, onClose, onSave, cartoes, categorias, onSaveLocal, initialCategoryId, initialExpense }: ExpenseModalProps) {
    const [loading, setLoading] = useState(false);
    const isEditing = Boolean(initialExpense);

    // Dados básicos
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isBoleto, setIsBoleto] = useState(false);
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    const [categoryId, setCategoryId] = useState("");
    const [telecomService, setTelecomService] = useState(telecomServiceOptions[0]);
    const [telecomProvider, setTelecomProvider] = useState(telecomProviderOptions[0]);

    // Dados de parcelamento
    const [installmentsData, setInstallmentsData] = useState<InstallmentsData>({
        parcelada: false,
        tipoRepeticao: "recorrente",
        baseValorParcelado: "total",
        numeroParcelas: 2,
        dataPrimeiraParcela: new Date().toISOString().split('T')[0],
        cartaoId: null,
        cartaoManual: false,
        cartaoBandeira: "Mastercard",
        cartaoNome: "",
        cartaoDiaVencimento: 10,
    });

    // Resetar form ao abrir
    useEffect(() => {
        if (isOpen) {
            const today = new Date().toISOString().split('T')[0];
            const cardLabel = initialExpense?.cardLabel?.trim() ?? "";
            const knownBrand = ["Mastercard", "Visa", "Amex", "Outros"].find((brand) => cardLabel.endsWith(` ${brand}`));
            const cardName = knownBrand ? cardLabel.replace(` ${knownBrand}`, "") : cardLabel;
            const initialDate = initialExpense?.isoDate || today;
            const initialDescription = initialExpense?.description.replace(/\s\(\d+\/\d+\)$/, "") ?? "";
            const detailMatch = initialDescription.match(telecomDetailPattern);

            setDescription(removeTelecomDetail(initialDescription));
            setAmount(initialExpense ? initialExpense.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "");
            setDate(initialDate);
            setIsBoleto(false);
            setDueDate(initialDate);
            setCategoryId(initialExpense?.category || initialCategoryId || (categorias.length > 0 ? categorias[0].id : ""));
            setTelecomService(detailMatch ? telecomServiceOptions.find((option) => detailMatch[0].includes(option)) ?? telecomServiceOptions[0] : telecomServiceOptions[0]);
            setTelecomProvider(detailMatch ? telecomProviderOptions.find((option) => detailMatch[0].includes(option)) ?? telecomProviderOptions[0] : telecomProviderOptions[0]);
            setInstallmentsData({
                parcelada: false,
                tipoRepeticao: "recorrente",
                baseValorParcelado: "total",
                numeroParcelas: 2,
                dataPrimeiraParcela: initialDate,
                cartaoId: null,
                cartaoManual: Boolean(cardLabel),
                cartaoBandeira: knownBrand || "Mastercard",
                cartaoNome: cardName,
                cartaoDiaVencimento: 10,
            });
        }
    }, [isOpen, categorias, initialCategoryId, initialExpense]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Se tiver onSaveLocal, ignoramos Auth/Supabase por enquanto (modo preview)
            let userId = "user_preview_id";

            if (!onSaveLocal) {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Usuário não autenticado");
                userId = user.id;
            }

            const valorTotal = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
            if (isNaN(valorTotal)) throw new Error("Valor inválido");
            const descricaoBase = removeTelecomDetail(description.trim());
            const descricaoFinalBase = categoryId === INTERNET_TV_CELULAR_CATEGORY_ID
                ? `${descricaoBase} - ${telecomService} ${telecomProvider}`
                : descricaoBase;

            let cartaoId = installmentsData.cartaoId || null;
            const cartaoManualNome = installmentsData.cartaoNome.trim();
            const bandeiraCartao = (installmentsData.cartaoBandeira === "Outros"
                ? "Elo"
                : installmentsData.cartaoBandeira) as "Visa" | "Mastercard" | "Amex" | "Elo";

            if (!onSaveLocal && installmentsData.cartaoManual && cartaoManualNome) {
                const { data: cartaoCriado, error: cartaoError } = await supabase
                    .from("cartoes")
                    .insert({
                        user_id: userId,
                        nome: `${cartaoManualNome} ${installmentsData.cartaoBandeira}`,
                        banco: cartaoManualNome,
                        bandeira: bandeiraCartao,
                        ultimos_digitos: "",
                        cor: "gray",
                        limite: 0,
                        dia_fechamento: 1,
                        dia_vencimento: installmentsData.cartaoDiaVencimento,
                    })
                    .select("id")
                    .single();

                if (cartaoError) throw cartaoError;
                cartaoId = cartaoCriado.id;
            }

            const cartaoManualResumo = installmentsData.cartaoManual && cartaoManualNome
                ? `${cartaoManualNome} ${installmentsData.cartaoBandeira}`
                : null;

            const novasDespesas = [];

            if (installmentsData.parcelada) {
                const isInstallmentPurchase = installmentsData.tipoRepeticao === "parcelada";
                const usesInstallmentValue = isInstallmentPurchase && installmentsData.baseValorParcelado === "parcela";
                const valorParcela = isInstallmentPurchase
                    ? usesInstallmentValue
                        ? valorTotal
                        : parseFloat((valorTotal / installmentsData.numeroParcelas).toFixed(2))
                    : valorTotal;
                const totalCalculado = valorParcela * installmentsData.numeroParcelas;
                const diferenca = isInstallmentPurchase && !usesInstallmentValue ? parseFloat((valorTotal - totalCalculado).toFixed(2)) : 0;
                const grupoId = uuidv4();

                for (let i = 0; i < installmentsData.numeroParcelas; i++) {
                    const dataParcela = addMonths(parseISO(installmentsData.dataPrimeiraParcela), i);
                    const valorFinal = isInstallmentPurchase && i === installmentsData.numeroParcelas - 1
                        ? parseFloat((valorParcela + diferenca).toFixed(2))
                        : valorParcela;
                    const descricaoFinal = isInstallmentPurchase
                        ? `${descricaoFinalBase} (${i + 1}/${installmentsData.numeroParcelas})`
                        : descricaoFinalBase;

                    novasDespesas.push({
                        id: Math.random(), // ID temporário para local
                        user_id: userId,
                        descricao: descricaoFinal,
                        description: descricaoFinal, // Compatibilidade com frontend
                        valor: valorFinal,
                        value: valorFinal, // Compatibilidade com frontend
                        data: format(dataParcela, 'yyyy-MM-dd'), // Formato banco import
                        date: format(dataParcela, 'dd/MM/yyyy'), // Formato frontend
                        category: categoryId, // Compatibilidade com frontend
                        categoria_id: categoryId,
                        cartao_id: cartaoId,
                        cartao_manual: cartaoManualResumo,
                        tipo_repeticao: installmentsData.tipoRepeticao,
                        base_valor_parcelado: installmentsData.baseValorParcelado,
                        boleto: isBoleto && !cartaoId,
                        data_vencimento: isBoleto && !cartaoId ? dueDate : format(dataParcela, 'yyyy-MM-dd'),
                        parcelada: true,
                        parcela_atual: i + 1,
                        parcela_total: installmentsData.numeroParcelas,
                        parcela_grupo_id: grupoId,
                    });
                }
            } else {
                // Despesa única
                novasDespesas.push({
                    id: Math.random(),
                    user_id: userId,
                    descricao: descricaoFinalBase,
                    description: descricaoFinalBase,
                    valor: valorTotal,
                    value: valorTotal,
                    data: date,
                    date: format(parseISO(date), 'dd/MM/yyyy'),
                    category: categoryId,
                    categoria_id: categoryId,
                    cartao_id: cartaoId,
                    cartao_manual: cartaoManualResumo,
                    tipo_repeticao: "unica",
                    boleto: isBoleto && !cartaoId,
                    data_vencimento: isBoleto && !cartaoId ? dueDate : date,
                    parcelada: false,
                });
            }

            if (onSaveLocal) {
                // Modo Local: Apenas devolve os objetos
                onSaveLocal(novasDespesas);
            } else {
                // Modo Real: Salva no Supabase (apenas campos oficiais)
                const despesasParaSalvar = novasDespesas.map(d => ({
                    user_id: d.user_id,
                    descricao: d.descricao,
                    valor: d.valor,
                    data: d.data,
                    categoria_id: d.categoria_id,
                    cartao_id: d.cartao_id,
                    boleto: d.boleto,
                    data_vencimento: d.data_vencimento,
                    parcelada: d.parcelada,
                    parcela_atual: d.parcela_atual,
                    parcela_total: d.parcela_total,
                    parcela_grupo_id: d.parcela_grupo_id
                }));
                const { error } = await supabase.from("despesas").insert(despesasParaSalvar);
                if (error) throw error;
                onSave();
            }

            onClose();
        } catch (error) {
            console.error("Erro ao salvar despesa:", error);
            alert("Erro ao salvar despesa. Verifique os dados e tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-2 sm:items-center sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative my-auto w-full max-w-2xl rounded-xl border border-white/10 p-4 animate-in zoom-in-95 duration-200 sm:rounded-2xl sm:p-6"
                style={{
                    background: "rgba(15, 23, 42, 0.95)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">{isEditing ? "Editar Despesa" : "Nova Despesa"}</h2>
                    <button onClick={onClose} className="p-2 text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                    {/* Campos Básicos */}
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-muted mb-1">Descrição</label>
                            <div className="relative">
                                <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Ex: Supermercado"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-white placeholder:text-muted outline-none transition-all border border-white/10 focus:border-red-500/50"
                                    style={{ background: "rgba(255, 255, 255, 0.05)" }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">Valor</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted">R$</span>
                                <input
                                    type="text"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0,00"
                                    className="w-full pl-11 pr-4 py-2.5 rounded-xl text-white placeholder:text-muted outline-none transition-all border border-white/10 focus:border-red-500/50 font-medium"
                                    style={{ background: "rgba(255, 255, 255, 0.05)" }}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">Data</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="date"
                                    required
                                    disabled={installmentsData.parcelada}
                                    value={installmentsData.parcelada ? installmentsData.dataPrimeiraParcela : date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-white outline-none transition-all border border-white/10 focus:border-red-500/50 disabled:opacity-50"
                                    style={{ background: "rgba(255, 255, 255, 0.05)" }}
                                />
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2 rounded-xl border border-white/10 p-3" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isBoleto ? "bg-red-500/20 text-red-400" : "bg-white/10 text-muted"}`}>
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">É boleto ou conta com vencimento?</p>
                                        <p className="text-xs text-muted">Use para aparecer nos lembretes do dashboard.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsBoleto((value) => !value)}
                                    className={`relative h-6 w-12 rounded-full transition-colors ${isBoleto ? "bg-red-500" : "bg-white/10"}`}
                                >
                                    <span className={`mt-0.5 ml-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition ${isBoleto ? "translate-x-6" : "translate-x-0"}`} />
                                </button>
                            </div>

                            {isBoleto && (
                                <div className="mt-3">
                                    <label className="block text-sm font-medium text-muted mb-1">Data de vencimento</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                        <input
                                            type="date"
                                            required={isBoleto}
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-white outline-none transition-all border border-white/10 focus:border-red-500/50"
                                            style={{ background: "rgba(255, 255, 255, 0.05)" }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-muted mb-1">Categoria</label>
                            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                {categorias.map(cat => {
                                    const selected = categoryId === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategoryId(cat.id)}
                                            className="rounded-lg border px-2 py-2 text-center text-xs transition-all sm:px-3 sm:text-left sm:text-sm"
                                            style={{
                                                background: selected
                                                    ? "color-mix(in srgb, var(--accent) 16%, transparent)"
                                                    : "rgba(255, 255, 255, 0.04)",
                                                borderColor: selected
                                                    ? "color-mix(in srgb, var(--secondary) 42%, transparent)"
                                                    : "rgba(255, 255, 255, 0.1)",
                                                color: selected ? "var(--foreground)" : "var(--text-secondary)",
                                            }}
                                        >
                                            {cat.nome}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                                <Tag size={14} />
                                A categoria selecionada será usada no card e no histórico.
                            </div>
                        </div>

                        {categoryId === INTERNET_TV_CELULAR_CATEGORY_ID && (
                            <div className="col-span-1 md:col-span-2 rounded-xl border border-white/10 p-3" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                                <div className="mb-3">
                                    <p className="font-medium text-white">Detalhes de Internet/TV/Celular</p>
                                    <p className="text-xs text-muted">Escolha o tipo do serviço e a operadora/provedor.</p>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-medium text-muted mb-2">Tipo do serviço</label>
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                            {telecomServiceOptions.map((option) => {
                                                const selected = telecomService === option;
                                                return (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => setTelecomService(option)}
                                                        className="rounded-lg border px-3 py-2 text-sm transition-all"
                                                        style={{
                                                            background: selected
                                                                ? "color-mix(in srgb, var(--accent) 16%, transparent)"
                                                                : "rgba(255, 255, 255, 0.04)",
                                                            borderColor: selected
                                                                ? "color-mix(in srgb, var(--secondary) 42%, transparent)"
                                                                : "rgba(255, 255, 255, 0.1)",
                                                            color: selected ? "var(--foreground)" : "var(--text-secondary)",
                                                        }}
                                                    >
                                                        {option}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-muted mb-2">Operadora ou provedor</label>
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                            {telecomProviderOptions.map((option) => {
                                                const selected = telecomProvider === option;
                                                return (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => setTelecomProvider(option)}
                                                        className="rounded-lg border px-3 py-2 text-sm transition-all"
                                                        style={{
                                                            background: selected
                                                                ? "color-mix(in srgb, var(--accent) 16%, transparent)"
                                                                : "rgba(255, 255, 255, 0.04)",
                                                            borderColor: selected
                                                                ? "color-mix(in srgb, var(--secondary) 42%, transparent)"
                                                                : "rgba(255, 255, 255, 0.1)",
                                                            color: selected ? "var(--foreground)" : "var(--text-secondary)",
                                                        }}
                                                    >
                                                        {option}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-white/10 pt-4">
                        <InstallmentsForm
                            data={installmentsData}
                            onChange={setInstallmentsData}
                            cartoes={cartoes}
                        />
                    </div>

                    <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-white font-medium bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 text-white font-medium bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl shadow-lg shadow-red-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Salvando...</span>
                                </>
                            ) : (
                                <span>{isEditing ? "Salvar Alterações" : "Salvar Despesa"}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
