import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client — for use in Client Components only.
 * Call once per component (or use a singleton via useMemo).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
