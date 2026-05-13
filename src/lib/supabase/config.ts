export type SupabaseServiceConfig = {
  url: string;
  serviceRoleKey: string;
};

export function getSupabaseServiceConfig(): SupabaseServiceConfig | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && serviceRoleKey) {
    return { url, serviceRoleKey };
  }

  return null;
}

export function getWritePassword() {
  return process.env.MENU_WRITE_PASSWORD?.trim() ?? "";
}

export function getConfiguredHouseholdName() {
  return process.env.MENU_HOUSEHOLD_NAME?.trim() || "家庭菜单";
}

export function getConfiguredHouseholdId() {
  return process.env.MENU_HOUSEHOLD_ID?.trim() || null;
}
