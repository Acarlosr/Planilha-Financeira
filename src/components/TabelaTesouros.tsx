"use client";

import { TesouroDireto } from "@/types/aplicacoes";

interface TabelaTesourosProps {
    titulos: TesouroDireto[];
}

export default function TabelaTesouros({ titulos }: TabelaTesourosProps) {
    const getTipoBadge = (tipo: string) => {
        switch (tipo) {
            case 'selic': return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-md border border-blue-500/30">Pós-fixado (Selic)</span>;
            case 'ipca': return <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-md border border-amber-500/30">Híbrido (IPCA+)</span>;
            case 'pre': return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-md border border-purple-500/30">Pré-fixado</span>;
            default: return null;
        }
    };

    const formatDate = (isoStr: string) => {
        const [y, m, d] = isoStr.split('-');
        return `${d}/${m}/${y}`;
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/10 text-muted text-sm">
                        <th className="pb-3 px-4 font-medium">Título</th>
                        <th className="pb-3 px-4 font-medium">Tipo</th>
                        <th className="pb-3 px-4 font-medium hidden md:table-cell">Data Compra</th>
                        <th className="pb-3 px-4 font-medium hidden md:table-cell">Vencimento</th>
                        <th className="pb-3 px-4 font-medium text-right">Valor Aplicado</th>
                        <th className="pb-3 px-4 font-medium hidden lg:table-cell">Taxa</th>
                        <th className="pb-3 px-4 font-medium text-right">Rendimento Acum.</th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {titulos.map((t) => (
                        <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4 font-medium text-foreground">{t.titulo}</td>
                            <td className="py-4 px-4">{getTipoBadge(t.tipo)}</td>
                            <td className="py-4 px-4 text-muted hidden md:table-cell">{formatDate(t.dataCompra)}</td>
                            <td className="py-4 px-4 text-muted hidden md:table-cell">{formatDate(t.vencimento)}</td>
                            <td className="py-4 px-4 text-right text-foreground font-medium">
                                {t.valorAplicado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="py-4 px-4 text-cyan-400 hidden lg:table-cell font-medium">{t.taxa}</td>
                            <td className="py-4 px-4 text-right font-bold text-emerald-400">
                                + {t.rendimentoAcumulado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                        </tr>
                    ))}
                    {titulos.length === 0 && (
                        <tr>
                            <td colSpan={7} className="py-8 text-center text-muted">Nenhum título cadastrado.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
