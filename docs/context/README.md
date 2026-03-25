# Stash Context System

目标：降低新线程启动时的上下文成本，避免每次“全仓重读”。

## 使用原则
- 每个新线程只读 `CORE` + 本次任务相关模块。
- 模块文档只写必要事实、入口文件、常见改动点，不写长篇背景。
- 如果某模块信息有变化，优先更新模块文档，再改代码，保证后续线程可复用。

## 快速开始
1. 列出可选模块：
   ```bash
   ./scripts/context-read.sh --list
   ```
2. 加载基础信息 + 目标模块：
   ```bash
   ./scripts/context-read.sh core api-resource data-model
   ```
3. 不确定读哪些时：
   ```bash
   ./scripts/context-read.sh core
   ```

## 建议加载组合
- 仅后端接口改造：`core + api-resource + data-model`
- 首页改造：`core + frontend-homepage + architecture`
- 搜索/探索改造：`core + frontend-explore + api-resource`
- 投稿/登录改造：`core + frontend-submit-auth + api-resource`
- 详情页互动改造：`core + frontend-resource-detail + api-resource`
- 协作流程问题：`core + workflow`

## 文件结构
- `CORE.md`: 所有线程必读基线
- `modules/*.md`: 领域模块

