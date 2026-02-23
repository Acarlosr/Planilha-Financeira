"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Check, Crown, Zap, Building2, ArrowLeft } from "lucide-react";
import { SubscriptionPlan } from "@/types/saas";
import { useSubscription } from "@/contexts/SubscriptionContext";

export default function PricingPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
    const { user, plan: currentPlan } = useSubscription();

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        const { data } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('is_active', true)
            .order('price_monthly', { ascending: true });

        if (data) {
            setPlans(data);
        }
    };

    const getPlanIcon = (slug: string) => {
        switch (slug) {
            case 'free': return <Zap size={32} />;
            case 'pro': return <Crown size={32} />;
            case 'enterprise': return <Building2 size={32} />;
            default: return <Zap size={32} />;
        }
    };

    const formatPrice = (plan: SubscriptionPlan) => {
        const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
        if (price === 0) return 'Grátis';
        return `R$ ${price.toFixed(2)}`;
    };

    const getFeaturesList = (features: string[]) => {
        const featureLabels: Record<string, string> = {
            'basic_dashboard': 'Dashboard básico',
            'transaction_tracking': 'Controle de transações',
            '3_cards': 'Até 3 cards no dashboard',
            'unlimited_cards': 'Cards ilimitados no dashboard',
            'advanced_reports': 'Relatórios avançados',
            'export_data': 'Exportação PDF/Excel',
            '24_months_history': 'Histórico de 24 meses',
            'unlimited_history': 'Histórico ilimitado',
            'custom_categories': 'Categorias personalizadas',
            'api_access': 'Acesso à API',
            'priority_support': 'Suporte prioritário',
            'multi_user': 'Múltiplos usuários',
            'sla_guarantee': 'SLA garantido',
        };

        return features.map(f => featureLabels[f] || f);
    };

    return (
        <div className="min-h-screen p-8">
            {/* Header */}
            <div className="max-w-6xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 mb-8 text-muted hover:text-foreground transition-colors"
                >
                    <ArrowLeft size={20} />
                    Voltar ao Dashboard
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-foreground mb-4">
                        Escolha o plano ideal para você
                    </h1>
                    <p className="text-muted text-lg">
                        Comece grátis e faça upgrade quando precisar de mais recursos
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center mb-12">
                    <div
                        className="inline-flex rounded-xl p-1 border border-white/10"
                        style={{ background: "rgba(255, 255, 255, 0.05)" }}
                    >
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${billingCycle === 'monthly'
                                    ? 'text-black'
                                    : 'text-gray-400 hover:text-foreground'
                                }`}
                            style={billingCycle === 'monthly' ? {
                                background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)"
                            } : {}}
                        >
                            Mensal
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2 rounded-lg font-medium transition-all ${billingCycle === 'yearly'
                                    ? 'text-black'
                                    : 'text-gray-400 hover:text-foreground'
                                }`}
                            style={billingCycle === 'yearly' ? {
                                background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)"
                            } : {}}
                        >
                            Anual
                            <span className="ml-2 text-xs">-17%</span>
                        </button>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {plans.map((plan) => {
                        const isCurrentPlan = currentPlan?.id === plan.id;
                        const isPro = plan.slug === 'pro';

                        return (
                            <div
                                key={plan.id}
                                className={`rounded-2xl p-8 border relative ${isPro
                                        ? 'border-[#7CFF6B]/50 scale-105'
                                        : 'border-white/10'
                                    }`}
                                style={{
                                    background: isPro
                                        ? "rgba(124, 255, 107, 0.05)"
                                        : "rgba(255, 255, 255, 0.03)"
                                }}
                            >
                                {isPro && (
                                    <div
                                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold text-black"
                                        style={{
                                            background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)"
                                        }}
                                    >
                                        Mais Popular
                                    </div>
                                )}

                                {isCurrentPlan && (
                                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
                                        Plano Atual
                                    </div>
                                )}

                                {/* Icon */}
                                <div
                                    className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                                    style={{
                                        background: plan.slug === 'pro'
                                            ? "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)"
                                            : "rgba(255, 255, 255, 0.1)",
                                        color: plan.slug === 'pro' ? '#000' : '#7CFF6B'
                                    }}
                                >
                                    {getPlanIcon(plan.slug)}
                                </div>

                                {/* Name */}
                                <h3 className="text-2xl font-bold text-foreground mb-2">
                                    {plan.name}
                                </h3>

                                {/* Description */}
                                <p className="text-muted text-sm mb-6">
                                    {plan.description}
                                </p>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-foreground">
                                            {formatPrice(plan)}
                                        </span>
                                        {plan.price_monthly > 0 && (
                                            <span className="text-muted">
                                                /{billingCycle === 'monthly' ? 'mês' : 'ano'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Limits */}
                                <div className="mb-6 space-y-2">
                                    <div className="text-sm text-muted">
                                        <strong className="text-foreground">
                                            {plan.max_transactions || 'Ilimitadas'}
                                        </strong> transações/mês
                                    </div>
                                    <div className="text-sm text-muted">
                                        <strong className="text-foreground">
                                            {plan.max_dashboard_cards || 'Ilimitados'}
                                        </strong> cards no dashboard
                                    </div>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-8">
                                    {getFeaturesList(plan.features).map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <Check size={20} className="text-[#7CFF6B] flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-muted">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                {isCurrentPlan ? (
                                    <button
                                        disabled
                                        className="w-full py-3 rounded-xl font-semibold bg-white/10 text-muted cursor-not-allowed"
                                    >
                                        Plano Atual
                                    </button>
                                ) : (
                                    <Link
                                        href={plan.slug === 'free' ? '/cadastro' : `/checkout?plan=${plan.slug}`}
                                        className={`block w-full py-3 rounded-xl font-semibold text-center transition-all hover:brightness-110 ${isPro ? 'text-black' : 'text-foreground'
                                            }`}
                                        style={isPro ? {
                                            background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)"
                                        } : {
                                            background: "rgba(255, 255, 255, 0.1)",
                                            border: "1px solid rgba(255, 255, 255, 0.2)"
                                        }}
                                    >
                                        {plan.slug === 'free' ? 'Começar Grátis' : 'Assinar Agora'}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* FAQ or Additional Info */}
                <div className="text-center text-muted text-sm">
                    <p>Todos os planos incluem 7 dias de trial gratuito</p>
                    <p className="mt-2">Cancele a qualquer momento, sem taxas</p>
                </div>
            </div>
        </div>
    );
}
