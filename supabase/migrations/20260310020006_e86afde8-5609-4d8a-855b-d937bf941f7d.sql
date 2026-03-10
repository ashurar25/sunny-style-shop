-- Fix search_path on cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_signup_attempts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.signup_attempts WHERE created_at < now() - interval '1 hour';
  RETURN NEW;
END;
$$;