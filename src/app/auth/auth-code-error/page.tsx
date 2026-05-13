import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 text-slate-950">
      <section className="w-full max-w-md rounded-[8px] border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-200">
        <h1 className="text-2xl font-semibold tracking-normal">登录链接已失效</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          返回登录页重新发送邮箱链接。
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-[8px] bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          重新登录
        </Link>
      </section>
    </main>
  );
}
