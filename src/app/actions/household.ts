"use server";

import { redirect } from "next/navigation";
import { defaultCategoryNames } from "@/lib/sample-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function createHousehold(formData: FormData) {
  const name = formData.get("name")?.toString().trim() || "我的家庭菜单";
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    redirect("/setup?message=请先配置 Supabase 环境变量");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?message=请先登录");
  }

  const { data: householdId, error } = await supabase.rpc("create_household", {
    household_name: name,
  });

  if (error || !householdId) {
    redirect(`/setup?message=${encodeURIComponent("家庭空间创建失败")}`);
  }

  await supabase.from("categories").insert(
    defaultCategoryNames.map((categoryName, index) => ({
      household_id: householdId,
      name: categoryName,
      sort_order: index + 1,
    })),
  );

  redirect("/");
}
