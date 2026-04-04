import { useSubscription } from "@/contexts/SubscriptionContext";

/**
 * Hook simples para verificar role do usuário
 */
export function useUserRole() {
    const { user, isAdmin, loading } = useSubscription();

    return {
        user,
        isAdmin,
        isUser: user?.role === 'user',
        role: user?.role || null,
        loading,
    };
}
