# Module: frontend-homepage

## 页面入口
- `src/app/page.tsx`

## 页面职责
- Hero + 数据看板 + 精选资源 + 主题分类 + 详情预览 + 发布 CTA
- 拉取数据：
  - `getFeaturedResources`
  - `getResourceDetail`
  - `getTopics`
  - `getHomeHeroStats`

## 关键依赖组件
- `src/components/resource-card.tsx`
- `src/components/topic-card.tsx`
- `src/components/rotating-hero-word.tsx`

## 常见改动点
- 首屏信息架构与文案
- 精选资源卡片数量/排序
- Hero 可视化与动效
- 发布引导区域 CTA 与转化路径

## 变更注意
- 文案避免回退到旧品牌/旧命名
- 链接优先使用 `/resources/[slug]`

