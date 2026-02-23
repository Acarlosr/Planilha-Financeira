"use client";

import { HandCoins } from "lucide-react";

interface ResumoDividendosProps {
    totalMes: number;
    totalAcumulado: number;
    mesAberto: string; // Ex: 'Janeiro/2026'
}

export default function ResumoDividendos({ totalMes, totalAcumulado, mesAberto }: ResumoDividendosProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box Mês */}
            <div className="glass-card p-5 relative overflow-hidden group border border-amber-500/20">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <HandCoins size={80} className="text-amber-400" />
                </div>
                <div className="relative z-10">
                    <p className="text-muted text-sm font-medium mb-1">Total no Mês ({mesAberto})</p>
                    <p className="text-2xl font-bold text-amber-400">
                        {totalMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
            </div>

            {/* Box Acumulado */}
            <div className="glass-card p-5 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col justify-center h-full">
                    <p className="text-muted text-sm font-medium mb-1">Total Acumulado na vida</p>
                    <p className="text-2xl font-bold text-foreground">
                        {totalAcumulado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>
            </div>
        </div>
    );
}
