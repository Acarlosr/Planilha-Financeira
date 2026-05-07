"use client";

import Link from "next/link";
import { Crown, ArrowRight, X } from "lucide-react";

interface UpgradePromptProps {
    feature?: string;
    planRequired?: 'pro' | 'enterprise';
    reason?: string;
    onClose?: () => void;
    variant?: 'modal' | 'inline' | 'banner';
}

export default function UpgradePrompt({
    planRequired = 'pro',
    reason,
    onClose,
    variant = 'inline'
}: UpgradePromptProps) {
    const planNames = {
        pro: 'Pro',
        enterprise: 'Enterprise'
    };

    const planName = planNames[planRequired];

    if (variant === 'modal') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <div
                    className="w-full max-w-md rounded-2xl border border-white/10 p-8 relative"
                    style={{
                        background: "rgba(26, 26, 26, 0.95)",
                        boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
                    }}
                >
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-muted hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    )}

                    <div className="flex flex-col items-center text-center">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                            style={{
                                background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)"
                            }}
                        >
                            <Crown size={28} className="text-black" />
                        </div>

                        <h3 className="text-2xl font-bold text-foreground mb-2">
                            Upgrade para {planName}
                        </h3>

                        <p className="text-muted mb-6">
                            {reason || `Esta funcionalidade está disponível apenas no plano ${planName}.`}
                        </p>

                        <div className="w-full space-y-3">
                            <Link
                                href="/pricing"
                                className="block w-full py-3 rounded-xl text-black font-semibold transition-all hover:brightness-110"
                                style={{
                                    background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)"
                                }}
                            >
                                Ver Planos
                                <ArrowRight size={20} className="inline ml-2" />
                            </Link>

                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="w-full py-3 text-muted hover:text-foreground transition-colors"
                                >
                                    Agora não
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (variant === 'banner') {
        return (
            <div
                className="rounded-xl border border-[#7CFF6B]/20 p-4 mb-6"
                style={{
                    background: "rgba(124, 255, 107, 0.05)"
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                                background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)"
                            }}
                        >
                            <Crown size={20} className="text-black" />
                        </div>
                        <div>
                            <p className="text-foreground font-medium">
                                Upgrade para {planName}
                            </p>
                            <p className="text-sm text-muted">
                                {reason || `Desbloqueie funcionalidades avançadas`}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/pricing"
                        className="px-4 py-2 rounded-lg text-black font-medium transition-all hover:brightness-110"
                        style={{
                            background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)"
                        }}
                    >
                        Assinar
                    </Link>
                </div>
            </div>
        );
    }

    // Inline variant (default)
    return (
        <div
            className="rounded-xl border border-white/10 p-6 text-center"
            style={{
                background: "rgba(255, 255, 255, 0.03)"
            }}
        >
            <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                    background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)"
                }}
            >
                <Crown size={24} className="text-black" />
            </div>

            <h3 className="text-lg font-bold text-foreground mb-2">
                Recurso Premium
            </h3>

            <p className="text-muted text-sm mb-4">
                {reason || `Esta funcionalidade está disponível apenas no plano ${planName}.`}
            </p>

            <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-black font-semibold transition-all hover:brightness-110"
                style={{
                    background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)"
                }}
            >
                Fazer Upgrade
                <ArrowRight size={18} />
            </Link>
        </div>
    );
}
