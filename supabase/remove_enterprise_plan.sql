-- Remove the Enterprise plan from subscription_plans table
-- This plan was created by mistake and should not exist

-- First, let's check if there are any active subscriptions using the Enterprise plan
-- (This query is for verification only - comment out before running)
-- SELECT * FROM subscriptions WHERE plan_id IN (
--   SELECT id FROM subscription_plans WHERE name = 'Enterprise'
-- );

-- Remove the Enterprise plan
DELETE FROM subscription_plans 
WHERE name = 'Enterprise';

-- Verify remaining plans
SELECT 
  id,
  name,
  price_monthly,
  price_yearly,
  is_active,
  created_at
FROM subscription_plans
ORDER BY price_monthly ASC;
