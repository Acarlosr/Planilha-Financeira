"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import BotaoVoltar from "@/components/BotaoVoltar";
import CardResumo from "@/components/CardResumo";
import TabelaTesouros from "@/components/TabelaTesouros";
import HistoricoAportes from "@/components/HistoricoAportes";
import { Plus, Landmark, TrendingUp, CalendarDays } from "lucide-react";
import { mockTesouroDireto } from "@/data/aplicacoes-mock";

export default function TesouroDiretoPage() {
    const [titulos, setTitulos] = useState(mockTesouroDireto);

    const handleDeleteTitulo = (id: string) => {
        setTitulos(prev => prev.filter(t => t.id !== id));
    };

    // Mocks local history specifically for this view
    const historico = [
        { id: 1, data: '10/01/2026', descricao: 'Aporte Tesouro Selic 2029', valor: 500 },
        { id: 2, data: '20/12/2025', descricao: 'Aporte Tesouro IPCA+ 2035', valor: 1500 },
        { id: 3, data: '10/11/2025', descricao: 'Aporte Inicial Tesouro Prefixado', valor: 3000 }
    ];

    const totalAplicado = titulos.reduce((acc, t) => acc + t.valorAplicado, 0);
    const rendimentoTotal = titulos.reduce((acc, t) => acc + t.rendimentoAcumulado, 0);

    return (
        <div className="min-h-screen">
            <Sidebar />

            <main className="ml-64 p-8 transition-all duration-300">
                <BotaoVoltar label="Voltar para Aplicações" fallbackUrl="/aplicacao" />

                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Tesouro Direto</h1>
                        <p className="text-muted mt-1">
                            Títulos públicos federais com garantia do Governo
                        </p>
                    </div>
                    <button
                        className="flex items-center justify-center gap-2 px-5 py-3 text-white font-medium rounded-xl transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-105"
                        style={{
                            background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                        }}
                    >
                        <Plus size={20} />
                        Novo Título
                    </button>
                </header>

                {/* Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <CardResumo
                        titulo="Total Aplicado"
                        valor={totalAplicado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        icone={<Landmark size={24} />}
                        corGrafico="from-blue-600 to-blue-400"
                    />
                    <CardResumo
                        titulo="Rendimento Acumulado"
                        valor={`+ ${rendimentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                        icone={<TrendingUp size={24} />}
                        corGrafico="from-emerald-600 to-emerald-400"
                    />
                    <CardResumo
                        titulo="Rendimento no Mês"
                        valor="+ R$ 45,20"
                        icone={<CalendarDays size={24} />}
                        corGrafico="from-amber-500 to-amber-400"
                        subtexto="<span class='text-emerald-400'>+1.2%</span> em Janeiro"
                    />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Tabela Principal */}
                    <div className="xl:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold text-foreground border-b border-white/10 pb-3">
                            Meus Títulos
                        </h2>
                        <div className="glass-card rounded-2xl p-1 overflow-hidden">
                            <TabelaTesouros titulos={titulos} onDelete={handleDeleteTitulo} />
                        </div>
                    </div>

                    {/* Histórico Lateral */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-foreground border-b border-white/10 pb-3">
                            Histórico de Aportes
                        </h2>
                        <div className="glass-card rounded-2xl p-5">
                            <HistoricoAportes aportes={historico} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
