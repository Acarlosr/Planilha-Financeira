"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MonthYearPicker from "@/components/MonthYearPicker";
import ExpenseModal from "@/components/ExpenseModal";
import { supabase } from "@/lib/supabase";
import { useCartoes } from "@/hooks/useCartoes";
import { useCategorias } from "@/hooks/useCategorias";
import { useDespesas } from "@/hooks/useDespesas";
import PrintExportButtons from "@/components/PrintExportButtons";
import {
    Plus,
    Edit,
    Trash2,
    ShoppingCart,
    Home,
    Car,
    Utensils,
    Heart,
    Smartphone,
    GraduationCap,
    Shirt,
    Wifi,
    Tv,
    MoreHorizontal,
    Loader2,
    CreditCard,
    Dumbbell,
    Droplets,
    Lightbulb,
    Plane,
} from "lucide-react";

const iconMap = {
    Home,
    Utensils,
    Car,
    Heart,
    GraduationCap,
    Smartphone,
    Shirt,
    ShoppingCart,
    Wifi,
    Tv,
    MoreHorizontal,
    CreditCard,
    Dumbbell,
    Droplets,
    Lightbulb,
    Plane,
};

const colorMap: Record<string, string> = {
    blue: "from-[#0098F0] to-[#54E0FF]",
    orange: "from-[#0098F0] to-[#002890]",
    purple: "from-[#002890] to-[#0098F0]",
    red: "from-red-500 to-red-400",
    green: "from-[#54E0FF] to-[#0098F0]",
    pink: "from-[#0098F0] to-[#54E0FF]",
    indigo: "from-[#002890] to-[#0098F0]",
    teal: "from-[#54E0FF] to-[#0098F0]",
    cyan: "from-[#54E0FF] to-[#0098F0]",
    rose: "from-[#0098F0] to-[#002890]",
    gray: "from-slate-500 to-slate-400",
};

const commonExpenseCategories = [
    { id: "650e8400-e29b-41d4-a716-446655440003", nome: "Transporte", icone: "Car", cor: "blue", tipo: "despesa", user_id: null, created_at: "" },
    { id: "local-cartao-credito", nome: "Cartão de crédito", icone: "CreditCard", cor: "indigo", tipo: "despesa", user_id: null, created_at: "" },
    { id: "local-streaming", nome: "Streaming", icone: "Tv", cor: "cyan", tipo: "despesa", user_id: null, created_at: "" },
    { id: "local-internet", nome: "Internet", icone: "Wifi", cor: "teal", tipo: "despesa", user_id: null, created_at: "" },
    { id: "local-tv-cabo", nome: "TV a cabo", icone: "Tv", cor: "blue", tipo: "despesa", user_id: null, created_at: "" },
    { id: "650e8400-e29b-41d4-a716-446655440002", nome: "Delivery", icone: "Utensils", cor: "orange", tipo: "despesa", user_id: null, created_at: "" },
    { id: "local-academia", nome: "Academia", icone: "Dumbbell", cor: "cyan", tipo: "despesa", user_id: null, created_at: "" },
    { id: "local-agua", nome: "Água", icone: "Droplets", cor: "blue", tipo: "despesa", user_id: null, created_at: "" },
    { id: "local-luz", nome: "Luz", icone: "Lightbulb", cor: "teal", tipo: "despesa", user_id: null, created_at: "" },
    { id: "650e8400-e29b-41d4-a716-446655440004", nome: "Saúde", icone: "Heart", cor: "red", tipo: "despesa", user_id: null, created_at: "" },
    { id: "650e8400-e29b-41d4-a716-446655440005", nome: "Educação", icone: "GraduationCap", cor: "green", tipo: "despesa", user_id: null, created_at: "" },
    { id: "local-viagens", nome: "Viagens", icone: "Plane", cor: "indigo", tipo: "despesa", user_id: null, created_at: "" },
    { id: "650e8400-e29b-41d4-a716-446655440008", nome: "Outros", icone: "MoreHorizontal", cor: "gray", tipo: "despesa", user_id: null, created_at: "" },
];

interface ExpenseItem {
    id: string;
    description: string;
    value: number;
    date: string;
    category: string;
}

function DespesasContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Get date from URL or default to current date
    const currentMonth = searchParams.get("month") ? parseInt(searchParams.get("month")!) : new Date().getMonth() + 1;
    const currentYear = searchParams.get("year") ? parseInt(searchParams.get("year")!) : new Date().getFullYear();
    const statementScope = searchParams.get("scope") === "annual" ? "annual" : "monthly";
    const periodLabel = statementScope === "annual" ? `Ano ${currentYear}` : `${currentMonth}/${currentYear}`;

    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedCategoryForModal, setSelectedCategoryForModal] = useState<string | null>(null);
    const [localExpenses, setLocalExpenses] = useState<ExpenseItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { despesas, loading: loadingDespesas, error, refetch } = useDespesas(currentMonth, currentYear, statementScope);
    const { cartoes } = useCartoes();
    const { categorias, loading: loadingCategorias } = useCategorias();
    const databaseUnavailable = Boolean(error?.includes("Could not find the table") || error?.includes("schema cache"));

    const handleDateChange = (newDate: { month: number; year: number }) => {
        const params = new URLSearchParams(searchParams);
        params.set("month", newDate.month.toString());
        params.set("year", newDate.year.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleScopeChange = (scope: "monthly" | "annual") => {
        const params = new URLSearchParams(searchParams);
        params.set("scope", scope);
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleDeleteExpense = async (id: string) => {
        if (databaseUnavailable || id.startsWith("local-")) {
            setLocalExpenses(prev => prev.filter(item => item.id !== id));
            return;
        }

        const { error } = await supabase.from("despesas").delete().eq("id", id);
        if (error) {
            alert("Erro ao excluir despesa. Tente novamente.");
            return;
        }
        refetch();
    };

    const databaseExpenses: ExpenseItem[] = despesas.map((item) => {
        const [year, month, day] = item.data.split("-");
        return {
            id: item.id,
            description: item.descricao,
            value: Number(item.valor),
            date: `${day}/${month}/${year}`,
            category: item.categoria_id,
        };
    });
    const filteredExpenses = databaseUnavailable ? localExpenses : databaseExpenses;

    const getItemsByCategory = (categoryId: string) => {
        return filteredExpenses.filter((item) => item.category === categoryId);
    };

    const getTotalByCategory = (categoryId: string) => {
        return filteredExpenses
            .filter((item) => item.category === categoryId)
            .reduce((sum, item) => sum + item.value, 0);
    };

    const totalDespesas = filteredExpenses.reduce((sum, item) => sum + item.value, 0);

    const categorySource = [
        ...commonExpenseCategories,
        ...categorias.filter((cat) => !commonExpenseCategories.some((common) => common.id === cat.id || common.nome === cat.nome)),
    ];

    const categoriasDespesa = categorySource.map((cat) => ({
        id: cat.id,
        label: cat.nome,
        icone: iconMap[cat.icone as keyof typeof iconMap] ?? MoreHorizontal,
        cor: colorMap[cat.cor] ?? cat.cor ?? "from-gray-500 to-gray-400",
    }));

    const getCategoryById = (id: string) => {
        return categoriasDespesa.find((c) => c.id === id);
    };
    const loading = !databaseUnavailable && (loadingDespesas || loadingCategorias);

    const openExpenseModal = (categoryId?: string) => {
        setSelectedCategoryForModal(categoryId ?? activeCategory);
        setIsModalOpen(true);
    };

    const handleSaveLocalExpenses = (newExpenses: any[]) => {
        const formattedExpenses = newExpenses.map((expense) => ({
            id: `local-${Date.now()}-${Math.random()}`,
            description: expense.description,
            value: Number(expense.value),
            date: expense.date,
            category: expense.category,
        }));
        setLocalExpenses(prev => [...formattedExpenses, ...prev]);
    };

    return (
        <div className="min-h-screen">
            <Sidebar />

            <main className="md:ml-64 p-4 pt-24 md:p-8 transition-all duration-300">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Despesas</h1>
                            <p className="text-muted mt-1">
                                Controle seus gastos e despesas mensais
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <PrintExportButtons title="Despesas" period={periodLabel} />
                            <div className="no-print flex rounded-lg border p-1" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
                                <button
                                    type="button"
                                    onClick={() => handleScopeChange("monthly")}
                                    className="rounded-md px-3 py-2 text-sm font-medium"
                                    style={statementScope === "monthly" ? { background: "var(--accent)", color: "white" } : { color: "var(--text-secondary)" }}
                                >
                                    Mensal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleScopeChange("annual")}
                                    className="rounded-md px-3 py-2 text-sm font-medium"
                                    style={statementScope === "annual" ? { background: "var(--accent)", color: "white" } : { color: "var(--text-secondary)" }}
                                >
                                    Anual
                                </button>
                            </div>
                            <button
                                onClick={() => openExpenseModal()}
                                className="flex items-center gap-2 px-5 py-3 text-foreground font-medium rounded-xl transition-all hover:shadow-lg no-print"
                                style={{
                                    background: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
                                    boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)",
                                }}
                            >
                                <Plus size={20} />
                                Nova Despesa
                            </button>
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div data-print-hide="true" className="mt-6 glass-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted text-sm font-medium">Total de Despesas</p>
                                <h2 className="text-3xl font-bold text-red-400 mt-1">
                                    R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <MonthYearPicker
                                    date={{ month: currentMonth, year: currentYear }}
                                    onChange={handleDateChange}
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Category Cards */}
                <div data-print-hide="true" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-8">
                    {categoriasDespesa.map((cat) => {
                        const total = getTotalByCategory(cat.id);
                        const isActive = activeCategory === cat.id;
                        const IconComponent = cat.icone;

                        return (
                            <div
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(isActive ? null : cat.id);
                                    setSelectedCategoryForModal(cat.id);
                                }}
                                className={`soft-card p-4 cursor-pointer transition-all duration-300 ${isActive ? "ring-2 ring-red-400 ring-offset-2 scale-105" : "hover:scale-102"
                                    }`}
                            >
                                <div className="flex flex-col items-center text-center gap-3">
                                    <div
                                        className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${cat.cor}`}
                                        style={{
                                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                        }}
                                    >
                                        <IconComponent size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-muted text-xs font-medium leading-tight">{cat.label}</p>
                                        <h3 className="text-lg font-bold text-foreground mt-1">
                                            R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                setActiveCategory(cat.id);
                                                openExpenseModal(cat.id);
                                            }}
                                            className="mt-2 text-[11px] font-medium"
                                            style={{ color: "var(--secondary)" }}
                                        >
                                            Lançar aqui
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Items List */}
                <div className="glass-card p-6">
                    <div data-print-only="true" className="hidden">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-foreground">Histórico de Despesas</h2>
                            <p className="text-sm text-muted">Período: {periodLabel}</p>
                        </div>

                        {filteredExpenses.length > 0 ? (
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Descrição</th>
                                        <th>Categoria</th>
                                        <th style={{ textAlign: "right" }}>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredExpenses.map((item) => (
                                        <tr key={`print-${item.id}`}>
                                            <td>{item.date}</td>
                                            <td>{item.description}</td>
                                            <td>{getCategoryById(item.category)?.label ?? "Despesa"}</td>
                                            <td style={{ textAlign: "right", color: "#dc2626", fontWeight: 700 }}>
                                                - {item.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={3} style={{ textAlign: "right", fontWeight: 700 }}>Total de despesas</td>
                                        <td style={{ textAlign: "right", color: "#dc2626", fontWeight: 700 }}>
                                            {totalDespesas.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        ) : (
                            <p className="text-muted">Nenhuma despesa encontrada para este período.</p>
                        )}
                    </div>

                    <div data-print-hide="true">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-foreground">
                            {activeCategory
                                ? getCategoryById(activeCategory)?.label
                                : "Todas as Despesas"}
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

                    {error && (
                        <div
                            className="mb-4 rounded-xl border p-4 text-sm"
                            style={{
                                background: databaseUnavailable
                                    ? "color-mix(in srgb, var(--accent) 8%, transparent)"
                                    : "rgba(239, 68, 68, 0.1)",
                                borderColor: databaseUnavailable
                                    ? "color-mix(in srgb, var(--accent) 18%, transparent)"
                                    : "rgba(239, 68, 68, 0.2)",
                                color: databaseUnavailable ? "var(--text-secondary)" : "#fca5a5",
                            }}
                        >
                            {databaseUnavailable
                                ? "Modo beta local ativo: a tabela de despesas ainda não foi criada no Supabase. Você pode testar os lançamentos nesta sessão."
                                : `Não foi possível carregar suas despesas: ${error}`}
                        </div>
                    )}

                    {loading && (
                        <div className="flex items-center justify-center py-12 text-muted">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Carregando despesas...
                        </div>
                    )}

                    {!loading && (
                    <div className="space-y-3">
                        {(activeCategory
                            ? getItemsByCategory(activeCategory)
                            : filteredExpenses
                        ).map((item) => {
                            const cat = getCategoryById(item.category);
                            const IconComponent = cat?.icone;

                            return (
                                <div
                                    key={item.id}
                                    data-print-row="true"
                                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-11 h-11 rounded-lg flex items-center justify-center bg-gradient-to-br ${cat?.cor}`}
                                        >
                                            {IconComponent && <IconComponent size={20} className="text-white" />}
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
                                        <span className="font-bold text-red-400 text-lg">
                                            - R$ {item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </span>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                                <Edit size={16} className="text-muted" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Excluir "${item.description}"?`)) {
                                                        handleDeleteExpense(item.id);
                                                    }
                                                }}
                                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} className="text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    )}

                    {/* Empty State */}
                    {!loading && filteredExpenses.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted">Nenhuma despesa encontrada para este período.</p>
                        </div>
                    )}
                    {!loading && filteredExpenses.length > 0 && activeCategory && getItemsByCategory(activeCategory).length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-muted">Nenhuma despesa nesta categoria</p>
                        </div>
                    )}
                    </div>
                </div>
            </main>

            <ExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={refetch}
                onSaveLocal={databaseUnavailable ? handleSaveLocalExpenses : undefined}
                cartoes={cartoes}
                categorias={categorySource as any}
                initialCategoryId={selectedCategoryForModal}
            />
        </div>
    );
}

export default function DespesasPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <DespesasContent />
        </Suspense>
    );
}
