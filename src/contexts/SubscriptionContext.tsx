"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
    refreshProfile: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (!authUser) {
                setUser(null);
                setPlan(null);
                return;
            }

            // Buscar profile do usuário com plano
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select(`
                    *,
                    subscription_plan:subscription_plans(*)
                `)
                .eq('id', authUser.id)
                .single();

            if (profileError) {
                console.error('Error loading profile:', profileError);
                return;
            }

            if (profile) {
                // Type assertion porque Supabase retorna subscription_plan como array
                const profileData = profile as any;
                const subscriptionPlan = Array.isArray(profileData.subscription_plan)
                    ? profileData.subscription_plan[0]
                    : profileData.subscription_plan;

                setUser(profileData);
                setPlan(subscriptionPlan || null);
            }
        } catch (error) {
            console.error('Error in loadUserProfile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserProfile();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                loadUserProfile();
            } else {
                setUser(null);
                setPlan(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Computed values
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
        refreshProfile: loadUserProfile,
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
