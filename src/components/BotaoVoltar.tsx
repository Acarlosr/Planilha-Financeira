"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BotaoVoltarProps {
    label?: string;
    fallbackUrl?: string;
}

export default function BotaoVoltar({
    label = "Voltar",
    fallbackUrl = "/aplicacao"
}: BotaoVoltarProps) {
    const router = useRouter();

    return (
        <button
            onClick={() => {
                if (window.history.length > 2) {
                    router.back();
                } else {
                    router.push(fallbackUrl);
                }
            }}
            className="flex items-center gap-2 text-muted hover:text-foreground font-medium transition-colors mb-6 group"
        >
            <ArrowLeft
                size={20}
                className="transform group-hover:-translate-x-1 transition-transform"
            />
            {label}
        </button>
    );
}
