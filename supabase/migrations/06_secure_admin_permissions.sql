-- Secure Posts Table

-- Drop existing loose policies
DROP POLICY IF EXISTS "Authenticated users can insert posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can update posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can delete posts" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can view all posts" ON public.posts;

-- Create strict admin-only policies
CREATE POLICY "Admin can insert posts"
ON public.posts FOR INSERT
TO authenticated
WITH CHECK (auth.jwt() ->> 'email' = 'parishkrit2061@gmail.com');

CREATE POLICY "Admin can update posts"
ON public.posts FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'email' = 'parishkrit2061@gmail.com');

CREATE POLICY "Admin can delete posts"
ON public.posts FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'email' = 'parishkrit2061@gmail.com');

-- Admin can view all posts (including drafts)
CREATE POLICY "Admin can view all posts"
ON public.posts FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'email' = 'parishkrit2061@gmail.com');


-- Secure Comments Table

-- Drop existing loose policies
DROP POLICY IF EXISTS "Authenticated users can update comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can delete comments" ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can view all comments" ON public.comments;

-- Admin can update comments (approve/reject)
CREATE POLICY "Admin can update comments"
ON public.comments FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'email' = 'parishkrit2061@gmail.com');

-- Admin can delete any comment
CREATE POLICY "Admin can delete comments"
ON public.comments FOR DELETE
TO authenticated
USING (auth.jwt() ->> 'email' = 'parishkrit2061@gmail.com');

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
ON public.comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admin can view all comments (including unapproved)
CREATE POLICY "Admin can view all comments"
ON public.comments FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'email' = 'parishkrit2061@gmail.com');

-- Users can view their own comments (even if unapproved)
CREATE POLICY "Users can view own comments"
ON public.comments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
