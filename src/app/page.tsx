import { Clock3, KeyRound, Plus, Soup } from "lucide-react";
import { createRecipe } from "@/app/actions/recipes";
import { loginWithPassword, logout } from "@/app/actions/session";
import { getDashboardData } from "@/lib/dashboard-data";
import { isMenuSessionValid } from "@/lib/menu-session";
import type { Category, Recipe } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams?: Promise<{ message?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const [dashboard, isLoggedIn] = await Promise.all([getDashboardData(), isMenuSessionValid()]);
  const resolvedSearchParams = await searchParams;
  const message = resolvedSearchParams?.message;
  const recipeCount = dashboard.stats.find((item) => item.label === "菜谱")?.value ?? "0";
  const categoryCount = dashboard.stats.find((item) => item.label === "分类")?.value ?? "0";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-5 sm:px-6">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-emerald-700">
                {dashboard.householdName}
              </span>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                {dashboard.statusText}
              </span>
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">家庭菜单</h1>
            <p className="mt-2 text-sm text-slate-500">记录常做菜，临时找灵感。</p>
          </div>
          <div className="flex gap-2 text-sm">
            <StatPill label="菜谱" value={recipeCount} />
            <StatPill label="分类" value={categoryCount} />
          </div>
        </header>

        {message ? (
          <div className="rounded-[8px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
            {message}
          </div>
        ) : null}

        {isLoggedIn ? null : (
          <section className="rounded-[8px] border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <KeyRound className="size-4 text-emerald-700" aria-hidden="true" />
              <h2 className="text-lg font-semibold tracking-normal">登录</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">输入家庭登录密码后即可添加菜谱。</p>
            <form action={loginWithPassword} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                name="password"
                type="password"
                required
                placeholder="登录密码"
                className="h-11 min-w-0 flex-1 rounded-[8px] border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-500"
              />
              <button className="inline-flex h-11 items-center justify-center rounded-[8px] bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700">
                登录
              </button>
            </form>
          </section>
        )}

        {isLoggedIn ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <details className="group rounded-[8px] border border-slate-200 bg-white sm:min-w-72 sm:flex-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <span className="grid size-8 place-items-center rounded-full bg-slate-950 text-white">
                    <Plus className="size-4" aria-hidden="true" />
                  </span>
                  添加菜谱
                </span>
                <span className="text-xs text-slate-500 group-open:hidden">点击填写</span>
                <span className="hidden text-xs text-slate-500 group-open:inline">填写中</span>
              </summary>

              <form action={createRecipe} className="grid gap-3 border-t border-slate-200 p-4">
                <p className="text-sm text-slate-500">保存后会同步到 Supabase。</p>
                <div className="grid gap-3 sm:grid-cols-[1fr_140px_120px]">
                  <TextField name="title" label="菜名" placeholder="番茄炒蛋" required />
                  <label className="block">
                    <span className="text-xs font-medium text-slate-500">分类</span>
                    <select
                      name="category"
                      className="mt-1 h-11 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500"
                    >
                      {dashboard.categories.map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <TextField
                    name="cook_time_minutes"
                    label="分钟"
                    type="number"
                    placeholder="15"
                    min="1"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_160px]">
                  <TextField name="ingredients" label="食材" placeholder="番茄、鸡蛋、葱" />
                  <label className="block">
                    <span className="text-xs font-medium text-slate-500">难度</span>
                    <select
                      name="difficulty"
                      defaultValue="easy"
                      className="mt-1 h-11 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500"
                    >
                      <option value="easy">简单</option>
                      <option value="medium">中等</option>
                      <option value="hard">复杂</option>
                    </select>
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-medium text-slate-500">备注</span>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="关键做法、口味偏好、下次调整"
                    className="mt-1 w-full resize-none rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500"
                  />
                </label>
                <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-fit">
                  <Plus className="size-4" aria-hidden="true" />
                  保存
                </button>
              </form>
            </details>

            <form action={logout}>
              <button className="h-14 w-full rounded-[8px] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:border-emerald-400 hover:text-emerald-700 sm:w-auto">
                退出登录
              </button>
            </form>
          </div>
        ) : null}

        <section className="grid gap-5 lg:grid-cols-[180px_1fr]">
          <aside>
            <h2 className="text-sm font-semibold text-slate-900">分类</h2>
            <div className="mt-3 flex flex-wrap gap-2 lg:flex-col">
              {dashboard.categories.map((category) => (
                <CategoryChip key={category.name} category={category} />
              ))}
            </div>
          </aside>

          <section>
            <h2 className="text-sm font-semibold text-slate-900">菜谱</h2>
            <div className="mt-3 grid gap-3">
              {dashboard.recipes.length > 0 ? (
                dashboard.recipes.map((recipe) => <RecipeRow key={recipe.id} recipe={recipe} />)
              ) : (
                <div className="rounded-[8px] border border-dashed border-slate-300 bg-white p-6 text-center">
                  <Soup className="mx-auto size-6 text-slate-400" aria-hidden="true" />
                  <p className="mt-3 text-sm font-semibold text-slate-950">先添加第一道菜</p>
                  <p className="mt-1 text-sm text-slate-500">常做菜、备忘做法、临时灵感都可以放进来。</p>
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white px-3 py-2">
      <span className="font-semibold text-slate-950">{value}</span>
      <span className="ml-1 text-slate-500">{label}</span>
    </div>
  );
}

function TextField({
  name,
  label,
  placeholder,
  required,
  type = "text",
  min,
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  min?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <input
        name={name}
        type={type}
        min={min}
        required={required}
        placeholder={placeholder}
        className="mt-1 h-11 w-full rounded-[8px] border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-500"
      />
    </label>
  );
}

function CategoryChip({ category }: { category: Category }) {
  return (
    <div className="inline-flex items-center justify-between gap-3 rounded-[8px] border border-slate-200 bg-white px-3 py-2 text-sm">
      <span className="font-medium text-slate-800">{category.name}</span>
      <span className="text-xs text-slate-500">{category.count}</span>
    </div>
  );
}

function RecipeRow({ recipe }: { recipe: Recipe }) {
  return (
    <article className="rounded-[8px] border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-emerald-700">{recipe.category}</p>
          <h3 className="mt-1 text-lg font-semibold tracking-normal text-slate-950">
            {recipe.title}
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
          <Clock3 className="size-3.5" aria-hidden="true" />
          {recipe.cookTime}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{recipe.note}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {recipe.ingredients.map((ingredient) => (
          <span key={ingredient} className="rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
            {ingredient}
          </span>
        ))}
      </div>
    </article>
  );
}
