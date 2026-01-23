"use client";

import { ReactNode } from "react";
import { useFeatureAccess, useQuotaLimit } from "@/hooks/useFeatureAccess";
import UpgradePrompt from "./UpgradePrompt";

interface FeatureGateProps {
    feature?: string;
    quotaType?: 'transactions' | 'dashboard_cards';
    currentUsage?: number;
    children: ReactNode;
    fallback?: ReactNode;
    variant?: 'modal' | 'inline' | 'banner';
}

/**
 * Component that gates content based on subscription features or quotas
 * Shows upgrade prompt if user doesn't have access
 */
export default function FeatureGate({
    feature,
    quotaType,
    currentUsage,
    children,
    fallback,
    variant = 'inline'
}: FeatureGateProps) {
    const featureAccess = feature ? useFeatureAccess(feature) : { hasAccess: true };
    const quotaAccess = quotaType && currentUsage !== undefined
        ? useQuotaLimit(quotaType, currentUsage)
        : { hasAccess: true };

    // Check feature first, then quota
    if (!featureAccess.hasAccess) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <UpgradePrompt
                feature={feature}
                planRequired={featureAccess.planRequired as 'pro' | 'enterprise'}
                reason={featureAccess.reason}
                variant={variant}
            />
        );
    }

    if (!quotaAccess.hasAccess) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <UpgradePrompt
                planRequired={quotaAccess.planRequired as 'pro' | 'enterprise'}
                reason={quotaAccess.reason}
                variant={variant}
            />
        );
    }

    return <>{children}</>;
}
