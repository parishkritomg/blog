-- Add user_secret to comments for anonymous deletion
ALTER TABLE public.comments ADD COLUMN user_secret text;

-- Create a secure function to delete comments
-- This allows deletion if the user provides the correct secret OR is an admin
CREATE OR REPLACE FUNCTION delete_comment(comment_id uuid, secret_key text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.comments
  WHERE id = comment_id
  AND (
    -- Allow if the secret matches (Anonymous user)
    (user_secret IS NOT NULL AND user_secret = secret_key)
    OR
    -- Allow if the user is authenticated (Admin)
    (auth.role() = 'authenticated')
  );
  
  RETURN FOUND;
END;
$$;
