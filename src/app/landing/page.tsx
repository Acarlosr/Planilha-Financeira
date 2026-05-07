"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import {
    TrendingUp,
    PiggyBank,
    CreditCard,
    LineChart,
    Zap,
    BarChart3,
    Wallet,
    Target,
    ArrowRight,
    Check,
    Sun,
    Moon,
} from "lucide-react";

const features = [
    {
        icon: <Wallet className="w-8 h-8" />,
        title: "Controle de Receitas",
        description: "Registre todas as suas fontes de renda, salários, freelances e investimentos em um só lugar."
    },
    {
        icon: <CreditCard className="w-8 h-8" />,
        title: "Gestão de Despesas",
        description: "Categorize e acompanhe seus gastos mensais. Saiba para onde seu dinheiro está indo."
    },
    {
        icon: <LineChart className="w-8 h-8" />,
        title: "Aplicações Financeiras",
        description: "Monitore seus investimentos em renda fixa, ações e outros ativos financeiros."
    },
    {
        icon: <PiggyBank className="w-8 h-8" />,
        title: "Poupança & Metas",
        description: "Defina metas de economia e acompanhe seu progresso para alcançar seus objetivos."
    },
    {
        icon: <BarChart3 className="w-8 h-8" />,
        title: "Relatórios Visuais",
        description: "Gráficos interativos que mostram a evolução do seu fluxo de caixa ao longo do tempo."
    },
    {
        icon: <Target className="w-8 h-8" />,
        title: "Criptomoedas",
        description: "Acompanhe sua carteira de criptoativos integrada ao dashboard principal."
    },
];

const benefits = [
    "Visualização clara de entradas e saídas",
    "Categorização automática de transações",
    "Dashboard interativo e moderno",
    "Acesso de qualquer dispositivo",
    "Dados seguros na nuvem",
    "Relatórios mensais detalhados",
];

