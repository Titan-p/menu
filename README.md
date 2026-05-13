# 家庭菜单

家庭菜单是一个基于 Next.js、Vercel 和 Supabase 的单页网页 App，用于管理家庭菜谱、按分类和标签查找做饭灵感。

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Postgres / Storage
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

当前代码采用单家庭模式。Next.js 服务端使用 Supabase service role key 读写数据，浏览器端只访问 Next.js 页面和 Server Actions。

在 Vercel Project Settings 中配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
MENU_WRITE_PASSWORD=
MENU_SESSION_SECRET=
MENU_HOUSEHOLD_NAME=家庭菜单
```

`MENU_WRITE_PASSWORD` 是家庭登录密码。登录成功后，应用会写入 httpOnly cookie；`MENU_SESSION_SECRET` 用于签名 cookie，建议配置为一段随机字符串。

数据库 schema 位于：

```text
src/lib/supabase/schema.sql
```

已执行旧版 schema 的 Supabase 项目，再执行：

```text
src/lib/supabase/single-family-migration.sql
```

产品与架构设计位于：

```text
docs/product-architecture.md
```
