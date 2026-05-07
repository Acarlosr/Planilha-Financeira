// =============================================
// SaaS Types - Subscription & Admin
// =============================================

export type UserRole = 'user' | 'admin';

export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'trial';

export type CardSize = 'small' | 'default' | 'large';

// =============================================
// Subscription Plans
// =============================================

export interface SubscriptionPlan {
    id: string;
    name: string;
    slug: 'free' | 'pro' | 'enterprise';
    description: string | null;
    price_monthly: number;
    price_yearly: number;
    max_transactions: number | null; // null = unlimited
    max_dashboard_cards: number | null;
    features: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// =============================================
// User Profile
// =============================================

export interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: UserRole;
    subscription_plan_id: string;
    subscription_status: SubscriptionStatus;
    trial_ends_at: string | null;
    subscription_started_at: string;
    subscription_ends_at: string | null;
    is_suspended: boolean;
    created_at: string;
    updated_at: string;

    // Relations
    subscription_plan?: SubscriptionPlan;
}

// =============================================
// Dashboard Preferences
// =============================================

export interface DashboardPreference {
    id: string;
    user_id: string;
    card_id: string;
    is_visible: boolean;
    position: number;
    size: CardSize;
    updated_at: string;
}

export interface DashboardCard {
    id: string;
    title: string;
    description: string;
    component: string;
    requiredFeature?: string; // Feature flag necessária
    minPlan?: 'free' | 'pro' | 'enterprise';
}

// =============================================
// Activity Logs
// =============================================

export interface UserActivityLog {
    id: string;
    user_id: string | null;
    action: string;
    resource_type: string | null;
    resource_id: string | null;
    ip_address: string | null;
    user_agent: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
}

// =============================================
// Transaction Quota
// =============================================

export interface TransactionQuota {
    id: string;
    user_id: string;
    period_start: string;
    period_end: string;
    transactions_count: number;
    quota_limit: number | null;
    created_at: string;
    updated_at: string;
}

// =============================================
// Admin Metrics
// =============================================

export interface AdminMetrics {
    total_users: number;
    new_users_30d: number;
    new_users_7d: number;
    free_plan_users: number;
    pro_plan_users: number;
    enterprise_users: number;
    active_subscriptions: number;
    trial_users: number;
    monthly_revenue_pro: number;
    monthly_revenue_enterprise: number;
    last_updated: string;
}

// =============================================
// Feature Access
// =============================================

export interface FeatureAccess {
    hasAccess: boolean;
    planRequired: 'free' | 'pro' | 'enterprise' | null;
    reason?: string;
}

// =============================================
// Utility Types
// =============================================

export interface UserWithProfile extends UserProfile {
    subscription_plan: SubscriptionPlan;
}

export interface DashboardLayout {
    cards: DashboardPreference[];
    availableCards: DashboardCard[];
}
