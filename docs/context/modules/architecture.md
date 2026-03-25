# Module: architecture

## 目标
快速了解工程结构与运行边界。

## 框架与结构
- Next.js App Router（`src/app`）
- 页面、API 同仓
- API 运行时统一设为 `nodejs`
- 数据层通过 Prisma 访问 SQLite

## 目录速览
- 页面：
  - `src/app/page.tsx`
  - `src/app/explore/page.tsx`
  - `src/app/submit/page.tsx`
  - `src/app/resources/[slug]/page.tsx`
- API：
  - `src/app/api/resources/*`
  - `src/app/api/designs/*`（兼容）
- 公共组件：
  - `src/components/*`
- 数据与服务：
  - `src/lib/*`
- 数据库：
  - `prisma/schema.prisma`
  - `prisma/migrations/*`

## 关键约束
- 避免破坏 `resources` 与 `designs` 双语义兼容
- 新功能优先接在 `resources` 路由层
- 需要后端写入能力时优先补校验和限流

