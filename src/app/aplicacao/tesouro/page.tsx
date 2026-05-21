"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import BotaoVoltar from "@/components/BotaoVoltar";
import CardResumo from "@/components/CardResumo";
import TabelaTesouros from "@/components/TabelaTesouros";
import HistoricoAportes from "@/components/HistoricoAportes";
import NovoTituloModal from "@/components/NovoTituloModal";
import PrintExportButtons from "@/components/PrintExportButtons";
import { Plus, Landmark, TrendingUp, CalendarDays } from "lucide-react";
import { mockTesouroDireto } from "@/data/aplicacoes-mock";
import { TesouroDireto } from "@/types/aplicacoes";

export default function TesouroDiretoPage() {
    const [titulos, setTitulos] = useState(mockTesouroDireto);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDeleteTitulo = (id: string) => {
        setTitulos(prev => prev.filter(t => t.id !== id));
    };

    const historico = titulos.map((titulo, index) => ({
        id: index + 1,
        data: new Date(`${titulo.dataCompra}T00:00:00`).toLocaleDateString("pt-BR"),
        descricao: `Aporte ${titulo.titulo}`,
        valor: titulo.valorAplicado,
    }));

    const totalAplicado = titulos.reduce((acc, t) => acc + t.valorAplicado, 0);
    const rendimentoTotal = titulos.reduce((acc, t) => acc + t.rendimentoAcumulado, 0);

    return (
        <div className="min-h-screen">
            <Sidebar />

            <main className="md:ml-64 p-4 pt-24 md:p-8 transition-all duration-300">
                <BotaoVoltar label="Voltar para Aplicações" fallbackUrl="/aplicacao" />

                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Tesouro Direto</h1>
                        <p className="text-muted mt-1">
                            Títulos públicos federais com garantia do Governo
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <PrintExportButtons title="Tesouro Direto" period="Extrato de posições" />
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="no-print flex items-center justify-center gap-2 px-5 py-3 text-white font-medium rounded-xl transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-105"
                            style={{
                                background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                            }}
                        >
                            <Plus size={20} />
                            Novo Título
                        </button>
                    </div>
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
                        valor="+ R$ 0,00"
                        icone={<CalendarDays size={24} />}
                        corGrafico="from-amber-500 to-amber-400"
                        subtexto="<span class='text-muted'>Sem rendimento lançado</span>"
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
            <NovoTituloModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={(titulo: TesouroDireto) => setTitulos((prev) => [titulo, ...prev])}
            />
        </div>
    );
}
