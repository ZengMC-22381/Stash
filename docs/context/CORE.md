# CORE Context (Always Read)

## 1) 项目定位
- 产品名：`Stash`
- 目标：资源创作者社区，支持发布、浏览、收藏、点赞、评分、评论、Remix。
- 资源语义：`Resource`
- 兼容现实：数据库实体仍为 `Design`（历史兼容），但对外优先走 `resources` 语义。

## 2) 技术栈
- `Next.js 15`（App Router）
- `React 19`
- `Prisma + SQLite`
- `Tailwind CSS`
- 认证：JWT Cookie

## 3) 全局命名与兼容约定
- 前端页面主路由：`/resources/[slug]`
- 兼容路由保留：`/designs/[slug]`、`/design/[slug]`
- API 主语义：`/api/resources/*`
- 兼容 API 保留：`/api/designs/*`
- 返回体优先字段：`resource` / `resources`
- 兼容字段仍可保留：`design` / `designs`

## 4) 关键全局文件
- 站点布局与元信息：
  - `src/app/layout.tsx`
- 数据访问层：
  - `src/lib/data.ts`
- 认证与 Cookie：
  - `src/lib/auth.ts`
  - `src/lib/server-auth.ts`
- 语言：
  - `src/lib/locale.ts`
  - `src/lib/server-locale.ts`
- 资源字典：
  - `src/lib/resource-definition.ts`

## 5) 后端稳态能力（已落地）
- 速率限制：
  - `src/lib/rate-limit.ts`
  - `src/lib/rate-limit-rules.ts`
- 资源与评论校验：
  - `src/lib/resource-validation.ts`
- 上传策略：
  - `src/lib/upload-policy.ts`

## 6) 常用命令
```bash
npm install
npm run dev
npm test
npm run build
./scripts/context-read.sh --list
```

## 7) 新线程最小流程
1. 读 `core`
2. 读本次变更模块（1-3个）
3. 再进入对应代码目录改动

