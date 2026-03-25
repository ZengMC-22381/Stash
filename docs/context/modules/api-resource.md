# Module: api-resource

## 目标
按资源语义理解后端接口，避免新线程误连旧路由。

## 主入口（推荐）
- `GET|POST /api/resources`
- `GET /api/resources/featured`
- `GET /api/resources/dictionary`
- `GET /api/resources/[slug]`
- `GET|POST|DELETE /api/resources/[slug]/likes`
- `GET|POST|DELETE /api/resources/[slug]/bookmark`
- `GET|POST /api/resources/[slug]/ratings`
- `GET|POST /api/resources/[slug]/comments`
- `POST /api/resources/[slug]/remix`

## 兼容入口（仍存在）
- `/api/designs/*` 与上述逻辑等价

## 稳态能力位置
- 限流：
  - `src/lib/rate-limit.ts`
  - `src/lib/rate-limit-rules.ts`
- 资源内容校验：
  - `src/lib/resource-validation.ts`
- 上传策略：
  - `src/lib/upload-policy.ts`

## 改动建议
- 新增接口优先挂在 `/api/resources/*`
- 写接口改动时同时考虑：
  - 输入校验
  - 速率限制
  - 兼容返回字段（`resource` + `design`）

