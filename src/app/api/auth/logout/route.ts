import { clearAuthCookie } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  // Sign out from Supabase (clears Supabase session cookies)
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Supabase not configured — ignore
  }

  // Clear legacy JWT cookie
  await clearAuthCookie();

  return Response.json({ success: true });
}
