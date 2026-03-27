"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import BotaoVoltar from "@/components/BotaoVoltar";
import CardResumo from "@/components/CardResumo";
import TabelaFIIs from "@/components/TabelaFIIs";
import TabelaDividendos from "@/components/TabelaDividendos";
import ResumoDividendos from "@/components/ResumoDividendos";
import NovaPosicaoFIIModal from "@/components/NovaPosicaoFIIModal";
import RegistrarDividendoModal from "@/components/RegistrarDividendoModal";
import { Plus, HandCoins, Building, TrendingUp, Percent } from "lucide-react";
import { mockFIIs, mockDividendos } from "@/data/aplicacoes-mock";

export default function FIIsPage() {
    const [fiis, setFiis] = useState(mockFIIs);
    const [dividendos, setDividendos] = useState(mockDividendos.filter(d => ['rendimento_fii', 'amortizacao'].includes(d.tipo)));

    const [isPosicaoModalOpen, setPosicaoModalOpen] = useState(false);
    const [isDividendoModalOpen, setDividendoModalOpen] = useState(false);

    // Totais
    const patrimonioTotal = fiis.reduce((acc, fii) => acc + fii.valorAtual, 0);
    const yieldMedio = fiis.length > 0
        ? (fiis.reduce((acc, fii) => acc + fii.dyAnual, 0) / fiis.length).toFixed(2)
        : "0.00";

    const dividendosMes = dividendos
        .filter(d => d.dataPagamento.startsWith('2026-01')) // mock
        .reduce((acc, d) => acc + d.valorTotal, 0);

    const dividendosAcumulados = dividendos.reduce((acc, d) => acc + d.valorTotal, 0);

    const handleDeleteFII = (id: string) => {
        setFiis(prev => prev.filter(f => f.id !== id));
    };

    const handleDeleteDividendo = (id: string) => {
        setDividendos(prev => prev.filter(d => d.id !== id));
    };

    return (
        <div className="min-h-screen">
            <Sidebar />

            <main className="ml-64 p-8 transition-all duration-300">
                <BotaoVoltar label="Voltar para Aplicações" fallbackUrl="/aplicacao" />

                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Fundos Imobiliários</h1>
                        <p className="text-muted mt-1">
                            Renda mensal passiva com imóveis e recebíveis
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setDividendoModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-foreground hover:bg-white/10 font-medium rounded-xl transition-all border border-white/10"
                        >
                            <HandCoins size={18} className="text-amber-400" />
                            Lançar Rendimento
                        </button>
                        <button
                            onClick={() => setPosicaoModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-5 py-3 text-white font-medium rounded-xl transition-all hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-105"
                            style={{
                                background: "linear-gradient(135deg, #A855F7 0%, #7E22CE 100%)",
                            }}
                        >
                            <Plus size={20} />
                            Novo Fundo
                        </button>
                    </div>
                </header>

                {/* Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                    <div className="xl:col-span-1">
                        <CardResumo
                            titulo="Total Aplicado"
                            valor={patrimonioTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            icone={<Building size={24} />}
                            corGrafico="from-purple-600 to-purple-400"
                        />
                    </div>
                    <div className="xl:col-span-1">
                        <CardResumo
                            titulo="Rendimentos no Mês"
                            valor={dividendosMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            icone={<HandCoins size={24} />}
                            corGrafico="from-amber-600 to-amber-400"
                        />
                    </div>
                    <div className="xl:col-span-1">
                        <CardResumo
                            titulo="Rendimentos Acumulados"
                            valor={dividendosAcumulados.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            icone={<TrendingUp size={24} />}
                            corGrafico="from-emerald-600 to-emerald-400"
                        />
                    </div>
                    <div className="xl:col-span-1">
                        <CardResumo
                            titulo="Yield Médio (12m)"
                            valor={`${yieldMedio}%`}
                            icone={<Percent size={24} />}
                            corGrafico="from-blue-600 to-blue-400"
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Tabela de Fundos */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground border-b border-white/10 pb-3 mb-6">
                            Meus Fundos
                        </h2>
                        <div className="glass-card rounded-2xl p-1 overflow-hidden">
                            <TabelaFIIs fiis={fiis} onDelete={handleDeleteFII} />
                        </div>
                    </section>

                    {/* Seção Rendimentos */}
                    <section>
                        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
                            <h2 className="text-xl font-bold text-foreground">
                                Rendimentos Recebidos
                            </h2>
                            <select className="px-3 py-1.5 bg-black/20 text-foreground border border-white/10 rounded-lg outline-none text-sm font-medium">
                                <option value="2026-01">Janeiro/2026</option>
                                <option value="2025-12">Dezembro/2025</option>
                                <option value="2025-11">Novembro/2025</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 glass-card rounded-2xl p-1 overflow-hidden">
                                <TabelaDividendos dividendos={dividendos} onDelete={handleDeleteDividendo} />
                            </div>
                            <div className="lg:col-span-1">
                                <ResumoDividendos
                                    totalMes={dividendosMes}
                                    totalAcumulado={dividendosAcumulados}
                                    mesAberto="Janeiro/2026"
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <NovaPosicaoFIIModal
                isOpen={isPosicaoModalOpen}
                onClose={() => setPosicaoModalOpen(false)}
                onSave={(fii) => console.log('Salvar FII', fii)}
            />

            {/* Reusing dividendos modal since they share structure */}
            <RegistrarDividendoModal
                isOpen={isDividendoModalOpen}
                onClose={() => setDividendoModalOpen(false)}
                onSave={(div) => console.log('Salvar rendimento', div)}
            />
        </div>
    );
}
