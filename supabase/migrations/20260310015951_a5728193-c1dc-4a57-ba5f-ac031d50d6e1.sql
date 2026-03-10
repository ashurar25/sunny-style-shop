-- Table to track signup attempts by IP for rate limiting
CREATE TABLE IF NOT EXISTS public.signup_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_signup_attempts_ip_created ON public.signup_attempts (ip_address, created_at DESC);

-- Auto-cleanup old records (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_signup_attempts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.signup_attempts WHERE created_at < now() - interval '1 hour';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_cleanup_signup_attempts
AFTER INSERT ON public.signup_attempts
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_old_signup_attempts();

-- RLS: allow edge functions (service role) only
ALTER TABLE public.signup_attempts ENABLE ROW LEVEL SECURITY;