"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseRuntimeConfig } from "./config";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  const config = getSupabaseRuntimeConfig();

  if (!config) {
    return null;
  }

  browserClient ??= createBrowserClient(config.url, config.anonKey);
  return browserClient;
}
