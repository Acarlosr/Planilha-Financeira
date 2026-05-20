"use client";

import { Acao } from "@/types/aplicacoes";
import { Trash2 } from "lucide-react";

interface TabelaAcoesProps {
    acoes: Acao[];
    onDelete?: (id: string) => void;
}

export default function TabelaAcoes({ acoes, onDelete }: TabelaAcoesProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b text-muted text-sm" style={{ borderColor: "var(--card-border)" }}>
                        <th className="pb-3 px-4 font-medium">Ticker</th>
                        <th className="pb-3 px-4 font-medium">Empresa</th>
                        <th className="pb-3 px-4 font-medium text-right">Qtd.</th>
                        <th className="pb-3 px-4 font-medium text-right hidden sm:table-cell">Preço Médio</th>
                        <th className="pb-3 px-4 font-medium text-right">Valor Atual</th>
                        <th className="pb-3 px-4 font-medium text-right">Variação</th>
                        {onDelete && <th className="pb-3 px-4 font-medium text-center w-16"></th>}
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {acoes.map((acao) => {
                        const valorTotalMedio = acao.quantidade * acao.precoMedio;
                        const variacaoRS = acao.valorAtual - valorTotalMedio;
                        const variacaoPerc = (variacaoRS / valorTotalMedio) * 100;
                        const isPositivo = variacaoRS >= 0;

                        return (
                            <tr key={acao.id} className="border-b transition-colors group hover:bg-black/5" style={{ borderColor: "var(--card-border)" }}>
                                <td className="py-4 px-4 font-bold text-foreground">
                                    <span className="px-2 py-1 rounded mx-1 pb-1.5" style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)" }}>{acao.ticker}</span>
                                </td>
                                <td className="py-4 px-4 text-foreground">{acao.empresa}</td>
                                <td className="py-4 px-4 text-right text-muted">{acao.quantidade}</td>
                                <td className="py-4 px-4 text-right text-muted hidden sm:table-cell">
                                    {acao.precoMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td className="py-4 px-4 text-right text-foreground font-medium">
                                    {acao.valorAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td className="py-4 px-4 text-right font-medium">
                                    <div className={`flex flex-col ${isPositivo ? 'text-emerald-600' : 'text-red-500'}`}>
                                        <span>{isPositivo ? '+' : ''}{variacaoPerc.toFixed(2)}%</span>
                                    </div>
                                </td>
                                {onDelete && (
                                    <td className="py-4 px-4 text-center">
                                        <button
                                            onClick={() => {
                                                if (confirm(`Excluir "${acao.ticker} - ${acao.empresa}"?`)) {
                                                    onDelete(acao.id);
                                                }
                                            }}
                                            className="p-2 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} className="text-red-500" />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                    {acoes.length === 0 && (
                        <tr>
                            <td colSpan={onDelete ? 7 : 6} className="py-8 text-center text-muted">Nenhuma ação cadastrada.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
