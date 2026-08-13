"use client";

interface SkeletonProps {
    className?: string;
}

/**
 * Placeholder de carregamento. Substitui os textos soltos "Carregando..."
 * espalhados pelo app por um retângulo pulsante no formato do conteúdo real.
 */
export function Skeleton({ className = "" }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse rounded-lg ${className}`}
            style={{ background: "color-mix(in srgb, var(--text-secondary) 16%, transparent)" }}
            aria-hidden="true"
        />
    );
}

/** Skeleton no formato de um CardResumo (título + valor + ícone). */
export function SkeletonCard() {
    return (
        <div className="glass-card p-6">
            <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg shrink-0 ml-4" />
            </div>
        </div>
    );
}

/** Skeleton no formato de linha de tabela. */
export function SkeletonRow({ columns = 4 }: { columns?: number }) {
    return (
        <tr className="border-b" style={{ borderColor: "var(--card-border)" }}>
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="py-4 px-4">
                    <Skeleton className="h-4 w-full" />
                </td>
            ))}
        </tr>
    );
}
