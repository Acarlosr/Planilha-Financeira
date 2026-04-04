import { useSubscription } from "@/contexts/SubscriptionContext";
import { useCallback, useMemo } from "react";

export interface FeatureAccess {
    hasAccess: boolean;
    reason?: string;
    planRequired?: 'free' | 'pro' | 'enterprise';
    currentLimit?: number;
    maxLimit?: number | null;
}

/**
 * Hook para verificar acesso a features baseado no plano de assinatura
 * 
 * @param feature - Nome da feature a verificar
 * @returns FeatureAccess object com informações de acesso
 * 
 * @example
 * const { hasAccess, planRequired } = useFeatureAccess('advanced_reports');
 * if (!hasAccess) {
 *   return <UpgradePrompt planRequired={planRequired} />;
 * }
 */
export function useFeatureAccess(feature: string): FeatureAccess {
    const { plan, user, hasActiveSubscription } = useSubscription();

    return useMemo(() => {
        // Se não tiver plano ou assinatura inativa
        if (!plan || !hasActiveSubscription) {
            return {
                hasAccess: false,
                reason: 'Assinatura inativa',
                planRequired: 'free',
            };
        }

        // Verificar se feature está nas features do plano
        const features = plan.features || [];
        const hasFeature = features.includes(feature);

        if (hasFeature) {
            return {
                hasAccess: true,
            };
        }

        // Determinar qual plano é necessário
        let planRequired: 'free' | 'pro' | 'enterprise' = 'pro';

        // Features enterprise-only
        const enterpriseFeatures = ['api_access', 'priority_support', 'multi_user', 'sla_guarantee'];
        if (enterpriseFeatures.includes(feature)) {
            planRequired = 'enterprise';
        }

        return {
            hasAccess: false,
            reason: `Feature disponível apenas no plano ${planRequired.toUpperCase()}`,
            planRequired,
        };
    }, [plan, hasActiveSubscription, feature]);
}

/**
 * Hook para verificar limites quantitativos (transações, cards, etc)
 * 
 * @param limitType - Tipo de limite ('transactions', 'dashboard_cards')
 * @param currentUsage - Uso atual
 * @returns FeatureAccess com informações de limite
 */
export function useQuotaLimit(
    limitType: 'transactions' | 'dashboard_cards',
    currentUsage: number = 0
): FeatureAccess {
    const { plan } = useSubscription();

    return useMemo(() => {
        if (!plan) {
            return {
                hasAccess: false,
                reason: 'Plano não encontrado',
                currentLimit: currentUsage,
                maxLimit: 0,
            };
        }

        let maxLimit: number | null = null;

        if (limitType === 'transactions') {
            maxLimit = plan.max_transactions;
        } else if (limitType === 'dashboard_cards') {
            maxLimit = plan.max_dashboard_cards;
        }

        // null = ilimitado
        if (maxLimit === null) {
            return {
                hasAccess: true,
                currentLimit: currentUsage,
                maxLimit: null,
            };
        }

        const hasAccess = currentUsage < maxLimit;

        return {
            hasAccess,
            reason: hasAccess
                ? undefined
                : `Limite de ${maxLimit} ${limitType === 'transactions' ? 'transações' : 'cards'} atingido`,
            currentLimit: currentUsage,
            maxLimit,
            planRequired: plan.slug === 'free' ? 'pro' : 'enterprise',
        };
    }, [plan, limitType, currentUsage]);
}

/**
 * Hook para verificar se usuário pode executar uma ação
 * Combina verificação de feature + quota
 */
export function useCanPerformAction(
    action: 'add_transaction' | 'add_card' | 'export_data' | 'access_api' | 'advanced_reports',
    currentUsage?: number
): FeatureAccess {
    const featureMap: Record<string, string> = {
        'add_transaction': 'transaction_tracking',
        'add_card': 'basic_dashboard',
        'export_data': 'export_data',
        'access_api': 'api_access',
        'advanced_reports': 'advanced_reports',
    };

    const quotaMap: Record<string, 'transactions' | 'dashboard_cards' | null> = {
        'add_transaction': 'transactions',
        'add_card': 'dashboard_cards',
        'export_data': null,
        'access_api': null,
        'advanced_reports': null,
    };

    const featureAccess = useFeatureAccess(featureMap[action] || action);
    const quotaType = quotaMap[action];
    const quotaAccess = quotaType && currentUsage !== undefined
        ? useQuotaLimit(quotaType, currentUsage)
        : { hasAccess: true };

    return useMemo(() => {
        // Verificar feature primeiro
        if (!featureAccess.hasAccess) {
            return featureAccess;
        }

        // Depois verificar quota
        if (!quotaAccess.hasAccess) {
            return quotaAccess;
        }

        return {
            hasAccess: true,
            currentLimit: quotaAccess.currentLimit,
            maxLimit: quotaAccess.maxLimit,
        };
    }, [featureAccess, quotaAccess]);
}
