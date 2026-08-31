import { createClient } from "@supabase/supabase-js";

export function createClerkSupabaseClient(
  getToken: () => Promise<string | null>
) {
  return createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      accessToken: getToken,
    }
  );
}