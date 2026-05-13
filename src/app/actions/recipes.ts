"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureDefaultCategories, ensureHousehold } from "@/lib/dashboard-data";
import { isMenuSessionValid } from "@/lib/menu-session";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export async function createRecipe(formData: FormData) {
  if (!(await isMenuSessionValid())) {
    redirectWithMessage("请先登录");
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    redirectWithMessage("请先配置 Supabase 服务端环境变量");
  }

  const title = formData.get("title")?.toString().trim() ?? "";
  const categoryName = formData.get("category")?.toString().trim() || "家常菜";
  const notes = formData.get("notes")?.toString().trim() ?? "";
  const cookTime = Number(formData.get("cook_time_minutes") ?? 0);
  const difficulty = formData.get("difficulty")?.toString() || "easy";
  const ingredients = parseIngredients(formData.get("ingredients")?.toString() ?? "");

  if (!title) {
    redirectWithMessage("请输入菜名");
  }

  const household = await ensureHousehold();

  if (!household) {
    redirectWithMessage("家庭空间创建失败");
  }

  await ensureDefaultCategories(household.id);

  const categoryId = await getOrCreateCategory(household.id, categoryName);

  const { error } = await supabase.from("recipes").insert({
    household_id: household.id,
    category_id: categoryId,
    title,
    description: notes,
    difficulty,
    cook_time_minutes: Number.isFinite(cookTime) && cookTime > 0 ? cookTime : null,
    servings: null,
    image_path: null,
    ingredients,
    steps: [],
    notes,
    created_by: null,
  });

  if (error) {
    redirectWithMessage("菜谱保存失败");
  }

  revalidatePath("/");
  redirectWithMessage("菜谱已保存");
}

async function getOrCreateCategory(householdId: string, name: string) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return null;
  }

  const { data: existingCategory } = await supabase
    .from("categories")
    .select("id")
    .eq("household_id", householdId)
    .eq("name", name)
    .maybeSingle<{ id: string }>();

  if (existingCategory) {
    return existingCategory.id;
  }

  const { data: createdCategory } = await supabase
    .from("categories")
    .insert({ household_id: householdId, name, sort_order: 99 })
    .select("id")
    .single<{ id: string }>();

  return createdCategory?.id ?? null;
}

function parseIngredients(value: string) {
  return value
    .split(/[,\n，、]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function redirectWithMessage(message: string): never {
  redirect(`/?message=${encodeURIComponent(message)}`);
}
