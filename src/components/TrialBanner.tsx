"use client";

import { useSubscription } from "@/contexts/SubscriptionContext";
import Link from "next/link";
import { Clock, Sparkles, X } from "lucide-react";
import { useState } from "react";

export default function TrialBanner() {
    const { isTrial, trialDaysLeft, user } = useSubscription();
    const [dismissed, setDismissed] = useState(false);

    if (!isTrial || dismissed || !user) {
        return null;
    }

    const urgency = trialDaysLeft !== null && trialDaysLeft <= 3;

    return (
        <div
            className="relative rounded-lg border p-4 mb-6"
            style={{
                background: urgency
                    ? "color-mix(in srgb, var(--warning) 10%, transparent)"
                    : "color-mix(in srgb, var(--accent) 8%, transparent)",
                borderColor: urgency
                    ? "color-mix(in srgb, var(--warning) 24%, transparent)"
                    : "color-mix(in srgb, var(--accent) 18%, transparent)",
            }}
        >
            <button
                onClick={() => setDismissed(true)}
                className="absolute top-3 right-3 p-1 text-muted hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
                <X size={16} />
            </button>

            <div className="flex items-start gap-4 pr-8">
                <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                        background: urgency
                            ? "color-mix(in srgb, var(--warning) 16%, transparent)"
                            : "color-mix(in srgb, var(--accent) 14%, transparent)",
                    }}
                >
                    {urgency ? (
                        <Clock size={24} className="text-yellow-500" />
                    ) : (
                        <Sparkles size={24} style={{ color: "var(--accent)" }} />
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="text-foreground font-semibold mb-1">
                        {urgency
                            ? `⚡ Seu trial expira em ${trialDaysLeft} ${trialDaysLeft === 1 ? 'dia' : 'dias'}!`
                            : `🎉 Você está no período de trial`
                        }
                    </h3>
                    <p className="text-muted text-sm mb-3">
                        {urgency
                            ? 'Assine agora para continuar com acesso ilimitado a todas as funcionalidades.'
                            : `Aproveite os próximos ${trialDaysLeft} dias com acesso completo ao plano Free. Faça upgrade para desbloquear recursos premium.`
                        }
                    </p>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/pricing"
                            className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-all hover:brightness-105"
                            style={{
                                background: "var(--accent)"
                            }}
                        >
                            {urgency ? 'Assinar Agora' : 'Ver Planos'}
                        </Link>

                        {!urgency && (
                            <Link
                                href="/pricing"
                                className="text-sm text-muted hover:text-foreground transition-colors"
                            >
                                Saiba mais
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
