"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { UserProfile, SubscriptionPlan } from "@/types/saas";

interface SubscriptionContextType {
    user: UserProfile | null;
    plan: SubscriptionPlan | null;
    loading: boolean;
    isAdmin: boolean;
    isTrial: boolean;
    trialDaysLeft: number | null;
    hasActiveSubscription: boolean;
    refreshProfile: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUserProfile = useCallback(async () => {
        let cancelled = false;

        try {
            setLoading(true);
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (cancelled) return;

            if (!authUser) {
                setUser(null);
                setPlan(null);
                return;
            }

            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select(`*, subscription_plan:subscription_plans(*)`)
                .eq('id', authUser.id)
                .single();

            if (cancelled) return;

            if (profileError) {
                // Não expor erro interno ao usuário — logar apenas em dev
                if (process.env.NODE_ENV === 'development') {
                    console.error('[SubscriptionContext] Erro ao carregar perfil:', profileError.message);
                }
                return;
            }

            if (profile) {
                const profileData = profile as UserProfile & { subscription_plan: SubscriptionPlan | SubscriptionPlan[] | null };
                const subscriptionPlan = Array.isArray(profileData.subscription_plan)
                    ? profileData.subscription_plan[0] ?? null
                    : profileData.subscription_plan ?? null;

                setUser(profileData);
                setPlan(subscriptionPlan);
            }
        } catch (error) {
            if (cancelled) return;
            if (process.env.NODE_ENV === 'development') {
                console.error('[SubscriptionContext] Erro inesperado:', error);
            }
        } finally {
            if (!cancelled) setLoading(false);
        }

        // Retorna função de cancelamento (usada pelo useEffect)
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        let cancelLoad: (() => void) | undefined;

        const run = async () => {
            cancelLoad = await loadUserProfile() as (() => void) | undefined;
        };
        run();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (cancelLoad) cancelLoad();
            if (session?.user) {
                const rerun = async () => { cancelLoad = await loadUserProfile() as (() => void) | undefined; };
                rerun();
            } else {
                setUser(null);
                setPlan(null);
                setLoading(false);
            }
        });

        return () => {
            if (cancelLoad) cancelLoad();
            subscription.unsubscribe();
        };
    }, [loadUserProfile]);

    const isAdmin = user?.role === 'admin';
    const isTrial = user?.subscription_status === 'trial';
    const hasActiveSubscription = user?.subscription_status === 'active' || isTrial;

    const trialDaysLeft = isTrial && user?.trial_ends_at
        ? Math.max(0, Math.ceil((new Date(user.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : null;

    const value: SubscriptionContextType = {
        user,
        plan,
        loading,
        isAdmin,
        isTrial,
        trialDaysLeft,
        hasActiveSubscription,
        refreshProfile: () => { loadUserProfile(); },
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}
