"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import PrintExportButtons from "@/components/PrintExportButtons";
import IncomeModal from "@/components/IncomeModal";
import {
    Plus,
    Calendar,
    Edit,
    Trash2,
    RotateCcw,
} from "lucide-react";

// Categorias de Receita conforme especificado
const categoriasReceita = [
    { id: "salario", label: "Salário Mensal", icone: "💼", cor: "from-emerald-500 to-emerald-400" },
    { id: "decimo", label: "13º Salário / Bônus", icone: "🎁", cor: "from-amber-500 to-amber-400" },
    { id: "freela", label: "Freelance / Extra", icone: "⚡", cor: "from-purple-500 to-purple-400" },
    { id: "vendas", label: "Vendas Online", icone: "📦", cor: "from-blue-500 to-blue-400" },
    { id: "reembolso", label: "Reembolso", icone: "back", cor: "from-teal-500 to-teal-400" },
    { id: "anterior", label: "Saldo Anterior", icone: "🏦", cor: "from-indigo-500 to-indigo-400" },
];

interface IncomeItem {
    id: number;
    description: string;
    value: number;
    date: string;
    category: string;
}

const initialIncomeData: IncomeItem[] = [
    { id: 1, description: "Saldo conta corrente", value: 5200.0, date: "01/01/2026", category: "anterior" },
    { id: 2, description: "Saldo poupança transferido", value: 3800.0, date: "01/01/2026", category: "anterior" },
    { id: 3, description: "Salário Janeiro", value: 8500.0, date: "05/01/2026", category: "salario" },
    { id: 4, description: "Salário Dezembro", value: 8500.0, date: "05/12/2025", category: "salario" },
    { id: 5, description: "13º Salário - 1ª Parcela", value: 4250.0, date: "30/11/2025", category: "decimo" },
    { id: 6, description: "13º Salário - 2ª Parcela", value: 4250.0, date: "20/12/2025", category: "decimo" },
    { id: 7, description: "Projeto Website Cliente A", value: 3200.0, date: "15/12/2025", category: "freela" },
    { id: 8, description: "Consultoria técnica", value: 1500.0, date: "22/12/2025", category: "freela" },
    { id: 9, description: "Venda Mercado Livre - Notebook", value: 2800.0, date: "10/12/2025", category: "vendas" },
    { id: 10, description: "Venda OLX - Móveis", value: 650.0, date: "18/12/2025", category: "vendas" },
    { id: 11, description: "Reembolso viagem corporativa", value: 850.0, date: "28/12/2025", category: "reembolso" },
    { id: 12, description: "Estorno cartão de crédito", value: 180.0, date: "02/01/2026", category: "reembolso" },
];

export default function ReceitasPage() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [incomeData, setIncomeData] = useState<IncomeItem[]>(initialIncomeData);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveIncome = (newIncome: { description: string; value: number; date: string; category: string }) => {
        const newItem: IncomeItem = {
            id: Date.now(),
            ...newIncome,
        };
        setIncomeData(prev => [newItem, ...prev]);
    };

    const handleDeleteIncome = (id: number) => {
        setIncomeData(prev => prev.filter(item => item.id !== id));
    };

    const getItemsByCategory = (categoryId: string) => {
        return incomeData.filter((item) => item.category === categoryId);
    };

    const getTotalByCategory = (categoryId: string) => {
        return incomeData
            .filter((item) => item.category === categoryId)
            .reduce((sum, item) => sum + item.value, 0);
    };

    const totalReceitas = incomeData.reduce((sum, item) => sum + item.value, 0);

    const getCategoryById = (id: string) => {
        return categoriasReceita.find((c) => c.id === id);
    };

    const renderIcon = (icone: string) => {
        if (icone === "back") {
            return <RotateCcw size={24} className="text-white" />;
        }
        return <span className="text-2xl">{icone}</span>;
    };

    return (
        <div className="min-h-screen">
            <Sidebar />

            <main className="ml-64 p-8 transition-all duration-300">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Receitas</h1>
                            <p className="text-muted mt-1">
                                Gerencie suas fontes de renda e receitas
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <PrintExportButtons title="Receitas" period="Janeiro 2026" />
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-3 text-foreground font-medium rounded-xl transition-all hover:shadow-lg no-print"
                                style={{
                                    background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                                    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
                                }}
                            >
                                <Plus size={20} />
                                Nova Receita
                            </button>
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="mt-6 glass-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted text-sm font-medium">Total de Receitas</p>
                                <h2 className="text-3xl font-bold text-emerald-400 mt-1">
                                    R$ {totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400">
                                <Calendar size={18} />
                                <span className="text-sm font-medium">Janeiro 2026</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Category Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    {categoriasReceita.map((cat) => {
                        const total = getTotalByCategory(cat.id);
                        const isActive = activeCategory === cat.id;

                        return (
                            <div
                                key={cat.id}
                                onClick={() => setActiveCategory(isActive ? null : cat.id)}
                                className={`soft-card p-4 cursor-pointer transition-all duration-300 ${isActive ? "ring-2 ring-purple-400 ring-offset-2 scale-105" : "hover:scale-102"
                                    }`}
                            >
                                <div className="flex flex-col items-center text-center gap-3">
                                    <div
                                        className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${cat.cor}`}
                                        style={{
                                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                        }}
                                    >
                                        {renderIcon(cat.icone)}
                                    </div>
                                    <div>
                                        <p className="text-muted text-xs font-medium leading-tight">{cat.label}</p>
                                        <h3 className="text-lg font-bold text-foreground mt-1">
                                            R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Items List */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-foreground">
                            {activeCategory
                                ? getCategoryById(activeCategory)?.label
                                : "Todas as Receitas"}
                        </h2>
                        {activeCategory && (
                            <button
                                onClick={() => setActiveCategory(null)}
                                className="text-sm text-[#7CFF6B] hover:text-[#6FEB5A] font-medium"
                            >
                                Ver todas
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {(activeCategory
                            ? getItemsByCategory(activeCategory)
                            : incomeData
                        ).map((item) => {
                            const cat = getCategoryById(item.category);
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-11 h-11 rounded-lg flex items-center justify-center bg-gradient-to-br ${cat?.cor}`}
                                        >
                                            {cat && (
                                                <span className="text-lg">
                                                    {cat.icone === "back" ? (
                                                        <RotateCcw size={18} className="text-white" />
                                                    ) : (
                                                        cat.icone
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{item.description}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-muted">{item.date}</span>
                                                <span className="text-xs text-muted">•</span>
                                                <span className="text-xs text-muted">{cat?.label}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-emerald-400 text-lg">
                                            + R$ {item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </span>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                                <Edit size={16} className="text-muted" />
                                            </button>
                                        <button
                                                onClick={() => {
                                                    if (confirm(`Excluir "${item.description}"?`)) {
                                                        handleDeleteIncome(item.id);
                                                    }
                                                }}
                                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                            >                                                <Trash2 size={16} className="text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Empty State */}
                    {activeCategory && getItemsByCategory(activeCategory).length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted">Nenhuma receita nesta categoria</p>
                        </div>
                    )}
                </div>
            </main>

            <IncomeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveIncome}
            />
        </div>
    );
}
