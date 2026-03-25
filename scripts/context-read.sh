#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
context_root="$repo_root/docs/context"

module_order=(
  core
  domain
  architecture
  frontend-homepage
  frontend-explore
  frontend-submit-auth
  frontend-resource-detail
  api-resource
  data-model
  workflow
)

module_file() {
  case "$1" in
    core) echo "$context_root/CORE.md" ;;
    domain) echo "$context_root/modules/domain.md" ;;
    architecture) echo "$context_root/modules/architecture.md" ;;
    frontend-homepage) echo "$context_root/modules/frontend-homepage.md" ;;
    frontend-explore) echo "$context_root/modules/frontend-explore.md" ;;
    frontend-submit-auth) echo "$context_root/modules/frontend-submit-auth.md" ;;
    frontend-resource-detail) echo "$context_root/modules/frontend-resource-detail.md" ;;
    api-resource) echo "$context_root/modules/api-resource.md" ;;
    data-model) echo "$context_root/modules/data-model.md" ;;
    workflow) echo "$context_root/modules/workflow.md" ;;
    *) echo "" ;;
  esac
}

module_description() {
  case "$1" in
    core) echo "项目全局必读（每线程先读）" ;;
    domain) echo "资源业务定义与术语" ;;
    architecture) echo "工程结构与运行边界" ;;
    frontend-homepage) echo "首页模块" ;;
    frontend-explore) echo "探索/搜索模块" ;;
    frontend-submit-auth) echo "投稿/登录模块" ;;
    frontend-resource-detail) echo "资源详情与互动模块" ;;
    api-resource) echo "资源 API 模块" ;;
    data-model) echo "Prisma 数据模型与迁移模块" ;;
    workflow) echo "GitHub Flow + Worktree 协作模块" ;;
    *) echo "" ;;
  esac
}

print_usage() {
  cat <<'EOF'
Usage:
  ./scripts/context-read.sh --list
  ./scripts/context-read.sh core api-resource data-model
  ./scripts/context-read.sh all

Tips:
  - 新线程建议至少读: core
  - 按任务追加 1-3 个模块，避免一次性加载全部上下文
EOF
}

print_list() {
  echo "Available modules:"
  for key in "${module_order[@]}"; do
    printf "  %-24s %s\n" "$key" "$(module_description "$key")"
  done
}

render_module() {
  local module="$1"
  local file
  file="$(module_file "$module")"
  if [ -z "$file" ]; then
    echo "Error: unknown module '$module'" >&2
    echo
    print_list
    exit 1
  fi

  if [ ! -f "$file" ]; then
    echo "Error: module file missing for '$module': $file" >&2
    exit 1
  fi

  echo "===== $module ====="
  cat "$file"
  echo
}

if [ "${1:-}" = "" ] || [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  print_usage
  echo
  print_list
  exit 0
fi

if [ "${1:-}" = "--list" ]; then
  print_list
  exit 0
fi

if [ "${1:-}" = "all" ]; then
  for key in "${module_order[@]}"; do
    render_module "$key"
  done
  exit 0
fi

for module in "$@"; do
  render_module "$module"
done
