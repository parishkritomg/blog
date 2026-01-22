import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Accessing the service role key to bypass RLS for admin tasks if needed
// Or simply to have a privileged client
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
