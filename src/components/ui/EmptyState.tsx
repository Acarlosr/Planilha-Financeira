"use client";

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

/**
 * Estado vazio padronizado (ícone + título + descrição + ação opcional),
 * para substituir mensagens soltas como "Nenhum item cadastrado" nas
 * tabelas e listas.
 */
export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="py-12 px-6 text-center">
            {Icon && (
                <div
                    className="mx-auto mb-3 w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: "color-mix(in srgb, var(--text-secondary) 12%, transparent)" }}
                >
                    <Icon size={22} className="text-muted" aria-hidden="true" />
                </div>
            )}
            <p className="text-foreground font-medium">{title}</p>
            {description && <p className="text-muted text-sm mt-1 max-w-sm mx-auto">{description}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
