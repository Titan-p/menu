import Link from "next/link";
import { Home, Sparkles } from "lucide-react";
import { createHousehold } from "@/app/actions/household";

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-4xl items-center gap-8 lg:grid-cols-[1fr_400px]">
        <section>
          <Link href="/" className="text-sm font-semibold text-emerald-700">
            家庭菜单
          </Link>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-normal sm:text-5xl">
            创建家庭空间后开始同步菜谱
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            家庭空间是菜谱、分类、标签和成员权限的边界。默认分类会自动初始化。
          </p>
          <div className="mt-8 rounded-[8px] border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
            一户一个空间，多位成员共享同一套菜谱库。
          </div>
        </section>

        <section className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200">
          <div className="grid size-12 place-items-center rounded-[8px] bg-emerald-100 text-emerald-700">
            <Home className="size-6" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-normal">家庭名称</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            后续邀请成员时会显示这个名称。
          </p>

          {params.message ? (
            <p className="mt-4 rounded-[8px] bg-orange-50 px-3 py-2 text-sm text-orange-800">
              {params.message}
            </p>
          ) : null}

          <form action={createHousehold} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">名称</span>
              <input
                name="name"
                required
                placeholder="潘家厨房"
                className="mt-2 h-12 w-full rounded-[8px] border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </label>
            <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700">
              <Sparkles className="size-4" aria-hidden="true" />
              创建家庭空间
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
