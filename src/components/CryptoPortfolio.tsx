"use client";

import { useState } from "react";
import { Plus, Trash2, Printer, Coins } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CryptoTransaction {
    id: string;
    coin: string;
    date: string;
    quantity: number;
    priceUsd: number;
    priceBrl: number;
    dollarRate: number;
    totalBrl: number;
}

export default function CryptoPortfolio() {
    const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        coin: "",
        date: new Date().toISOString().split('T')[0],
        quantity: "",
        priceUsd: "",
        priceBrl: "",
        dollarRate: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const quantity = parseFloat(formData.quantity);
        const priceUsd = parseFloat(formData.priceUsd);
        const priceBrl = parseFloat(formData.priceBrl);
        const dollarRate = parseFloat(formData.dollarRate);

        const totalBrl = priceBrl || (priceUsd * dollarRate);

        const newTransaction: CryptoTransaction = {
            id: Math.random().toString(36).substr(2, 9),
            coin: formData.coin,
            date: formData.date,
            quantity: quantity,
            priceUsd: priceUsd,
            priceBrl: priceBrl || totalBrl,
            dollarRate: dollarRate,
            totalBrl: totalBrl,
        };

        setTransactions([newTransaction, ...transactions]);
        setIsFormOpen(false);
        setFormData({
            coin: "",
            date: new Date().toISOString().split('T')[0],
            quantity: "",
            priceUsd: "",
            priceBrl: "",
            dollarRate: "",
        });
    };

    const handleDelete = (id: string) => {
        setTransactions(transactions.filter(t => t.id !== id));
    };

    const filteredTransactions = transactions.filter(t => {
        const transMonth = new Date(t.date).getMonth() + 1;
        return transMonth === selectedMonth;
    });

    const totalInvestedBrl = filteredTransactions.reduce((acc, curr) => acc + curr.totalBrl, 0);
    const totalInvestedUsd = filteredTransactions.reduce((acc, curr) => acc + curr.priceUsd, 0);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between no-print">
                <div className="flex items-center gap-4">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 focus:ring-2 focus:ring-yellow-200 outline-none"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {format(new Date(2024, i, 1), 'MMMM', { locale: ptBR })}
                            </option>
                        ))}
                    </select>
                    <div className="text-sm text-muted">
                        {filteredTransactions.length} transações
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <Printer size={18} />
                        Imprimir Relatório
                    </button>
                    <button
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="flex items-center gap-2 px-4 py-2 text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        Nova Transação
                    </button>
                </div>
            </div>

            {/* Add Form */}
            {isFormOpen && (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 animate-in slide-in-from-top-4 duration-200 no-print">
                    <h3 className="font-semibold text-gray-800 mb-4">Adicionar Nova Criptomoeda</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1">Nome da Cripto</label>
                            <div className="relative">
                                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                                <input
                                    name="coin"
                                    value={formData.coin}
                                    onChange={handleInputChange}
                                    placeholder="Ex: Bitcoin"
                                    required
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-200 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1">Data da Compra</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-200 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1">Quantidade</label>
                            <input
                                type="number"
                                step="any"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                placeholder="0.00000000"
                                required
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-200 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1">Valor Pago (USD)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="priceUsd"
                                    value={formData.priceUsd}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    required
                                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-200 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1">Cotação do Dólar</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs">R$</span>
                                <input
                                    type="number"
                                    step="0.001"
                                    name="dollarRate"
                                    value={formData.dollarRate}
                                    onChange={handleInputChange}
                                    placeholder="0.000"
                                    required
                                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-yellow-200 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted mb-1">Valor Pago (BRL) <span className="text-green-600 font-normal">p/ IR</span></label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs">R$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="priceBrl"
                                    value={formData.priceBrl}
                                    onChange={handleInputChange}
                                    placeholder="0,00"
                                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-green-300 bg-green-50/30 focus:ring-2 focus:ring-green-200 outline-none"
                                />
                            </div>
                            <span className="text-[10px] text-green-600 mt-0.5 block">Valor para declaração de IR</span>
                        </div>
                        <div className="pt-5 flex gap-2">
                            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-muted hover:bg-gray-100 rounded-lg">Cancelar</button>
                            <button type="submit" className="flex-1 px-4 py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600">Salvar</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Print Header */}
            <div className="hidden print:block mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Relatório de Investimentos em Criptomoedas</h1>
                <p className="text-muted">Mês de referência: {format(new Date(2024, selectedMonth - 1, 1), 'MMMM', { locale: ptBR })}</p>
                <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm text-muted">Total Investido (BRL)</p>
                    <p className="text-xl font-bold text-gray-800">
                        {totalInvestedBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
            </div>

            {/* List */}
            {filteredTransactions.length === 0 ? (
                <div className="text-center py-12 text-muted bg-gray-50/50 rounded-xl border-dashed border-2 border-gray-100">
                    Nenhuma transação registrada neste mês.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-left text-muted">
                                <th className="p-4 font-medium">Data</th>
                                <th className="p-4 font-medium">Criptomoeda</th>
                                <th className="p-4 font-medium">Qtd.</th>
                                <th className="p-4 font-medium">Valor (USD)</th>
                                <th className="p-4 font-medium">Cotação ($)</th>
                                <th className="p-4 font-medium text-green-700">Valor (BRL) <span className="text-[10px] font-normal">IR</span></th>
                                <th className="p-4 font-medium text-center no-print">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50/50">
                                    <td className="p-4 text-gray-600">{format(new Date(t.date), 'dd/MM/yyyy')}</td>
                                    <td className="p-4 font-medium text-gray-800">{t.coin}</td>
                                    <td className="p-4 text-gray-600 font-mono">{t.quantity}</td>
                                    <td className="p-4 text-blue-600 font-medium">
                                        {t.priceUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    </td>
                                    <td className="p-4 text-muted">
                                        R$ {t.dollarRate.toFixed(3)}
                                    </td>
                                    <td className="p-4 font-bold text-green-700 bg-green-50/30">
                                        {t.priceBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td className="p-4 text-center no-print">
                                        <button
                                            onClick={() => handleDelete(t.id)}
                                            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 font-medium">
                            <tr>
                                <td colSpan={3} className="p-4 text-right text-gray-600">Total do Mês:</td>
                                <td className="p-4 text-blue-600 font-bold">
                                    {totalInvestedUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </td>
                                <td></td>
                                <td className="p-4 text-green-700 font-bold">
                                    {totalInvestedBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            )}

            <style jsx global>{`
                @media print {
                    .no-print, header, aside, .sidebar {
                        display: none !important;
                    }
                    main {
                        margin-left: 0 !important;
                        padding: 0 !important;
                    }
                    body {
                        background: white !important;
                        overflow: visible !important;
                    }
                }
            `}</style>
        </div>
    );
}
