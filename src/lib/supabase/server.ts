import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServiceConfig } from "./config";

let serviceClient: SupabaseClient | null = null;

export function getSupabaseServiceClient(): SupabaseClient | null {
  const config = getSupabaseServiceConfig();

  if (!config) {
    return null;
  }

  serviceClient ??= createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return serviceClient;
}
