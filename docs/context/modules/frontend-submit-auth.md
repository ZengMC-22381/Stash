# Module: frontend-submit-auth

## 页面入口
- 投稿页：`src/app/submit/page.tsx`
- 登录面板：`src/components/auth-panel.tsx`
- 投稿表单：`src/components/submit-form.tsx`

## 相关 API
- 认证：
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `POST /api/auth/logout`
- 投稿：
  - `POST /api/resources`
- 上传：
  - `POST /api/uploads`

## 关键校验与策略
- 资源 payload 校验：`src/lib/resource-validation.ts`
- 上传限制策略：`src/lib/upload-policy.ts`
- 限流规则：`src/lib/rate-limit-rules.ts`

## 常见改动点
- 提交字段与字典联动
- 上传策略（大小、类型、数量）
- 登录/注册交互与错误提示

