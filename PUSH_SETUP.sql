-- Non-destructive SQL for PWA push notifications
-- Run this in Supabase SQL Editor without resetting existing data

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS push_subscriptions_select_policy ON public.push_subscriptions;
DROP POLICY IF EXISTS push_subscriptions_insert_policy ON public.push_subscriptions;
DROP POLICY IF EXISTS push_subscriptions_update_policy ON public.push_subscriptions;
DROP POLICY IF EXISTS push_subscriptions_delete_policy ON public.push_subscriptions;

CREATE POLICY push_subscriptions_select_policy ON public.push_subscriptions
  FOR SELECT
  USING (push_subscriptions.user_id = public.current_user_profile_id());

CREATE POLICY push_subscriptions_insert_policy ON public.push_subscriptions
  FOR INSERT
  WITH CHECK (push_subscriptions.user_id = public.current_user_profile_id());

CREATE POLICY push_subscriptions_update_policy ON public.push_subscriptions
  FOR UPDATE
  USING (push_subscriptions.user_id = public.current_user_profile_id())
  WITH CHECK (push_subscriptions.user_id = public.current_user_profile_id());

CREATE POLICY push_subscriptions_delete_policy ON public.push_subscriptions
  FOR DELETE
  USING (push_subscriptions.user_id = public.current_user_profile_id());
