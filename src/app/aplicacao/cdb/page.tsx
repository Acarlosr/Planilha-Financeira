"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import BotaoVoltar from "@/components/BotaoVoltar";
import CardResumo from "@/components/CardResumo";
import TabelaRendaFixa from "@/components/TabelaRendaFixa";
import NovoTituloRFModal from "@/components/NovoTituloRFModal";
import PrintExportButtons from "@/components/PrintExportButtons";
import { Plus, Building2, TrendingUp, AlertTriangle } from "lucide-react";
import { mockRendaFixaPrivada } from "@/data/aplicacoes-mock";

export default function RendaFixaPage() {
    const [titulos, setTitulos] = useState(mockRendaFixaPrivada);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDeleteTitulo = (id: string) => {
        setTitulos(prev => prev.filter(t => t.id !== id));
    };

    // Totais
    const totalAplicado = titulos.reduce((acc, t) => acc + t.valorAplicado, 0);
    const rendimentoTotal = titulos.reduce((acc, t) => acc + t.rendimentoAcumulado, 0);

    const vencimentosProximos = titulos.filter(t => {
        const vencimentoRawDate = new Date(t.vencimento);
        const currDate = new Date();
        const diffTime = vencimentoRawDate.getTime() - currDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 30;
    }).length;

    return (
        <div className="min-h-screen">
            <Sidebar />

            <main className="md:ml-64 p-4 pt-24 md:p-8 transition-all duration-300">
                <BotaoVoltar label="Voltar para Aplicações" fallbackUrl="/aplicacao" />

                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">CDB / LCI / LCA</h1>
                        <p className="text-muted mt-1">
                            Renda Fixa privada com garantia do FGC
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <PrintExportButtons title="CDB LCI LCA" period="Extrato de posições" />
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="no-print flex items-center justify-center gap-2 px-5 py-3 text-white font-medium rounded-xl transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:scale-105"
                            style={{
                                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
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
                        icone={<Building2 size={24} />}
                        corGrafico="from-amber-600 to-amber-400"
                    />
                    <CardResumo
                        titulo="Rendimento Acumulado"
                        valor={`+ ${rendimentoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
                        icone={<TrendingUp size={24} />}
                        corGrafico="from-emerald-600 to-emerald-400"
                    />
                    <CardResumo
                        titulo="Vencimentos Próximos"
                        valor={vencimentosProximos.toString()}
                        icone={<AlertTriangle size={24} />}
                        corGrafico={vencimentosProximos > 0 ? "from-orange-600 to-orange-400" : "from-blue-600 to-blue-400"}
                        subtexto={vencimentosProximos > 0
                            ? `<span class="text-orange-400 font-bold">Atenção!</span> Títulos vencendo em < 30 dias`
                            : `Nenhum título vencendo nos próximos 30 dias`
                        }
                    />
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-foreground border-b border-white/10 pb-3">
                        Meus Títulos (Instituições Privadas)
                    </h2>
                    <div className="glass-card rounded-2xl p-1 overflow-hidden">
                        <TabelaRendaFixa titulos={titulos} onDelete={handleDeleteTitulo} />
                    </div>
                </div>
            </main>

            <NovoTituloRFModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={(titulo) => setTitulos((prev) => [titulo, ...prev])}
            />
        </div>
    );
}
