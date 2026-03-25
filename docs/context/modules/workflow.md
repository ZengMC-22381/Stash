# Module: workflow

## 协作方式
- `GitHub Flow + Codex Worktree`
- 一条需求一个 issue，一个分支，一个 PR
- 禁止直接推 `main`

## 分支命名
- `codex/<issue>-<slug>`
- 示例：`codex/325-homepage`

## 常用脚本
- 新建 worktree：
  - `./scripts/wt-new.sh <issue> <slug>`
- 同步 main：
  - `./scripts/wt-sync.sh <issue-slug>`
- 清理 worktree：
  - `./scripts/wt-clean.sh <issue-slug>`

## 入口文档
- `docs/CODEX_GITHUB_WORKFLOW_MANUAL.md`

## 新线程建议
1. 先加载 `core + workflow`
2. 再按任务加载业务模块

