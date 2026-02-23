"use client";

interface CardResumoProps {
    titulo: string;
    valor: string | React.ReactNode;
    subtexto?: string;
    icone: React.ReactNode;
    corGrafico?: string;
}

export default function CardResumo({ titulo, valor, subtexto, icone, corGrafico = "from-blue-500 to-blue-400" }: CardResumoProps) {
    return (
        <div className="glass-card p-6 relative overflow-hidden group">
            {/* Decorative gradient blob */}
            <div
                className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${corGrafico} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
            />

            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-muted text-sm font-medium mb-1">{titulo}</p>
                    <h3 className="text-3xl font-bold text-foreground mb-1">{valor}</h3>
                    {subtexto && (
                        <p className="text-sm font-medium" dangerouslySetInnerHTML={{ __html: subtexto }}></p>
                    )}
                </div>
                <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${corGrafico} text-white shadow-lg`}
                >
                    {icone}
                </div>
            </div>
        </div>
    );
}
