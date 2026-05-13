import Link from "next/link";
import { Mail, Sparkles } from "lucide-react";
import { signInWithEmail } from "@/app/actions/auth";
import { getSupabaseRuntimeConfig } from "@/lib/supabase/config";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const isConfigured = Boolean(getSupabaseRuntimeConfig());

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <section>
          <Link href="/" className="text-sm font-semibold text-emerald-700">
            家庭菜单
          </Link>
          <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-normal sm:text-5xl">
            登录后同步家庭菜谱、分类和做饭记录
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            首版采用邮箱魔法链接登录，家庭成员加入同一个空间后共享菜谱库。
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {["共享菜谱", "分类灵感", "做过记录"].map((item) => (
              <div key={item} className="rounded-[8px] border border-slate-200 bg-white p-4">
                <Sparkles className="size-5 text-emerald-700" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-slate-900">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[8px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200">
          <div className="grid size-12 place-items-center rounded-[8px] bg-emerald-100 text-emerald-700">
            <Mail className="size-6" aria-hidden="true" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-normal">邮箱登录</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            输入邮箱后，Supabase 会发送登录链接。
          </p>

          {params.message ? (
            <p className="mt-4 rounded-[8px] bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {params.message}
            </p>
          ) : null}

          {isConfigured ? null : (
            <p className="mt-4 rounded-[8px] bg-orange-50 px-3 py-2 text-sm text-orange-800">
              当前线上环境使用演示模式。配置 Supabase 环境变量后即可发送登录邮件。
            </p>
          )}

          <form action={signInWithEmail} className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">邮箱</span>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="mt-2 h-12 w-full rounded-[8px] border border-slate-200 px-3 text-sm outline-none transition focus:border-emerald-500"
              />
            </label>
            <button className="h-12 w-full rounded-[8px] bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700">
              发送登录链接
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
