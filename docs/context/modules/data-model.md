# Module: data-model

## Prisma 事实
- 数据源：SQLite
- 核心实体：`Design`（历史命名，承载 Resource）
- 资源字段（已加入）：
  - `resourceType`
  - `toolAgent`
  - `scenario`
- 互动模型：
  - `Comment`
  - `Rating`
  - `Bookmark`
  - `Like`
  - `CopyEvent`

## 关键文件
- `prisma/schema.prisma`
- `prisma/migrations/*`
- `prisma/seed.js`

## 迁移背景
- 初始模型：`Design` 体系
- 后续新增：
  - `CopyEvent`
  - `Like`
  - 资源语义字段

## 改动建议
- 结构重命名（Design -> Resource）属于高风险迁移，分阶段做：
  1. 先路由和文案语义统一（已做）
  2. 再考虑 schema 层重命名与数据迁移

