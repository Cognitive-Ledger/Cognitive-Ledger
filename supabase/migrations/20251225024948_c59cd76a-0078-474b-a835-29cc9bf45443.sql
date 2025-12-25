-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'contributor');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user has any editorial role
CREATE OR REPLACE FUNCTION public.has_editorial_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'editor')
  )
$$;

-- RLS policy for user_roles: users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS policy for user_roles: admins can manage all roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Update articles RLS: editors can insert
CREATE POLICY "Editors can insert articles"
ON public.articles
FOR INSERT
TO authenticated
WITH CHECK (public.has_editorial_access(auth.uid()));

-- Update articles RLS: editors can update
CREATE POLICY "Editors can update articles"
ON public.articles
FOR UPDATE
TO authenticated
USING (public.has_editorial_access(auth.uid()));

-- Update articles RLS: admins can delete
CREATE POLICY "Admins can delete articles"
ON public.articles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update ai_models RLS: editors can insert
CREATE POLICY "Editors can insert ai_models"
ON public.ai_models
FOR INSERT
TO authenticated
WITH CHECK (public.has_editorial_access(auth.uid()));

-- Update ai_models RLS: editors can update
CREATE POLICY "Editors can update ai_models"
ON public.ai_models
FOR UPDATE
TO authenticated
USING (public.has_editorial_access(auth.uid()));

-- Update ai_models RLS: admins can delete
CREATE POLICY "Admins can delete ai_models"
ON public.ai_models
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update breaking_news RLS: editors can insert
CREATE POLICY "Editors can insert breaking_news"
ON public.breaking_news
FOR INSERT
TO authenticated
WITH CHECK (public.has_editorial_access(auth.uid()));

-- Update breaking_news RLS: editors can update
CREATE POLICY "Editors can update breaking_news"
ON public.breaking_news
FOR UPDATE
TO authenticated
USING (public.has_editorial_access(auth.uid()));

-- Update breaking_news RLS: admins can delete
CREATE POLICY "Admins can delete breaking_news"
ON public.breaking_news
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update daily_brief_items RLS: editors can insert
CREATE POLICY "Editors can insert daily_brief_items"
ON public.daily_brief_items
FOR INSERT
TO authenticated
WITH CHECK (public.has_editorial_access(auth.uid()));

-- Update daily_brief_items RLS: editors can update
CREATE POLICY "Editors can update daily_brief_items"
ON public.daily_brief_items
FOR UPDATE
TO authenticated
USING (public.has_editorial_access(auth.uid()));

-- Update daily_brief_items RLS: admins can delete
CREATE POLICY "Admins can delete daily_brief_items"
ON public.daily_brief_items
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));