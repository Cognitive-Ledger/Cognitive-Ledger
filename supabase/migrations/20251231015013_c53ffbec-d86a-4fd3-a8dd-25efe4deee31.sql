-- Add confirmation token column for double opt-in
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN confirmation_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster token lookups
CREATE INDEX idx_newsletter_confirmation_token ON public.newsletter_subscribers(confirmation_token);