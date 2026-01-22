-- Disable moderation by default
-- 1. Change default value of 'approved' to true
ALTER TABLE public.comments ALTER COLUMN approved SET DEFAULT true;

-- 2. Auto-approve all existing comments
UPDATE public.comments SET approved = true;
