"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import BotaoVoltar from "@/components/BotaoVoltar";
import Button from "@/components/ui/Button";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";
import { usePosicoesAcoes } from "@/hooks/usePosicoesAcoes";
import { usePosicoesFiis } from "@/hooks/usePosicoesFiis";
import { extrairTextoPDF } from "@/lib/extrairTextoPDF";
import { parseNotaCorretagem, classificarTicker } from "@/lib/importarNotaCorretagem";
import { Upload, AlertTriangle, Plus, FileWarning } from "lucide-react";

interface LinhaRevisao {
    id: string;
    tipoOperacao: "compra" | "venda";
    classe: "acao" | "fii";
    ticker: string;
    nomeEmpresa: string;
    quantidade: number;
    precoUnitario: number;
    taxaAlocada: number;
    incluir: boolean;
}

const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

let contadorId = 0;
const proximoId = () => `linha-${++contadorId}`;

export default function ImportarNotaPage() {
    const { insertAcao } = usePosicoesAcoes();
    const { insertFii } = usePosicoesFiis();
    const { toasts, toast, removeToast } = useToast();

    const [nomeArquivo, setNomeArquivo] = useState("");
    const [processando, setProcessando] = useState(false);
    const [importando, setImportando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [avisoVendas, setAvisoVendas] = useState(0);
    const [data, setData] = useState(new Date().toISOString().split("T")[0]);
    const [corretora, setCorretora] = useState("");
    const [linhas, setLinhas] = useState<LinhaRevisao[]>([]);

    const handleArquivo = async (file: File) => {
        setErro(null);
        setNomeArquivo(file.name);
        setProcessando(true);
        try {
            const texto = await extrairTextoPDF(file);
            const { dataPregao, trades } = parseNotaCorretagem(texto);
            if (dataPregao) setData(dataPregao);

            if (trades.length === 0) {
                setErro("Não reconheci nenhuma negociação nesse PDF automaticamente. Adicione as linhas manualmente abaixo.");
            }

            const vendas = trades.filter((t) => t.tipoOperacao === "venda").length;
            setAvisoVendas(vendas);

            setLinhas(
                trades.map((t) => ({
                    id: proximoId(),
                    tipoOperacao: t.tipoOperacao,
                    classe: classificarTicker(t.ticker),
                    ticker: t.ticker,
                    nomeEmpresa: t.ticker,
                    quantidade: t.quantidade,
                    precoUnitario: t.precoUnitario,
                    taxaAlocada: t.taxaAlocada,
                    incluir: t.tipoOperacao === "compra",
                }))
            );
        } catch (err) {
            setErro(err instanceof Error ? `Erro ao ler o PDF: ${err.message}` : "Erro ao ler o PDF.");
        } finally {
            setProcessando(false);
        }
    };

    const adicionarLinhaManual = () => {
        setLinhas((prev) => [
            ...prev,
            {
                id: proximoId(),
                tipoOperacao: "compra",
                classe: "acao",
                ticker: "",
                nomeEmpresa: "",
                quantidade: 0,
                precoUnitario: 0,
                taxaAlocada: 0,
                incluir: true,
            },
        ]);
    };

    const removerLinha = (id: string) => {
        setLinhas((prev) => prev.filter((l) => l.id !== id));
    };

    const atualizarLinha = (id: string, patch: Partial<LinhaRevisao>) => {
        setLinhas((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    };

    const linhasIncluidas = useMemo(() => linhas.filter((l) => l.incluir && l.tipoOperacao === "compra"), [linhas]);

    const handleImportar = async () => {
        const invalidas = linhasIncluidas.filter((l) => !l.ticker.trim() || l.quantidade <= 0 || l.precoUnitario <= 0);
        if (linhasIncluidas.length === 0) {
            toast.error("Nenhuma linha de compra selecionada para importar.");
            return;
        }
        if (invalidas.length > 0) {
            toast.error("Preencha ticker, quantidade e preço em todas as linhas selecionadas.");
            return;
        }

        setImportando(true);
        try {
            for (const l of linhasIncluidas) {
                const custoTotal = l.quantidade * l.precoUnitario + l.taxaAlocada;
                const precoMedio = custoTotal / l.quantidade;

                if (l.classe === "acao") {
                    await insertAcao({
                        ticker: l.ticker.toUpperCase(),
                        empresa: l.nomeEmpresa.trim() || l.ticker.toUpperCase(),
                        quantidade: l.quantidade,
                        precoMedio,
                        valorAtual: custoTotal,
                        corretora: corretora.trim() || undefined,
                        dataCompra: data,
                    });
                } else {
                    await insertFii({
                        ticker: l.ticker.toUpperCase(),
                        nome: l.nomeEmpresa.trim() || l.ticker.toUpperCase(),
                        setor: "Não informado",
                        quantidade: l.quantidade,
                        precoMedio,
                        valorAtual: custoTotal,
                        dyAnual: 0,
                    });
                }
            }

            toast.success(`${linhasIncluidas.length} posição(ões) importada(s) com sucesso.`);
            setLinhas([]);
            setNomeArquivo("");
            setAvisoVendas(0);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro ao importar posições.");
        } finally {
            setImportando(false);
        }
    };

    return (
        <div className="min-h-screen">
            <Sidebar />

            <main className="md:ml-64 p-4 pt-24 md:p-8 transition-all duration-300 max-w-5xl">
                <BotaoVoltar label="Voltar para Aplicações" fallbackUrl="/aplicacao" />

                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground">Importar Nota de Corretagem</h1>
                    <p className="text-muted mt-1">
                        Suba o PDF da nota. O reconhecimento automático é aproximativo — revise tudo antes de confirmar.
                    </p>
                </header>

                {erro && (
                    <div className="mb-6 rounded-xl border p-4 text-sm text-amber-300 flex items-center gap-2" style={{ borderColor: "rgba(245, 158, 11, 0.24)", background: "rgba(245, 158, 11, 0.08)" }}>
                        <AlertTriangle size={16} />
                        {erro}
                    </div>
                )}

                {avisoVendas > 0 && (
                    <div className="mb-6 rounded-xl border p-4 text-sm text-amber-300 flex items-center gap-2" style={{ borderColor: "rgba(245, 158, 11, 0.24)", background: "rgba(245, 158, 11, 0.08)" }}>
                        <FileWarning size={16} />
                        {avisoVendas} venda(s) encontrada(s) na nota não são importadas automaticamente — registre-as pelo botão &quot;Vender&quot; nas telas de Ações/FIIs, pra calcular o IR corretamente.
                    </div>
                )}

                <div className="glass-card p-6 space-y-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Data do pregão</label>
                            <input
                                type="date"
                                value={data}
                                onChange={(e) => setData(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all border border-white/10 focus:border-amber-500/50"
                                style={{ background: "rgba(255, 255, 255, 0.05)" }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Corretora (opcional)</label>
                            <input
                                type="text"
                                value={corretora}
                                onChange={(e) => setCorretora(e.target.value)}
                                placeholder="Ex: XP Investimentos"
                                className="w-full px-4 py-3 rounded-xl text-white placeholder:text-muted outline-none transition-all border border-white/10 focus:border-amber-500/50"
                                style={{ background: "rgba(255, 255, 255, 0.05)" }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Arquivo PDF</label>
                            <label className="flex items-center gap-2 rounded-xl border-2 border-dashed border-white/15 hover:border-amber-500/40 cursor-pointer px-4 py-3 transition-colors">
                                <Upload size={18} className="text-muted" />
                                <span className="text-sm text-muted truncate">{nomeArquivo || "Escolher PDF"}</span>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleArquivo(file);
                                    }}
                                />
                            </label>
                        </div>
                    </div>

                    {processando && <p className="text-sm text-muted">Lendo o PDF...</p>}
                </div>

                <div className="glass-card p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-foreground">Linhas reconhecidas</h2>
                        <Button variant="secondary" onClick={adicionarLinhaManual}>
                            <Plus size={16} />
                            Adicionar linha manual
                        </Button>
                    </div>

                    {linhas.length === 0 ? (
                        <p className="text-sm text-muted py-6 text-center">Nenhuma linha ainda. Suba um PDF ou adicione manualmente.</p>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-white/10">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="px-2 py-2"></th>
                                        <th className="text-left px-2 py-2 text-muted font-medium">Op.</th>
                                        <th className="text-left px-2 py-2 text-muted font-medium">Classe</th>
                                        <th className="text-left px-2 py-2 text-muted font-medium">Ticker</th>
                                        <th className="text-left px-2 py-2 text-muted font-medium">Empresa/Nome</th>
                                        <th className="text-right px-2 py-2 text-muted font-medium">Qtd.</th>
                                        <th className="text-right px-2 py-2 text-muted font-medium">Preço unit.</th>
                                        <th className="text-right px-2 py-2 text-muted font-medium">Taxas</th>
                                        <th className="text-right px-2 py-2 text-muted font-medium">Total</th>
                                        <th className="px-2 py-2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {linhas.map((l) => {
                                        const total = l.quantidade * l.precoUnitario + l.taxaAlocada;
                                        const ehVenda = l.tipoOperacao === "venda";
                                        return (
                                            <tr key={l.id} className="border-b border-white/5 last:border-0">
                                                <td className="px-2 py-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={l.incluir && !ehVenda}
                                                        disabled={ehVenda}
                                                        onChange={(e) => atualizarLinha(l.id, { incluir: e.target.checked })}
                                                        title={ehVenda ? "Vendas não são importadas por aqui" : undefined}
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <select
                                                        value={l.tipoOperacao}
                                                        onChange={(e) => atualizarLinha(l.id, { tipoOperacao: e.target.value as "compra" | "venda", incluir: e.target.value === "compra" })}
                                                        className="px-1.5 py-1 rounded-lg text-white text-xs outline-none border border-white/10"
                                                        style={{ background: "rgba(255, 255, 255, 0.05)" }}
                                                    >
                                                        <option value="compra">Compra</option>
                                                        <option value="venda">Venda</option>
                                                    </select>
                                                </td>
                                                <td className="px-2 py-2">
                                                    <select
                                                        value={l.classe}
                                                        onChange={(e) => atualizarLinha(l.id, { classe: e.target.value as "acao" | "fii" })}
                                                        className="px-1.5 py-1 rounded-lg text-white text-xs outline-none border border-white/10"
                                                        style={{ background: "rgba(255, 255, 255, 0.05)" }}
                                                    >
                                                        <option value="acao">Ação</option>
                                                        <option value="fii">FII</option>
                                                    </select>
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input
                                                        type="text"
                                                        value={l.ticker}
                                                        onChange={(e) => atualizarLinha(l.id, { ticker: e.target.value.toUpperCase() })}
                                                        className="w-20 px-2 py-1 rounded-lg text-white text-xs outline-none border border-white/10"
                                                        style={{ background: "rgba(255, 255, 255, 0.05)" }}
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input
                                                        type="text"
                                                        value={l.nomeEmpresa}
                                                        onChange={(e) => atualizarLinha(l.id, { nomeEmpresa: e.target.value })}
                                                        className="w-32 px-2 py-1 rounded-lg text-white text-xs outline-none border border-white/10"
                                                        style={{ background: "rgba(255, 255, 255, 0.05)" }}
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input
                                                        type="number"
                                                        value={l.quantidade || ""}
                                                        onChange={(e) => atualizarLinha(l.id, { quantidade: parseFloat(e.target.value) || 0 })}
                                                        className="w-20 px-2 py-1 rounded-lg text-white text-xs text-right outline-none border border-white/10"
                                                        style={{ background: "rgba(255, 255, 255, 0.05)" }}
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={l.precoUnitario || ""}
                                                        onChange={(e) => atualizarLinha(l.id, { precoUnitario: parseFloat(e.target.value) || 0 })}
                                                        className="w-24 px-2 py-1 rounded-lg text-white text-xs text-right outline-none border border-white/10"
                                                        style={{ background: "rgba(255, 255, 255, 0.05)" }}
                                                    />
                                                </td>
                                                <td className="px-2 py-2">
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={l.taxaAlocada || ""}
                                                        onChange={(e) => atualizarLinha(l.id, { taxaAlocada: parseFloat(e.target.value) || 0 })}
                                                        className="w-20 px-2 py-1 rounded-lg text-white text-xs text-right outline-none border border-white/10"
                                                        style={{ background: "rgba(255, 255, 255, 0.05)" }}
                                                    />
                                                </td>
                                                <td className="px-2 py-2 text-right font-numeric text-foreground">{formatCurrency(total)}</td>
                                                <td className="px-2 py-2">
                                                    <button onClick={() => removerLinha(l.id)} className="text-xs text-red-400 hover:text-red-300">Remover</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <Button onClick={handleImportar} loading={importando} disabled={linhasIncluidas.length === 0}>
                            Importar {linhasIncluidas.length} posição(ões)
                        </Button>
                    </div>
                </div>
            </main>

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}
