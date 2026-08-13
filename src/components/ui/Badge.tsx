"use client";

export type BadgeTone = "neutral" | "success" | "danger" | "warning" | "info";

interface BadgeProps {
    children: React.ReactNode;
    tone?: BadgeTone;
    className?: string;
}

const TONE_STYLE: Record<BadgeTone, { bg: string; text: string }> = {
    neutral: { bg: "color-mix(in srgb, var(--text-secondary) 14%, transparent)", text: "var(--text-secondary)" },
    success: { bg: "rgba(16, 185, 129, 0.14)", text: "#34d399" },
    danger: { bg: "rgba(239, 68, 68, 0.14)", text: "#f87171" },
    warning: { bg: "rgba(245, 158, 11, 0.14)", text: "#fbbf24" },
    info: { bg: "rgba(59, 130, 246, 0.14)", text: "#60a5fa" },
};

/**
 * Badge de status reutilizável. Centraliza o padrão de "pílula colorida"
 * que hoje é reimplementado com classes Tailwind diferentes em cada tela.
 */
export default function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
    const style = TONE_STYLE[tone];
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}
            style={{ background: style.bg, color: style.text }}
        >
            {children}
        </span>
    );
}
