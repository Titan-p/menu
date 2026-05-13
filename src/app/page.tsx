import Image from "next/image";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  KeyRound,
  Plus,
  Search,
  Shuffle,
  Sparkles,
  Users,
} from "lucide-react";
import { createRecipe } from "@/app/actions/recipes";
import { getDashboardData } from "@/lib/dashboard-data";
import { navItems, quickFilters } from "@/lib/sample-data";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams?: Promise<{ message?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const dashboard = await getDashboardData();
  const resolvedSearchParams = await searchParams;
  const message = resolvedSearchParams?.message;
  const featuredRecipe = dashboard.featuredRecipe;
  const secondaryRecipes = dashboard.recipes.filter((recipe) => recipe.id !== featuredRecipe.id);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-24 pt-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 py-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-emerald-700">{dashboard.householdName}</p>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-500 shadow-sm">
                {dashboard.statusText}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
              今天吃什么
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 shadow-sm md:w-80 md:flex-none">
              <Search className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
              <input
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="搜索菜名、食材、标签"
                aria-label="搜索菜谱"
              />
            </div>
            <button className="grid size-11 shrink-0 place-items-center rounded-full bg-slate-950 text-white shadow-sm transition hover:bg-emerald-700">
              <Plus className="size-5" aria-hidden="true" />
              <span className="sr-only">添加菜谱</span>
            </button>
          </div>
        </header>

        {message ? (
          <div className="mb-4 rounded-[8px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
            {message}
          </div>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
          <div className="overflow-hidden rounded-[8px] bg-slate-950 text-white shadow-xl shadow-slate-200">
            <div className="grid min-h-[420px] md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <div className="relative min-h-[260px] md:min-h-full">
                <Image
                  src={featuredRecipe.image}
                  alt={featuredRecipe.imageAlt}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-between gap-8 p-6 sm:p-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400 px-3 py-1 text-xs font-semibold text-emerald-950">
                      <Sparkles className="size-3.5" aria-hidden="true" />
                      今日灵感
                    </span>
                    <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-medium text-white">
                      {featuredRecipe.category}
                    </span>
                  </div>
                  <h2 className="mt-5 text-4xl font-semibold tracking-normal sm:text-5xl">
                    {featuredRecipe.title}
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-7 text-slate-200">
                    {featuredRecipe.note}
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-3 gap-3">
                    <InfoTile label="耗时" value={featuredRecipe.cookTime} />
                    <InfoTile label="难度" value={featuredRecipe.difficulty} />
                    <InfoTile label="上次做" value={featuredRecipe.lastCooked} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {featuredRecipe.ingredients.map((ingredient) => (
                      <span
                        key={ingredient}
                        className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-slate-100"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-white px-5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-100">
                      <Shuffle className="size-4" aria-hidden="true" />
                      换一道
                    </button>
                    <button className="inline-flex h-12 items-center justify-center gap-2 rounded-[8px] border border-white/20 px-5 text-sm font-semibold text-white transition hover:bg-white/10">
                      查看做法
                      <ChevronRight className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-[8px] bg-emerald-100 text-emerald-700">
                  <Users className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">家庭空间</p>
                  <p className="font-semibold text-slate-950">单家庭共享菜谱</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                {dashboard.stats.slice(0, 3).map((item) => (
                  <div key={item.label} className="rounded-[8px] bg-slate-50 p-3">
                    <p className="text-xl font-semibold text-slate-950">{item.value}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-[8px] bg-orange-100 text-orange-700">
                  <CalendarDays className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">本周计划</p>
                  <p className="font-semibold text-slate-950">晚餐已有 3 天灵感</p>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                {["周二 虾仁滑蛋", "周四 菌菇汤面", "周六 番茄牛腩"].map((item) => (
                  <div key={item} className="flex items-center justify-between gap-3">
                    <span className="truncate text-slate-700">{item}</span>
                    <ChevronRight className="size-4 shrink-0 text-slate-300" aria-hidden="true" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm sm:col-span-3 lg:col-span-1">
              <p className="text-sm text-slate-500">快捷筛选</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {quickFilters.map((filter) => (
                  <button
                    key={filter}
                    className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="mt-6 rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-normal">新增菜谱</h2>
              <p className="mt-1 text-sm text-slate-500">
                {dashboard.canWrite ? "输入家庭口令后保存到 Supabase" : "配置家庭口令后开放写入"}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <KeyRound className="size-3.5" aria-hidden="true" />
              家庭口令
            </div>
          </div>

          <form action={createRecipe} className="mt-5 grid gap-3 lg:grid-cols-[1fr_150px_140px_120px]">
            <label className="block">
              <span className="text-xs font-medium text-slate-500">菜名</span>
              <input
                name="title"
                required
                placeholder="例如 蒜蓉西兰花"
                className="mt-1 h-11 w-full rounded-[8px] border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </label>
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
            <label className="block">
              <span className="text-xs font-medium text-slate-500">耗时</span>
              <input
                name="cook_time_minutes"
                type="number"
                min="1"
                inputMode="numeric"
                placeholder="20"
                className="mt-1 h-11 w-full rounded-[8px] border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </label>
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
            <label className="block lg:col-span-2">
              <span className="text-xs font-medium text-slate-500">食材</span>
              <input
                name="ingredients"
                placeholder="西兰花、蒜、生抽"
                className="mt-1 h-11 w-full rounded-[8px] border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </label>
            <label className="block lg:col-span-1">
              <span className="text-xs font-medium text-slate-500">口令</span>
              <input
                name="password"
                type="password"
                required
                className="mt-1 h-11 w-full rounded-[8px] border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </label>
            <button className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 lg:mt-6">
              <Plus className="size-4" aria-hidden="true" />
              保存
            </button>
            <label className="block lg:col-span-4">
              <span className="text-xs font-medium text-slate-500">备注</span>
              <textarea
                name="notes"
                rows={3}
                placeholder="关键做法、口味偏好、下次调整"
                className="mt-1 w-full resize-none rounded-[8px] border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-emerald-500"
              />
            </label>
          </form>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-normal">分类</h2>
              <button className="text-sm font-medium text-emerald-700">管理</button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {dashboard.categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.name}
                    className="flex min-h-16 items-center justify-between gap-3 rounded-[8px] border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-emerald-300"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className={`grid size-10 shrink-0 place-items-center rounded-[8px] ${category.tone}`}>
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-950">
                          {category.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {category.count} 道菜
                        </span>
                      </span>
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-slate-300" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-normal">最近灵感</h2>
                <p className="mt-1 text-sm text-slate-500">按家庭常做菜、耗时和最近记录生成</p>
              </div>
              <button className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800">
                <Shuffle className="size-4" aria-hidden="true" />
                随机一道
              </button>
            </div>

            <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {secondaryRecipes.length > 0 ? (
                secondaryRecipes.map((recipe) => (
                  <article
                    key={recipe.id}
                    className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm"
                  >
                    <div className="relative aspect-[4/3]">
                      <Image
                        src={recipe.image}
                        alt={recipe.imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-emerald-700">{recipe.category}</p>
                          <h3 className="mt-1 truncate text-lg font-semibold text-slate-950">
                            {recipe.title}
                          </h3>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                          <Clock3 className="size-3.5" aria-hidden="true" />
                          {recipe.cookTime}
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">
                        {recipe.note}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {recipe.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[8px] border border-dashed border-slate-300 bg-white p-8 text-center md:col-span-2 xl:col-span-3">
                  <p className="text-base font-semibold text-slate-950">菜谱库等待添加第一道菜</p>
                  <p className="mt-2 text-sm text-slate-500">
                    在上方表单保存后，新增菜谱会出现在这里。
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-2 shadow-[0_-8px_20px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="flex h-14 flex-col items-center justify-center gap-1 rounded-[8px] text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-emerald-700"
              >
                <Icon className="size-5" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] bg-white/10 p-3">
      <p className="text-xs text-slate-300">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
