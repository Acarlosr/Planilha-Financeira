"use client";

import { useState, useEffect } from "react";
import { X, DollarSign, Calendar, Tag, AlignLeft, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";
import InstallmentsForm, { InstallmentsData } from "./InstallmentsForm";
import { Database } from "@/types/database.types";
import { addMonths, format } from "date-fns";
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
}

export default function ExpenseModal({ isOpen, onClose, onSave, cartoes, categorias, onSaveLocal }: ExpenseModalProps) {
    const [loading, setLoading] = useState(false);

    // Dados básicos
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [categoryId, setCategoryId] = useState("");

    // Dados de parcelamento
    const [installmentsData, setInstallmentsData] = useState<InstallmentsData>({
        parcelada: false,
        numeroParcelas: 2,
        dataPrimeiraParcela: new Date().toISOString().split('T')[0],
        cartaoId: null,
    });

    // Resetar form ao abrir
    useEffect(() => {
        if (isOpen) {
            setDescription("");
            setAmount("");
            setDate(new Date().toISOString().split('T')[0]);
            setCategoryId(categorias.length > 0 ? categorias[0].id : "");
            setInstallmentsData({
                parcelada: false,
                numeroParcelas: 2,
                dataPrimeiraParcela: new Date().toISOString().split('T')[0],
                cartaoId: null,
            });
        }
    }, [isOpen, categorias]);

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

            const novasDespesas = [];

            if (installmentsData.parcelada) {
                // Lógica de Parcelas
                const valorParcela = parseFloat((valorTotal / installmentsData.numeroParcelas).toFixed(2));
                const grupoId = uuidv4();

                // Ajuste de centavos na última parcela
                const totalCalculado = valorParcela * installmentsData.numeroParcelas;
                const diferenca = parseFloat((valorTotal - totalCalculado).toFixed(2));

                for (let i = 0; i < installmentsData.numeroParcelas; i++) {
                    const dataParcela = addMonths(new Date(installmentsData.dataPrimeiraParcela), i);

                    // Adiciona diferença na última parcela
                    const valorFinal = (i === installmentsData.numeroParcelas - 1)
                        ? parseFloat((valorParcela + diferenca).toFixed(2))
                        : valorParcela;

                    novasDespesas.push({
                        id: Math.random(), // ID temporário para local
                        user_id: userId,
                        descricao: `${description} (${i + 1}/${installmentsData.numeroParcelas})`,
                        description: `${description} (${i + 1}/${installmentsData.numeroParcelas})`, // Compatibilidade com frontend
                        valor: valorFinal,
                        value: valorFinal, // Compatibilidade com frontend
                        data: format(dataParcela, 'yyyy-MM-dd'), // Formato banco import
                        date: format(dataParcela, 'dd/MM/yyyy'), // Formato frontend
                        category: categoryId, // Compatibilidade com frontend
                        categoria_id: categoryId,
                        cartao_id: installmentsData.cartaoId || null,
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
                    date: format(new Date(date), 'dd/MM/yyyy'),
                    category: categoryId,
                    categoria_id: categoryId,
                    cartao_id: installmentsData.cartaoId || null,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Nova Despesa</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-muted">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campos Básicos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <div className="relative">
                                <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Ex: Supermercado"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)} // Ideal: mascara de moeda
                                    placeholder="0,00"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="date"
                                    required
                                    disabled={installmentsData.parcelada} // Desabilita se for parcelado (usa data da 1a parcela)
                                    value={installmentsData.parcelada ? installmentsData.dataPrimeiraParcela : date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all disabled:opacity-60"
                                />
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                            <div className="relative">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <select
                                    required
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition-all appearance-none"
                                >
                                    <option value="" disabled>Selecione uma categoria</option>
                                    {categorias.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Componente de Parcelamento */}
                    <div className="border-t border-gray-100 pt-4">
                        <InstallmentsForm
                            data={installmentsData}
                            onChange={setInstallmentsData}
                            cartoes={cartoes}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
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
                            className="flex-1 px-4 py-3 text-white font-medium bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 rounded-xl shadow-lg shadow-red-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Salvando...</span>
                                </>
                            ) : (
                                <span>Salvar Despesa</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
