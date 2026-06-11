-- Alinha as preferencias salvas com os cards atualmente suportados no dashboard.
-- Execute este script em ambientes que ja possuem dados em dashboard_preferences.

CREATE OR REPLACE FUNCTION initialize_dashboard_preferences(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    default_cards TEXT[] := ARRAY[
        'budget_vs_actual',
        'bills_calendar',
        'financial_radar',
        'summary_cards',
        'cash_flow_chart',
        'transactions_table'
    ];
    card TEXT;
    free_plan_max_cards INT;
    position_counter INT := 0;
BEGIN
    SELECT max_dashboard_cards INTO free_plan_max_cards
    FROM subscription_plans
    WHERE slug = 'free';

    FOREACH card IN ARRAY default_cards
    LOOP
        INSERT INTO dashboard_preferences (user_id, card_id, is_visible, position)
        VALUES (
            p_user_id,
            card,
            position_counter < free_plan_max_cards,
            position_counter
        )
        ON CONFLICT (user_id, card_id) DO NOTHING;

        position_counter := position_counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

DELETE FROM dashboard_preferences
WHERE card_id NOT IN (
    'budget_vs_actual',
    'bills_calendar',
    'financial_radar',
    'summary_cards',
    'cash_flow_chart',
    'transactions_table'
);
