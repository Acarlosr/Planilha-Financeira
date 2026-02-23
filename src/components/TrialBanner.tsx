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
            className={`relative rounded-xl border p-4 mb-6 ${urgency
                    ? 'border-yellow-500/30 bg-yellow-500/10'
                    : 'border-[#7CFF6B]/20 bg-[#7CFF6B]/5'
                }`}
        >
            <button
                onClick={() => setDismissed(true)}
                className="absolute top-3 right-3 p-1 text-muted hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
                <X size={16} />
            </button>

            <div className="flex items-start gap-4 pr-8">
                <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${urgency ? 'bg-yellow-500/20' : 'bg-[#7CFF6B]/20'
                        }`}
                >
                    {urgency ? (
                        <Clock size={24} className="text-yellow-500" />
                    ) : (
                        <Sparkles size={24} className="text-[#7CFF6B]" />
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
                            className="px-4 py-2 rounded-lg text-black font-medium text-sm transition-all hover:brightness-110"
                            style={{
                                background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)"
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
