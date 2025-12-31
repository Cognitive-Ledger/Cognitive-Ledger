-- Create scheduled_newsletters table for scheduled sending
CREATE TABLE public.scheduled_newsletters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'cancelled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_newsletters ENABLE ROW LEVEL SECURITY;

-- Editors can manage scheduled newsletters
CREATE POLICY "Editors can view scheduled_newsletters"
  ON public.scheduled_newsletters
  FOR SELECT
  USING (has_editorial_access(auth.uid()));

CREATE POLICY "Editors can insert scheduled_newsletters"
  ON public.scheduled_newsletters
  FOR INSERT
  WITH CHECK (has_editorial_access(auth.uid()));

CREATE POLICY "Editors can update scheduled_newsletters"
  ON public.scheduled_newsletters
  FOR UPDATE
  USING (has_editorial_access(auth.uid()));

CREATE POLICY "Admins can delete scheduled_newsletters"
  ON public.scheduled_newsletters
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_scheduled_newsletters_updated_at
  BEFORE UPDATE ON public.scheduled_newsletters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();