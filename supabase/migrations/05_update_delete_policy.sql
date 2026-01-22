-- Update delete_comment function to support user_id ownership and strict admin check
CREATE OR REPLACE FUNCTION delete_comment(comment_id uuid, secret_key text DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.comments
  WHERE id = comment_id
  AND (
    -- Allow if the secret matches (Anonymous user legacy)
    (user_secret IS NOT NULL AND user_secret = secret_key)
    OR
    -- Allow if the user is the owner (New Auth system)
    (user_id = auth.uid())
    OR
    -- Allow if the user is authenticated admin (by email)
    (auth.jwt() ->> 'email' = 'parishkrit2061@gmail.com')
  );
  
  RETURN FOUND;
END;
$$;
