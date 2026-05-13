"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function signInWithEmail(formData: FormData) {
  const email = formData.get("email")?.toString().trim();

  if (!email) {
    redirect("/login?message=请输入邮箱");
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    redirect("/login?message=请先配置 Supabase 环境变量");
  }

  const headerStore = await headers();
  const origin =
    headerStore.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent("登录邮件发送失败")}`);
  }

  redirect(`/login?message=${encodeURIComponent("登录邮件已发送，请查看邮箱")}`);
}

export async function signOut() {
  const supabase = await getSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/");
}
