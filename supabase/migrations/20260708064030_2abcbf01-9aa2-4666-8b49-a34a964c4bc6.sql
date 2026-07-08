
-- 1) Fix subscriptions: restrict "Service can manage" to service_role only
DROP POLICY IF EXISTS "Service can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Service role can manage subscriptions"
ON public.subscriptions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2) Profiles: make policies explicit to authenticated only, revoke anon
REVOKE ALL ON public.profiles FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- 3) Newsletter subscribers: tighten public insert with basic validation
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) > 3
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
);

-- 4) Audit log for newsletter subscriber access by admins
CREATE TABLE IF NOT EXISTS public.newsletter_subscriber_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id uuid,
  action text NOT NULL,
  subscriber_id uuid,
  subscriber_email text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.newsletter_subscriber_audit_log TO authenticated;
GRANT ALL ON public.newsletter_subscriber_audit_log TO service_role;

ALTER TABLE public.newsletter_subscriber_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
ON public.newsletter_subscriber_audit_log
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert audit rows"
ON public.newsletter_subscriber_audit_log
FOR INSERT TO authenticated, service_role
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS newsletter_audit_created_at_idx
  ON public.newsletter_subscriber_audit_log (created_at DESC);

-- Trigger to log admin mutations to newsletter_subscribers
CREATE OR REPLACE FUNCTION public.log_newsletter_subscriber_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.newsletter_subscriber_audit_log (actor_id, action, subscriber_id, subscriber_email, metadata)
  VALUES (
    auth.uid(),
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.email, OLD.email),
    jsonb_build_object('table', 'newsletter_subscribers')
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_log_newsletter_subscriber_change ON public.newsletter_subscribers;
CREATE TRIGGER trg_log_newsletter_subscriber_change
AFTER UPDATE OR DELETE ON public.newsletter_subscribers
FOR EACH ROW EXECUTE FUNCTION public.log_newsletter_subscriber_change();
