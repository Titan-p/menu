"use server";

import { redirect } from "next/navigation";
import { clearMenuSession, isLoginPasswordValid, setMenuSession } from "@/lib/menu-session";

export async function loginWithPassword(formData: FormData) {
  const password = formData.get("password")?.toString() ?? "";

  if (!isLoginPasswordValid(password)) {
    redirect(`/?message=${encodeURIComponent("登录密码错误")}`);
  }

  await setMenuSession();
  redirect(`/?message=${encodeURIComponent("已登录")}`);
}

export async function logout() {
  await clearMenuSession();
  redirect(`/?message=${encodeURIComponent("已退出")}`);
}
