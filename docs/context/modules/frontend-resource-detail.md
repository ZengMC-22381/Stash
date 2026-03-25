# Module: frontend-resource-detail

## 页面入口
- 主路由：`src/app/resources/[slug]/page.tsx`
- 兼容路由：
  - `src/app/designs/[slug]/page.tsx`
  - `src/app/design/[slug]/page.tsx`

## 关键组件
- `src/components/resource-actions.tsx`
- `src/components/resource-engagement.tsx`
- `src/components/resource-md-viewer.tsx`
- `src/components/resource-card.tsx`

## 功能范围
- 资源详情渲染
- 点赞/收藏/复制/Remix
- 评分与评论
- 相关资源推荐

## 相关 API
- `GET /api/resources/[slug]`
- `GET|POST|DELETE /api/resources/[slug]/likes`
- `GET|POST|DELETE /api/resources/[slug]/bookmark`
- `GET|POST /api/resources/[slug]/ratings`
- `GET|POST /api/resources/[slug]/comments`
- `POST /api/resources/[slug]/remix`

## 常见改动点
- 互动状态管理
- 详情区块结构/样式
- 相关资源推荐逻辑

