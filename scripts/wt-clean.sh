#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "" ]; then
  echo "Usage: $0 <issue-slug>"
  echo "Example: $0 128-login-page"
  exit 1
fi

name="$1"
repo_root="$(git rev-parse --show-toplevel)"
wt_root="${WT_ROOT:-$(cd "$repo_root/.." && pwd)/_wt}"
path="${wt_root}/${name}"
branch="codex/${name}"

if [ -d "$path" ]; then
  git -C "$repo_root" worktree remove "$path"
  echo "Removed worktree: $path"
else
  echo "Worktree path not found, skip remove: $path"
fi

if git -C "$repo_root" show-ref --verify --quiet "refs/heads/${branch}"; then
  git -C "$repo_root" branch -d "$branch"
  echo "Deleted local branch: $branch"
else
  echo "Local branch not found, skip delete: $branch"
fi
