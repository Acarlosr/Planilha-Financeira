"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

export default function CadastroPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [erro, setErro] = useState("");

    // Cadastro com email/senha
    const handleCadastro = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro("");

        // Validações
        if (password !== confirmPassword) {
            setErro("As senhas não coincidem.");
            return;
        }

        if (password.length < 6) {
            setErro("A senha deve ter no mínimo 6 caracteres.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        nome: nome,
                    },
                },
            });

            if (error) throw error;

            router.push("/");
            router.refresh();
        } catch (error: any) {
            console.error(error);
            setErro(error.message || "Erro ao criar conta.");
        } finally {
            setLoading(false);
        }
    };

    // Login com Google
    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/`,
                }
            });
            if (error) throw error;
        } catch (error: any) {
            setErro(error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{
                background: "linear-gradient(135deg, #0a1628 0%, #1a365d 50%, #0f4c81 100%)"
            }}
        >
            {/* Background Decorative Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Large curved shape top-left */}
                <div
                    className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-30"
                    style={{
                        background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                        filter: "blur(40px)"
                    }}
                />
                {/* Curved shape right */}
                <div
                    className="absolute top-1/4 -right-20 w-96 h-96 rounded-full opacity-20"
                    style={{
                        background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                        filter: "blur(60px)"
                    }}
                />
                {/* Bottom wave */}
                <div
                    className="absolute -bottom-40 left-1/4 w-[600px] h-[400px] rounded-full opacity-25"
                    style={{
                        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                        filter: "blur(80px)"
                    }}
                />
                {/* Floating decorative elements */}
                <div className="absolute top-16 left-20 w-16 h-16 rounded-full border-4 border-[#7CFF6B]/40 animate-pulse" />
                <div className="absolute bottom-32 right-32 w-20 h-20 rounded-xl border-4 border-[#FFD700]/30 rotate-45 animate-bounce" style={{ animationDuration: '3s' }} />
                <div className="absolute top-1/2 left-16 w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20 backdrop-blur-sm" />
            </div>

            {/* Main Content */}
            <div className="w-full max-w-md relative z-10 animate-in slide-in-from-bottom-4 duration-700">
                {/* Back Button */}
                <Link
                    href="/landing"
                    className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl text-gray-300 hover:text-white transition-all hover:bg-white/10 border border-white/10 hover:border-white/20"
                    style={{
                        background: "rgba(255, 255, 255, 0.05)",
                    }}
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Voltar</span>
                </Link>

                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#7CFF6B] tracking-wide">FinançasPro</h1>
                </div>

                {/* Glassmorphism Card */}
                <div
                    className="rounded-3xl p-8 border border-white/20"
                    style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
                    }}
                >
                    <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>

                    {/* Error Message */}
                    {erro && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
                            {erro}
                        </div>
                    )}

                    <form onSubmit={handleCadastro} className="space-y-4">
                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-white placeholder:text-gray-400 outline-none transition-all duration-300 border border-white/10 focus:border-[#7CFF6B]/50"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.05)",
                                    }}
                                    placeholder="Your name"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-white placeholder:text-gray-400 outline-none transition-all duration-300 border border-white/10 focus:border-[#7CFF6B]/50"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.05)",
                                    }}
                                    placeholder="username@gmail.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder:text-gray-400 outline-none transition-all duration-300 border border-white/10 focus:border-[#7CFF6B]/50"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.05)",
                                    }}
                                    placeholder="Min. 6 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-white placeholder:text-gray-400 outline-none transition-all duration-300 border border-white/10 focus:border-[#7CFF6B]/50"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.05)",
                                    }}
                                    placeholder="Repeat password"
                                />
                            </div>
                        </div>

                        {/* Create Account Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl text-white font-semibold transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                            style={{
                                background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                                boxShadow: "0 4px 20px rgba(30, 64, 175, 0.4)"
                            }}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 h-px bg-white/10"></div>
                        <span className="px-4 text-sm text-gray-400">or continue with</span>
                        <div className="flex-1 h-px bg-white/10"></div>
                    </div>

                    {/* Social Buttons */}
                    <div className="flex justify-center gap-4">
                        {/* Google */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-14 h-14 rounded-xl flex items-center justify-center border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300"
                            style={{
                                background: "rgba(255, 255, 255, 0.05)",
                            }}
                        >
                            <svg className="w-6 h-6" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </button>

                        {/* GitHub */}
                        <button
                            type="button"
                            className="w-14 h-14 rounded-xl flex items-center justify-center border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300"
                            style={{
                                background: "rgba(255, 255, 255, 0.05)",
                            }}
                        >
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                        </button>

                        {/* Facebook */}
                        <button
                            type="button"
                            className="w-14 h-14 rounded-xl flex items-center justify-center border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300"
                            style={{
                                background: "rgba(255, 255, 255, 0.05)",
                            }}
                        >
                            <svg className="w-6 h-6 text-[#7CFF6B]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </button>
                    </div>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="text-[#7CFF6B] font-semibold hover:text-[#6FEB5A] transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
