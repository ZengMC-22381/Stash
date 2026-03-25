# 资源（Resource）领域定义

## 概念
- 本项目中的“资源（Resource）”指用户可提交并公开浏览的内容实体，例如 `DESIGN.md`、`Agent Skill`、`Prompt Pack`、`Workflow`、`Case Study` 等。
- 当前实现上，数据库中的 `Design` 模型承载 Resource 实体（向后兼容已有接口），并新增 Resource 语义字段。

## 生命周期
1. 用户登录后提交资源。
2. 资源创建成功即进入公开状态（默认发布），会出现在“探索”页。
3. 其他用户可对资源执行点赞、收藏、评分、评论、Remix 等互动。

## 字段与字典
- 字段来源于 `资源字段字典.xlsx`，已固化到代码配置：
  - `resourceType`（资源类型）
  - `toolAgent`（工具 / Agents）
  - `scenario`（场景）
  - `tags`（标签，支持字典项和扩展标签）
- 字典配置文件：
  - `src/lib/resource-definition.ts`

## 接口
- `POST /api/resources`：创建资源（兼容旧的 `/api/designs`）
- `GET /api/resources`：查询资源列表（兼容旧的 `/api/designs`）
- `GET /api/resources/dictionary`：获取资源字段字典
