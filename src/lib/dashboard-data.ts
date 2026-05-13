import { Soup } from "lucide-react";
import {
  categories as demoCategories,
  featuredRecipe as demoFeaturedRecipe,
  recipes as demoRecipes,
  stats as demoStats,
  type Category,
  type Recipe,
} from "@/lib/sample-data";
import { getSupabaseRuntimeConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type DashboardData = {
  authMode: "demo" | "signed-out" | "signed-in" | "empty";
  userEmail: string | null;
  householdName: string;
  featuredRecipe: Recipe;
  recipes: Recipe[];
  categories: Category[];
  stats: { label: string; value: string }[];
  statusText: string;
};

type HouseholdMemberRow = {
  household_id: string;
  households?: { name?: string | null } | { name?: string | null }[] | null;
};

type RecipeRow = {
  id: string;
  title: string;
  description: string | null;
  difficulty: string | null;
  cook_time_minutes: number | null;
  ingredients: unknown;
  notes: string | null;
  image_path: string | null;
  categories?: { name?: string | null } | { name?: string | null }[] | null;
};

type CategoryRow = {
  id: string;
  name: string;
};

export async function getDashboardData(): Promise<DashboardData> {
  const demoData = getDemoDashboardData();

  if (!getSupabaseRuntimeConfig()) {
    return demoData;
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return demoData;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ...demoData,
      authMode: "signed-out",
      householdName: "家庭菜单",
      userEmail: null,
      statusText: "登录后同步家庭菜谱",
    };
  }

  const { data: member } = await supabase
    .from("household_members")
    .select("household_id, households(name)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle<HouseholdMemberRow>();

  if (!member) {
    return {
      ...demoData,
      authMode: "empty",
      userEmail: user.email ?? null,
      householdName: "新的家庭空间",
      stats: [
        { label: "菜谱", value: "0" },
        { label: "分类", value: "0" },
        { label: "本月做过", value: "0" },
      ],
      statusText: "已登录，等待创建家庭空间",
    };
  }

  const householdName = getHouseholdName(member.households) ?? "家庭菜单";

  const [recipesResult, categoriesResult, memberCountResult, cookedCountResult] =
    await Promise.all([
      supabase
        .from("recipes")
        .select(
          "id, title, description, difficulty, cook_time_minutes, ingredients, notes, image_path, categories(name)",
        )
        .eq("household_id", member.household_id)
        .order("updated_at", { ascending: false })
        .limit(12)
        .returns<RecipeRow[]>(),
      supabase
        .from("categories")
        .select("id, name")
        .eq("household_id", member.household_id)
        .order("sort_order", { ascending: true })
        .returns<CategoryRow[]>(),
      supabase
        .from("household_members")
        .select("user_id", { count: "exact", head: true })
        .eq("household_id", member.household_id),
      supabase
        .from("recipe_events")
        .select("id", { count: "exact", head: true })
        .eq("event_type", "cooked")
        .gte("created_at", getMonthStartIso()),
    ]);

  const mappedRecipes = recipesResult.data?.map(mapRecipeRow) ?? [];
  const mappedCategories = categoriesResult.data?.map(mapCategoryRow) ?? [];
  const recipes = mappedRecipes.length > 0 ? mappedRecipes : demoRecipes;

  return {
    authMode: "signed-in",
    userEmail: user.email ?? null,
    householdName,
    featuredRecipe: recipes[0] ?? demoFeaturedRecipe,
    recipes,
    categories: mappedCategories.length > 0 ? mappedCategories : demoCategories,
    stats: [
      { label: "菜谱", value: String(mappedRecipes.length) },
      { label: "分类", value: String(mappedCategories.length) },
      { label: "本月做过", value: String(cookedCountResult.count ?? 0) },
      { label: "成员", value: String(memberCountResult.count ?? 1) },
    ],
    statusText: "已连接 Supabase",
  };
}

function getDemoDashboardData(): DashboardData {
  return {
    authMode: "demo",
    userEmail: null,
    householdName: "潘家厨房",
    featuredRecipe: demoFeaturedRecipe,
    recipes: demoRecipes,
    categories: demoCategories,
    stats: demoStats,
    statusText: "演示数据",
  };
}

function mapRecipeRow(row: RecipeRow): Recipe {
  const ingredients = Array.isArray(row.ingredients)
    ? row.ingredients.map(String).slice(0, 4)
    : ["食材待补充"];

  return {
    id: row.id,
    title: row.title,
    category: getHouseholdName(row.categories) ?? "其他分类",
    cookTime: row.cook_time_minutes ? `${row.cook_time_minutes} 分钟` : "待补充",
    difficulty: mapDifficulty(row.difficulty),
    image: getRecipeImage(row.image_path),
    imageAlt: row.title,
    ingredients,
    tags: [getHouseholdName(row.categories) ?? "家庭菜"],
    lastCooked: "待记录",
    note: row.notes ?? row.description ?? "家庭菜谱记录已同步。",
  };
}

function getRecipeImage(imagePath: string | null) {
  if (imagePath?.startsWith("http") || imagePath?.startsWith("/")) {
    return imagePath;
  }

  return "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80";
}

function mapCategoryRow(row: CategoryRow): Category {
  return {
    name: row.name,
    count: 0,
    icon: Soup,
    tone: "bg-emerald-100 text-emerald-800",
  };
}

function mapDifficulty(value: string | null) {
  if (value === "easy") {
    return "简单";
  }

  if (value === "hard") {
    return "复杂";
  }

  return "中等";
}

function getHouseholdName(value: HouseholdMemberRow["households"]) {
  if (Array.isArray(value)) {
    return value[0]?.name ?? null;
  }

  return value?.name ?? null;
}

function getMonthStartIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}
