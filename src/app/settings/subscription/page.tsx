"use client";

import { useSubscription } from "@/contexts/SubscriptionContext";
import Link from "next/link";
import { ArrowLeft, Crown, CreditCard, Calendar, AlertCircle } from "lucide-react";
import TrialBanner from "@/components/TrialBanner";

export default function SubscriptionSettingsPage() {
    const { user, plan, isTrial, trialDaysLeft, hasActiveSubscription } = useSubscription();

    if (!user || !plan) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400">Carregando...</p>
                </div>
            </div>
        );
    }

    const getPlanColor = (slug: string) => {
        switch (slug) {
            case 'free': return 'text-gray-400';
            case 'pro': return 'text-[#7CFF6B]';
            case 'enterprise': return 'text-yellow-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 mb-8 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    Voltar ao Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-white mb-2">Assinatura</h1>
                <p className="text-gray-400 mb-8">Gerencie seu plano e preferências de pagamento</p>

                {/* Trial Banner */}
                {isTrial && <TrialBanner />}

                {/* Current Plan Card */}
                <div
                    className="rounded-2xl border border-white/10 p-8 mb-6"
                    style={{ background: "rgba(255, 255, 255, 0.03)" }}
                >
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <p className="text-gray-400 text-sm mb-2">Plano Atual</p>
                            <h2 className={`text-3xl font-bold ${getPlanColor(plan.slug)}`}>
                                {plan.name}
                            </h2>
                            {plan.description && (
                                <p className="text-gray-400 text-sm mt-2">{plan.description}</p>
                            )}
                        </div>

                        <div
                            className="w-16 h-16 rounded-xl flex items-center justify-center"
                            style={{
                                background: plan.slug === 'pro'
                                    ? "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)"
                                    : "rgba(255, 255, 255, 0.1)"
                            }}
                        >
                            <Crown size={28} className={plan.slug === 'pro' ? 'text-black' : 'text-white'} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-gray-400 text-sm">Preço Mensal</p>
                            <p className="text-white font-semibold text-lg">
                                {plan.price_monthly === 0 ? 'Grátis' : `R$ ${plan.price_monthly.toFixed(2)}/mês`}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm">Status</p>
                            <p className={`font-semibold text-lg ${hasActiveSubscription ? 'text-[#7CFF6B]' : 'text-gray-400'
                                }`}>
                                {user.subscription_status === 'active' && 'Ativa'}
                                {user.subscription_status === 'trial' && `Trial (${trialDaysLeft} dias)`}
                                {user.subscription_status === 'canceled' && 'Cancelada'}
                                {user.subscription_status === 'expired' && 'Expirada'}
                            </p>
                        </div>
                    </div>

                    {/* Plan Limits */}
                    <div className="border-t border-white/10 pt-6 mb-6">
                        <p className="text-white font-semibold mb-4">Limites do Plano</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                    <CreditCard size={20} className="text-[#7CFF6B]" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Transações</p>
                                    <p className="text-white font-medium">
                                        {plan.max_transactions || 'Ilimitadas'} {plan.max_transactions && '/mês'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                                    <Calendar size={20} className="text-[#7CFF6B]" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Cards Dashboard</p>
                                    <p className="text-white font-medium">
                                        {plan.max_dashboard_cards || 'Ilimitados'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Plan Features */}
                    <div className="border-t border-white/10 pt-6">
                        <p className="text-white font-semibold mb-3">Recursos Inclusos</p>
                        <div className="grid grid-cols-2 gap-2">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#7CFF6B]" />
                                    {feature.replace(/_/g, ' ')}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
                        {plan.slug !== 'enterprise' && (
                            <Link
                                href="/pricing"
                                className="flex-1 py-3 rounded-xl text-center font-semibold transition-all hover:brightness-110 text-black"
                                style={{
                                    background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)"
                                }}
                            >
                                Fazer Upgrade
                            </Link>
                        )}

                        {plan.slug !== 'free' && (
                            <button
                                className="flex-1 py-3 rounded-xl text-center font-semibold transition-all hover:bg-white/10 border border-white/10 text-white"
                            >
                                Cancelar Assinatura
                            </button>
                        )}
                    </div>
                </div>

                {/* Billing Info (se não for free) */}
                {plan.slug !== 'free' && (
                    <div
                        className="rounded-2xl border border-white/10 p-8 mb-6"
                        style={{ background: "rgba(255, 255, 255, 0.03)" }}
                    >
                        <h3 className="text-xl font-bold text-white mb-4">Informações de Pagamento</h3>

                        <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
                            <AlertCircle size={20} className="text-yellow-500" />
                            <p className="text-sm text-yellow-200">
                                Integração de pagamentos será implementada em breve. Por enquanto, planos são gerenciados manualmente.
                            </p>
                        </div>

                        {user.subscription_started_at && (
                            <p className="text-sm text-gray-400">
                                Assinatura iniciada em: {new Date(user.subscription_started_at).toLocaleDateString('pt-BR')}
                            </p>
                        )}
                    </div>
                )}

                {/* Help */}
                <div
                    className="rounded-xl border border-white/10 p-6"
                    style={{ background: "rgba(255, 255, 255, 0.03)" }}
                >
                    <h3 className="text-lg font-bold text-white mb-2">Precisa de Ajuda?</h3>
                    <p className="text-sm text-gray-400 mb-4">
                        Entre em contato com nosso suporte se tiver dúvidas sobre sua assinatura ou pagamento.
                    </p>
                    <Link
                        href="mailto:suporte@financaspro.com.br"
                        className="text-[#7CFF6B] text-sm font-medium hover:underline"
                    >
                        suporte@financaspro.com.br
                    </Link>
                </div>
            </div>
        </div>
    );
}
