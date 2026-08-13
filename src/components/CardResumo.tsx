"use client";

interface CardResumoProps {
    titulo: string;
    valor: string | React.ReactNode;
    subtexto?: React.ReactNode;
    icone: React.ReactNode;
    corGrafico?: string;
}

export default function CardResumo({ titulo, valor, subtexto, icone, corGrafico = "from-blue-500 to-blue-400" }: CardResumoProps) {
    return (
        <div className="glass-card p-6 relative overflow-hidden group">
            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-muted text-sm font-medium mb-1">{titulo}</p>
                    <h3 className="text-3xl font-bold text-foreground mb-1 font-numeric">{valor}</h3>
                    {subtexto && <p className="text-sm font-medium">{subtexto}</p>}
                </div>
                <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${corGrafico} text-white shadow-sm`}
                >
                    {icone}
                </div>
            </div>
        </div>
    );
}
