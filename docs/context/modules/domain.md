# Module: domain

## 目标
理解业务上的“资源（Resource）”定义与生命周期。

## 关键事实
- 资源类型当前包括：
  - `design-md`
  - `agent-skill`
  - `prompt-pack`
  - `workflow`
  - `case-study`
- 字典维度：
  - `resourceType`
  - `toolAgent`
  - `scenario`
  - `tags`
- 资源创建后默认公开，出现在探索页。
- 支持互动：点赞、收藏、评分、评论、Remix、复制统计。

## 关键文件
- 领域说明：
  - `docs/resource-domain.md`
- 字典定义：
  - `src/lib/resource-definition.ts`

## 改动建议
- 新增资源类型/标签优先改 `resource-definition.ts`
- 涉及“资源语义”文案时优先使用 `Resource/资源`，避免回退为旧设计术语

