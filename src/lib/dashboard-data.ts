import { Soup } from "lucide-react";
import {
  categories as demoCategories,
  featuredRecipe as demoFeaturedRecipe,
  recipes as demoRecipes,
  stats as demoStats,
  defaultCategoryNames,
  type Category,
  type Recipe,
} from "@/lib/sample-data";
import {
  getConfiguredHouseholdId,
  getConfiguredHouseholdName,
  getSupabaseServiceConfig,
} from "@/lib/supabase/config";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export type DashboardData = {
  dataMode: "demo" | "supabase" | "empty";
  householdId: string | null;
  householdName: string;
  featuredRecipe: Recipe;
  recipes: Recipe[];
  categories: Category[];
  stats: { label: string; value: string }[];
  statusText: string;
  canWrite: boolean;
};

type HouseholdRow = {
  id: string;
  name: string;
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

  if (!getSupabaseServiceConfig()) {
    return demoData;
  }

  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return demoData;
  }

  const household = await ensureHousehold();

  if (!household) {
    return {
      ...demoData,
      dataMode: "empty",
      householdId: null,
      householdName: getConfiguredHouseholdName(),
      recipes: [],
      categories: demoCategories.map((category) => ({ ...category, count: 0 })),
      stats: [
        { label: "菜谱", value: "0" },
        { label: "分类", value: "0" },
        { label: "本月做过", value: "0" },
      ],
      statusText: "Supabase 表结构待确认",
      canWrite: false,
    };
  }

  await ensureDefaultCategories(household.id);

  const [recipesResult, categoriesResult] = await Promise.all([
    supabase
      .from("recipes")
      .select(
        "id, title, description, difficulty, cook_time_minutes, ingredients, notes, image_path, categories(name)",
      )
      .eq("household_id", household.id)
      .order("updated_at", { ascending: false })
      .limit(18)
      .returns<RecipeRow[]>(),
    supabase
      .from("categories")
      .select("id, name")
      .eq("household_id", household.id)
      .order("sort_order", { ascending: true })
      .returns<CategoryRow[]>(),
  ]);

  const mappedRecipes = recipesResult.data?.map(mapRecipeRow) ?? [];
  const categories = mapCategories(categoriesResult.data ?? [], mappedRecipes);

  return {
    dataMode: mappedRecipes.length > 0 ? "supabase" : "empty",
    householdId: household.id,
    householdName: household.name,
    featuredRecipe: mappedRecipes[0] ?? getEmptyRecipe(),
    recipes: mappedRecipes,
    categories: categories.length > 0 ? categories : demoCategories.map((category) => ({ ...category, count: 0 })),
    stats: [
      { label: "菜谱", value: String(mappedRecipes.length) },
      { label: "分类", value: String(categories.length) },
      { label: "本月做过", value: "0" },
    ],
    statusText: "已连接 Supabase",
    canWrite: Boolean(process.env.MENU_WRITE_PASSWORD?.trim()),
  };
}

export async function ensureHousehold(): Promise<HouseholdRow | null> {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return null;
  }

  const configuredHouseholdId = getConfiguredHouseholdId();

  if (configuredHouseholdId) {
    const { data } = await supabase
      .from("households")
      .select("id, name")
      .eq("id", configuredHouseholdId)
      .maybeSingle<HouseholdRow>();

    if (data) {
      return data;
    }
  }

  const { data: existingHousehold } = await supabase
    .from("households")
    .select("id, name")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<HouseholdRow>();

  if (existingHousehold) {
    return existingHousehold;
  }

  const { data: createdHousehold } = await supabase
    .from("households")
    .insert({ name: getConfiguredHouseholdName(), created_by: null })
    .select("id, name")
    .single<HouseholdRow>();

  return createdHousehold ?? null;
}

export async function ensureDefaultCategories(householdId: string) {
  const supabase = getSupabaseServiceClient();

  if (!supabase) {
    return;
  }

  const rows = defaultCategoryNames.map((name, index) => ({
    household_id: householdId,
    name,
    sort_order: index + 1,
  }));

  await supabase
    .from("categories")
    .upsert(rows, { onConflict: "household_id,name", ignoreDuplicates: true });
}

function getDemoDashboardData(): DashboardData {
  return {
    dataMode: "demo",
    householdId: null,
    householdName: "潘家厨房",
    featuredRecipe: demoFeaturedRecipe,
    recipes: demoRecipes,
    categories: demoCategories,
    stats: demoStats,
    statusText: "演示数据",
    canWrite: false,
  };
}

function getEmptyRecipe(): Recipe {
  return {
    id: "empty",
    title: "先添加一道常做菜",
    category: "家庭菜谱",
    cookTime: "待补充",
    difficulty: "简单",
    image:
      "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "厨房案台上的食材",
    ingredients: ["菜名", "分类", "食材", "做法"],
    tags: ["新增菜谱"],
    lastCooked: "待记录",
    note: "把家里常做、容易忘、值得复做的菜先记录下来。",
  };
}

function mapRecipeRow(row: RecipeRow): Recipe {
  const ingredients = Array.isArray(row.ingredients)
    ? row.ingredients.map(String).filter(Boolean).slice(0, 4)
    : ["食材待补充"];

  return {
    id: row.id,
    title: row.title,
    category: getRelatedName(row.categories) ?? "其他分类",
    cookTime: row.cook_time_minutes ? `${row.cook_time_minutes} 分钟` : "待补充",
    difficulty: mapDifficulty(row.difficulty),
    image: getRecipeImage(row.image_path),
    imageAlt: row.title,
    ingredients: ingredients.length > 0 ? ingredients : ["食材待补充"],
    tags: [getRelatedName(row.categories) ?? "家庭菜"],
    lastCooked: "待记录",
    note: row.notes ?? row.description ?? "家庭菜谱记录已同步。",
  };
}

function mapCategories(rows: CategoryRow[], recipes: Recipe[]): Category[] {
  return rows.map((row, index) => {
    const demoCategory = demoCategories[index % demoCategories.length];
    const count = recipes.filter((recipe) => recipe.category === row.name).length;

    return {
      name: row.name,
      count,
      icon: demoCategory?.icon ?? Soup,
      tone: demoCategory?.tone ?? "bg-emerald-100 text-emerald-800",
    };
  });
}

function getRecipeImage(imagePath: string | null) {
  if (imagePath?.startsWith("http") || imagePath?.startsWith("/")) {
    return imagePath;
  }

  return "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80";
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

function getRelatedName(value: RecipeRow["categories"]) {
  if (Array.isArray(value)) {
    return value[0]?.name ?? null;
  }

  return value?.name ?? null;
}
