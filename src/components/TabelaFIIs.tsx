"use client";

import { FII } from "@/types/aplicacoes";
import { Trash2 } from "lucide-react";

interface TabelaFIIsProps {
    fiis: FII[];
    onDelete?: (id: string) => void;
}

export default function TabelaFIIs({ fiis, onDelete }: TabelaFIIsProps) {
    const getCorSector = (setor: string) => {
        switch (setor.toLowerCase()) {
            case 'logística': return 'bg-blue-500/20 text-blue-400';
            case 'papel': return 'bg-purple-500/20 text-purple-400';
            case 'shoppings': return 'bg-pink-500/20 text-pink-400';
            case 'lajes corporativas': return 'bg-cyan-500/20 text-cyan-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/10 text-muted text-sm">
                        <th className="pb-3 px-4 font-medium">Fundo</th>
                        <th className="pb-3 px-4 font-medium hidden md:table-cell">Setor</th>
                        <th className="pb-3 px-4 font-medium text-right">Qtd. Cotas</th>
                        <th className="pb-3 px-4 font-medium text-right hidden sm:table-cell">Preço Médio</th>
                        <th className="pb-3 px-4 font-medium text-right">Valor Atual</th>
                        <th className="pb-3 px-4 font-medium text-right">DY (12m)</th>
                        {onDelete && <th className="pb-3 px-4 font-medium text-center w-16"></th>}
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {fiis.map((fii) => (
                        <tr key={fii.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                            <td className="py-4 px-4 font-bold text-foreground">
                                <div className="flex flex-col">
                                    <span className="px-2 py-1 bg-white/5 rounded w-fit pb-1.5">{fii.ticker}</span>
                                    <span className="text-xs text-muted font-normal mt-1 hidden sm:block">{fii.nome}</span>
                                </div>
                            </td>
                            <td className="py-4 px-4 hidden md:table-cell">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCorSector(fii.setor)}`}>
                                    {fii.setor}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-right text-muted">{fii.quantidade}</td>
                            <td className="py-4 px-4 text-right text-muted hidden sm:table-cell">
                                {fii.precoMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="py-4 px-4 text-right text-foreground font-medium">
                                {fii.valorAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="py-4 px-4 text-right">
                                <span className="font-bold text-emerald-400">
                                    {fii.dyAnual.toFixed(2)}%
                                </span>
                            </td>
                            {onDelete && (
                                <td className="py-4 px-4 text-center">
                                    <button
                                        onClick={() => {
                                            if (confirm(`Excluir "${fii.ticker} - ${fii.nome}"?`)) {
                                                onDelete(fii.id);
                                            }
                                        }}
                                        className="p-2 hover:bg-red-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} className="text-red-400" />
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                    {fiis.length === 0 && (
                        <tr>
                            <td colSpan={onDelete ? 7 : 6} className="py-8 text-center text-muted">Nenhum FII cadastrado.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
