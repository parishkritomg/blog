-- Add user_id to comments table
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view approved comments (or all if that was the design, but typically only approved)
-- existing code filters by approved=true in the query, so RLS can just allow public select.
DROP POLICY IF EXISTS "Public comments are viewable by everyone" ON public.comments;
CREATE POLICY "Public comments are viewable by everyone"
ON public.comments FOR SELECT
USING (true);

-- Policy: Authenticated users can insert their own comments
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.comments;
CREATE POLICY "Authenticated users can insert comments"
ON public.comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own comments (already handled by previous logic? 
-- The previous logic used a secret key or admin check in a function. 
-- Now we can use RLS for deletion too if we want, but the function approach is also fine.
-- Let's add RLS for delete just in case direct delete is attempted.)
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;
CREATE POLICY "Users can delete their own comments"
ON public.comments FOR DELETE
USING (auth.uid() = user_id);

-- Policy: Admins can do everything (assuming specific admin role or email check, 
-- but often service role is used for admin operations in Next.js server actions.
-- If client-side admin usage is needed, we need a policy for that.
-- For now, let's assume admin uses service role or we rely on the specific admin email.)
