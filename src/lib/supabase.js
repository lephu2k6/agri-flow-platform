import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  "https://jyyhatrxkhttahnqeuqk.supabase.co",
  "sb_publishable_lBZh34HXop76oi8x1eIzZw_aGbgUkOB",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
