"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Crown, Zap, CreditCard, Lock, CheckCircle, Loader2 } from "lucide-react";
import { SubscriptionPlan } from "@/types/saas";

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const planSlug = searchParams.get("plan");

    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        loadPlan();
        checkUser();
    }, [planSlug]);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push(`/login?redirect=/checkout?plan=${planSlug}`);
            return;
        }
        setUser(user);
    };

    const loadPlan = async () => {
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
    };

    const handleSubscribe = async () => {
        if (!plan || !user) return;

        setProcessing(true);

        // TODO: Implement Stripe/payment integration here
        // For now, simulate processing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        alert("🚧 Integração de pagamento em desenvolvimento!\n\nEm breve você poderá assinar o plano " + plan.name);

        setProcessing(false);
    };

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

                    {/* Payment Form */}
                    <div
                        className="rounded-2xl p-8 border border-white/10"
                        style={{ background: "rgba(255, 255, 255, 0.03)" }}
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <CreditCard size={20} className="text-[#7CFF6B]" />
                            <h2 className="text-xl font-bold text-foreground">Pagamento</h2>
                        </div>

                        {/* Security Badge */}
                        <div className="flex items-center gap-2 mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <Lock size={16} className="text-emerald-400" />
                            <span className="text-sm text-emerald-400">
                                Pagamento seguro com criptografia SSL
                            </span>
                        </div>

                        {/* Coming Soon Message */}
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                                <CreditCard size={32} className="text-amber-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                Integração de Pagamento
                            </h3>
                            <p className="text-muted text-sm mb-6">
                                A integração com gateway de pagamento (Stripe/PagSeguro) está em desenvolvimento.
                            </p>
                        </div>

                        {/* Subscribe Button */}
                        <button
                            onClick={handleSubscribe}
                            disabled={processing}
                            className="w-full py-4 rounded-xl text-black font-semibold transition-all hover:brightness-110 disabled:opacity-50"
                            style={{
                                background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                                boxShadow: "0 4px 20px rgba(124, 255, 107, 0.4)",
                            }}
                        >
                            {processing ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                `Assinar ${plan.name} - ${formatPrice(currentPrice || 0)}/${billingCycle === "monthly" ? "mês" : "ano"}`
                            )}
                        </button>

                        <p className="text-center text-muted text-xs mt-4">
                            Ao assinar, você concorda com nossos Termos de Serviço e Política de Privacidade.
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
