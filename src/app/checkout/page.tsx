"use client";

import { useCallback, useEffect, Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Crown, Zap, CreditCard, Lock, CheckCircle, Loader2, Mail } from "lucide-react";
import { SubscriptionPlan } from "@/types/saas";

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const planSlug = searchParams.get("plan");

    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    const checkUser = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push(`/login?redirect=/checkout?plan=${planSlug}`);
            return;
        }
        setUser(user);
    }, [planSlug, router]);

    const loadPlan = useCallback(async () => {
        if (!planSlug) {
            router.push("/pricing");
            return;
        }

        const { data } = await supabase
            .from("subscription_plans")
            .select("*")
            .eq("slug", planSlug)
            .eq("is_active", true)
            .single();

        if (data) {
            setPlan(data);
        } else {
            router.push("/pricing");
        }
        setLoading(false);
    }, [planSlug, router]);

    useEffect(() => {
        loadPlan();
        checkUser();
    }, [checkUser, loadPlan]);

    const contactHref = `mailto:contato@saldoclaro.xyz?subject=${encodeURIComponent(`Interesse no plano ${plan?.name ?? ""}`)}&body=${encodeURIComponent(`Olá, quero entrar na lista do plano ${plan?.name ?? ""}.\n\nConta: ${user?.email ?? ""}`)}`;

    const formatPrice = (price: number) => {
        if (price === 0) return "Grátis";
        return `R$ ${price.toFixed(2).replace(".", ",")}`;
    };

    const currentPrice = billingCycle === "monthly" ? plan?.price_monthly : plan?.price_yearly;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#7CFF6B] animate-spin" />
            </div>
        );
    }

    if (!plan) {
        return null;
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 mb-8 text-muted hover:text-foreground transition-colors"
                >
                    <ArrowLeft size={20} />
                    Voltar aos Planos
                </Link>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Plan Summary */}
                    <div
                        className="rounded-2xl p-8 border border-white/10"
                        style={{ background: "rgba(255, 255, 255, 0.03)" }}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center"
                                style={{
                                    background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                                }}
                            >
                                {plan.slug === "pro" ? (
                                    <Crown size={28} className="text-black" />
                                ) : (
                                    <Zap size={28} className="text-black" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Plano {plan.name}</h1>
                                <p className="text-muted">{plan.description}</p>
                            </div>
                        </div>

                        {/* Billing Cycle Toggle */}
                        <div className="mb-6">
                            <p className="text-sm text-muted mb-3">Ciclo de cobrança</p>
                            <div
                                className="inline-flex rounded-xl p-1 border border-white/10"
                                style={{ background: "rgba(255, 255, 255, 0.05)" }}
                            >
                                <button
                                    onClick={() => setBillingCycle("monthly")}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === "monthly"
                                        ? "text-black"
                                        : "text-gray-400 hover:text-foreground"
                                        }`}
                                    style={
                                        billingCycle === "monthly"
                                            ? {
                                                background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                                            }
                                            : {}
                                    }
                                >
                                    Mensal
                                </button>
                                <button
                                    onClick={() => setBillingCycle("yearly")}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === "yearly"
                                        ? "text-black"
                                        : "text-gray-400 hover:text-foreground"
                                        }`}
                                    style={
                                        billingCycle === "yearly"
                                            ? {
                                                background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                                            }
                                            : {}
                                    }
                                >
                                    Anual
                                    <span className="ml-2 text-xs opacity-75">-17%</span>
                                </button>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex justify-between items-center">
                                <span className="text-muted">Subtotal</span>
                                <span className="text-xl font-bold text-foreground">
                                    {formatPrice(currentPrice || 0)}
                                    <span className="text-sm font-normal text-muted">
                                        /{billingCycle === "monthly" ? "mês" : "ano"}
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Features */}
                        <div>
                            <p className="text-sm text-muted mb-3">O que está incluso:</p>
                            <ul className="space-y-2">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-center gap-2 text-sm text-muted">
                                        <CheckCircle size={16} className="text-[#7CFF6B]" />
                                        {feature.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div
                        className="rounded-2xl p-8 border border-white/10"
                        style={{ background: "rgba(255, 255, 255, 0.03)" }}
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <CreditCard size={20} className="text-[#7CFF6B]" />
                            <h2 className="text-xl font-bold text-foreground">Pagamento em preparação</h2>
                        </div>

                        {/* Security Badge */}
                        <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <Lock size={16} className="text-emerald-400" />
                            <span className="text-sm text-emerald-400">
                                Nenhuma cobrança será feita nesta tela enquanto o gateway não estiver conectado.
                            </span>
                        </div>

                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <CreditCard size={32} className="text-amber-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                Gateway ainda não conectado
                            </h3>
                            <p className="text-muted text-sm mb-6">
                                O FinançasPro está em beta como SaaS financeiro. Para vender assinatura de verdade, esta etapa precisa criar uma sessão no provedor de pagamento e confirmar o plano por webhook.
                            </p>
                        </div>

                        <a
                            href={contactHref}
                            className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-black font-semibold transition-all hover:brightness-110"
                            style={{
                                background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                                boxShadow: "0 4px 20px rgba(124, 255, 107, 0.4)",
                            }}
                        >
                            <Mail size={18} />
                            Entrar na lista do {plan.name}
                        </a>

                        <p className="text-center text-muted text-xs mt-4">
                            Fluxo de cobrança recomendado: Stripe, Mercado Pago ou PagSeguro com webhook no Supabase.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[#7CFF6B] animate-spin" />
                </div>
            }
        >
            <CheckoutContent />
        </Suspense>
    );
}