export default function LandingPage() {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
                    style={{
                        background: "radial-gradient(circle, #7CFF6B 0%, transparent 70%)",
                        filter: "blur(60px)"
                    }}
                />
                <div
                    className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full opacity-15"
                    style={{
                        background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
                        filter: "blur(80px)"
                    }}
                />
                <div
                    className="absolute -bottom-40 left-1/3 w-[600px] h-[400px] rounded-full opacity-20"
                    style={{
                        background: "radial-gradient(circle, #6FEB5A 0%, transparent 70%)",
                        filter: "blur(100px)"
                    }}
                />
            </div>

            {/* Header */}
            <header className="relative z-10 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                                background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                                boxShadow: "0 4px 15px rgba(14, 165, 233, 0.4)"
                            }}
                        >
                            <TrendingUp className="text-white" size={22} />
                        </div>
                        <span className="text-2xl font-bold text-[#7CFF6B]">FinançasPro</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-muted hover:text-white transition-colors rounded-lg hover:bg-white/10"
                            title={theme === "dark" ? "Modo Light" : "Modo Dark"}
                        >
                            {theme === "dark" ? (
                                <Sun size={20} />
                            ) : (
                                <Moon size={20} />
                            )}
                        </button>
                        <Link
                            href="/login"
                            className="px-4 py-2 text-muted hover:text-foreground transition-colors font-medium"
                        >
                            Entrar
                        </Link>
                        <Link
                            href="/cadastro"
                            className="px-5 py-2.5 rounded-xl text-foreground font-semibold transition-all hover:brightness-110"
                            style={{
                                background: "linear-gradient(135deg, #FFD700 0%, #FFC700 100%)",
                                boxShadow: "0 4px 15px rgba(30, 64, 175, 0.4)"
                            }}
                        >
                            Começar Grátis
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative z-10 pt-20 pb-32 px-6">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#7CFF6B]/30 bg-[#7CFF6B]/10 mb-8">
                        <Zap className="w-4 h-4 text-[#7CFF6B]" />
                        <span className="text-sm text-[#6FEB5A] font-medium">Gestão financeira simplificada</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
                        Organize suas{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            finanças pessoais
                        </span>
                        {" "}em um só lugar
                    </h1>

                    <p className="text-xl text-muted max-w-3xl mx-auto mb-10 leading-relaxed">
                        O FinançasPro é sua plataforma completa para controlar receitas, despesas,
                        investimentos e metas financeiras. Tome decisões mais inteligentes sobre seu dinheiro.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/cadastro"
                            className="flex items-center gap-2 px-8 py-4 rounded-xl text-foreground font-semibold text-lg transition-all hover:brightness-110 hover:scale-105"
                            style={{
                                background: "linear-gradient(135deg, #FFD700 0%, #FFC700 100%)",
                                boxShadow: "0 4px 20px rgba(30, 64, 175, 0.5)"
                            }}
                        >
                            Criar Conta Grátis
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg border border-white/20 hover:bg-white/5 transition-all"
                        >
                            Ver Dashboard Demo
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 py-20 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            O que você pode gerenciar
                        </h2>
                        <p className="text-muted text-lg max-w-2xl mx-auto">
                            Ferramentas completas para ter controle total das suas finanças
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="p-6 rounded-2xl border border-white/10 transition-all duration-300 hover:border-[#7CFF6B]/30 hover:bg-white/5 group"
                                style={{
                                    background: "rgba(255, 255, 255, 0.03)",
                                }}
                            >
                                <div
                                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-[#7CFF6B] group-hover:scale-110 transition-transform"
                                    style={{
                                        background: "rgba(56, 189, 248, 0.1)",
                                        border: "1px solid rgba(56, 189, 248, 0.2)"
                                    }}
                                >
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                                <p className="text-muted leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="relative z-10 py-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div
                        className="rounded-3xl p-10 md:p-16 border border-white/10"
                        style={{
                            background: "rgba(255, 255, 255, 0.03)",
                            backdropFilter: "blur(10px)"
                        }}
                    >
                        <div className="grid md:grid-cols-2 gap-10 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                    Por que escolher o FinançasPro?
                                </h2>
                                <p className="text-muted text-lg mb-8">
                                    Uma plataforma pensada para simplificar sua vida financeira,
                                    com recursos poderosos e interface intuitiva.
                                </p>
                                <Link
                                    href="/cadastro"
                                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-foreground font-semibold transition-all hover:brightness-110"
                                    style={{
                                        background: "linear-gradient(135deg, #FFD700 0%, #FFC700 100%)",
                                        boxShadow: "0 4px 15px rgba(30, 64, 175, 0.4)"
                                    }}
                                >
                                    Começar Agora
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>
                            <div className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                            <Check className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <span className="text-muted">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="relative z-10 py-20 px-6 border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-6">
                            <Zap className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm text-emerald-300 font-medium">Experimente grátis por 15 dias</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Planos simples e acessíveis
                        </h2>
                        <p className="text-muted text-lg">
                            Comece gratuitamente e depois escolha o plano que melhor se adapta a você
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                        {/* Plano BRL */}
                        <div
                            className="rounded-2xl p-8 border border-white/10 text-center transition-all duration-300 hover:border-[#7CFF6B]/30"
                            style={{ background: "rgba(255, 255, 255, 0.03)" }}
                        >
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 mb-4">
                                🇧🇷
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">Plano Brasil</h3>
                            <div className="mb-4">
                                <span className="text-4xl font-bold text-foreground">R$ 10,99</span>
                                <span className="text-muted">/mês</span>
                            </div>
                            <p className="text-muted text-sm mb-6">
                                Acesso completo a todas as funcionalidades
                            </p>
                            <ul className="text-left space-y-3 mb-8">
                                <li className="flex items-center gap-2 text-muted text-sm">
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    15 dias grátis para testar
                                </li>
                                <li className="flex items-center gap-2 text-muted text-sm">
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    Controle ilimitado de transações
                                </li>
                                <li className="flex items-center gap-2 text-muted text-sm">
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    Relatórios e gráficos avançados
                                </li>
                                <li className="flex items-center gap-2 text-muted text-sm">
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    Suporte prioritário
                                </li>
                            </ul>
                            <Link
                                href="/cadastro"
                                className="block w-full py-3 rounded-xl text-foreground font-semibold transition-all hover:brightness-110"
                                style={{
                                    background: "linear-gradient(135deg, #FFD700 0%, #FFC700 100%)",
                                    boxShadow: "0 4px 15px rgba(30, 64, 175, 0.4)"
                                }}
                            >
                                Começar Grátis
                            </Link>
                        </div>

                        {/* Plano USD */}
                        <div
                            className="rounded-2xl p-8 border border-[#7CFF6B]/30 text-center relative transition-all duration-300 hover:border-cyan-400/50"
                            style={{ background: "rgba(56, 189, 248, 0.05)" }}
                        >
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-[#7CFF6B] text-white">
                                INTERNACIONAL
                            </div>
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FFD700]/20 text-[#FFD700] mb-4 text-2xl">
                                🌎
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">Plano Global</h3>
                            <div className="mb-4">
                                <span className="text-4xl font-bold text-foreground">$ 2</span>
                                <span className="text-muted">/mês</span>
                            </div>
                            <p className="text-muted text-sm mb-6">
                                Ideal para quem está fora do Brasil
                            </p>
                            <ul className="text-left space-y-3 mb-8">
                                <li className="flex items-center gap-2 text-muted text-sm">
                                    <Check className="w-4 h-4 text-[#7CFF6B]" />
                                    15 dias grátis para testar
                                </li>
                                <li className="flex items-center gap-2 text-muted text-sm">
                                    <Check className="w-4 h-4 text-[#7CFF6B]" />
                                    Controle ilimitado de transações
                                </li>
                                <li className="flex items-center gap-2 text-muted text-sm">
                                    <Check className="w-4 h-4 text-[#7CFF6B]" />
                                    Relatórios e gráficos avançados
                                </li>
                                <li className="flex items-center gap-2 text-muted text-sm">
                                    <Check className="w-4 h-4 text-[#7CFF6B]" />
                                    Suporte prioritário
                                </li>
                            </ul>
                            <Link
                                href="/cadastro"
                                className="block w-full py-3 rounded-xl text-foreground font-semibold transition-all hover:brightness-110"
                                style={{
                                    background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                                    boxShadow: "0 4px 15px rgba(14, 165, 233, 0.4)"
                                }}
                            >
                                Começar Grátis
                            </Link>
                        </div>
                    </div>

                    <p className="text-center text-muted text-sm mt-8">
                        Cancele a qualquer momento. Sem compromisso.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 py-8 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{
                                background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                            }}
                        >
                            <TrendingUp className="text-white" size={16} />
                        </div>
                        <span className="text-lg font-semibold text-[#7CFF6B]">FinançasPro</span>
                    </div>
                    <p className="text-muted text-sm">
                        © 2026 FinançasPro. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
}
