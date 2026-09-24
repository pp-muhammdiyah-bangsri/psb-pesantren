import { createClient } from "@supabase/supabase-js";
import { localDbClient } from "./localDb";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Cek apakah menggunakan mode lokal (tanpa Supabase)
function isLocalMode() {
  if (process.env.USE_LOCAL_DB === "true") return true;
  if (!supabaseUrl || !supabaseAnonKey) return true;
  if (supabaseUrl.includes("your-project") || supabaseAnonKey.includes("your-anon-key")) return true;
  return false;
}

export const supabase = isLocalMode()
  ? (localDbClient as any)
  : createClient(supabaseUrl!, supabaseAnonKey!);

export function createAdminClient() {
  if (isLocalMode()) {
    return localDbClient as any;
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey!;
  return createClient(supabaseUrl!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
