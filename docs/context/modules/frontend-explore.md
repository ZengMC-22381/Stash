# Module: frontend-explore

## 页面入口
- `src/app/explore/page.tsx`
- `src/components/quick-search-dock.tsx`

## 页面职责
- 资源列表浏览
- 搜索 + facets 筛选
- 主题浏览

## Facet 流程
- 前端面板：`quick-search-dock`
- 后端聚合接口：`GET /api/search-facets`
- 规则推导：
  - `src/lib/search-facets.ts`

## 数据入口
- `getResourceSummaries`（`src/lib/data.ts`）
- `getTopics`（`src/lib/data.ts`）

## 常见改动点
- 筛选维度展示规则
- facets 推导关键词
- 结果排序/分页
- 搜索体验（交互、文案、快捷键）

