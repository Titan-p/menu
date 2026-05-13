# 家庭菜单

家庭菜单是一个基于 Next.js、Vercel 和 Supabase 的单页网页 App，用于管理家庭菜谱、按分类和标签查找做饭灵感，并支持后续扩展为多成员共享菜谱库。

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth / Postgres / Storage
- Vercel

## 本地运行

```bash
pnpm install
pnpm dev
```

访问：

```text
http://localhost:3000
```

## 构建

```bash
pnpm build
```

## Supabase 配置

当前代码已提供 Supabase client 骨架，页面首版可以在环境变量为空时完成构建和部署。

后续接入真实数据时，在 Vercel Project Settings 中配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

数据库 schema 位于：

```text
src/lib/supabase/schema.sql
```

产品与架构设计位于：

```text
docs/product-architecture.md
```
