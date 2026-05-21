"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Tag, AlignLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import InstallmentsForm, { InstallmentsData } from "./InstallmentsForm";
import { Database } from "@/types/database.types";
import { addMonths, format, parseISO } from "date-fns";
import { v4 as uuidv4 } from 'uuid';

type Cartao = Database["public"]["Tables"]["cartoes"]["Row"];
type Categoria = Database["public"]["Tables"]["categorias_despesa"]["Row"];

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
    const [categoryId, setCategoryId] = useState("");

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
    });

    // Resetar form ao abrir
    useEffect(() => {
        if (isOpen) {
            const today = new Date().toISOString().split('T')[0];
            const cardLabel = initialExpense?.cardLabel?.trim() ?? "";
            const knownBrand = ["Mastercard", "Visa", "Amex", "Outros"].find((brand) => cardLabel.endsWith(` ${brand}`));
            const cardName = knownBrand ? cardLabel.replace(` ${knownBrand}`, "") : cardLabel;
            const initialDate = initialExpense?.isoDate || today;

            setDescription(initialExpense?.description.replace(/\s\(\d+\/\d+\)$/, "") ?? "");
            setAmount(initialExpense ? initialExpense.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "");
            setDate(initialDate);
            setCategoryId(initialExpense?.category || initialCategoryId || (categorias.length > 0 ? categorias[0].id : ""));
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
                        dia_vencimento: 10,
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
                        ? `${description} (${i + 1}/${installmentsData.numeroParcelas})`
                        : description;

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
                    descricao: description,
                    description: description,
                    valor: valorTotal,
                    value: valorTotal,
                    data: date,
                    date: format(parseISO(date), 'dd/MM/yyyy'),
                    category: categoryId,
                    categoria_id: categoryId,
                    cartao_id: cartaoId,
                    cartao_manual: cartaoManualResumo,
                    tipo_repeticao: "unica",
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-2xl rounded-2xl border border-white/10 p-6 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]"
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campos Básicos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                            className="rounded-lg border px-3 py-2 text-left text-sm transition-all"
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
                    </div>

                    <div className="border-t border-white/10 pt-4">
                        <InstallmentsForm
                            data={installmentsData}
                            onChange={setInstallmentsData}
                            cartoes={cartoes}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
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
