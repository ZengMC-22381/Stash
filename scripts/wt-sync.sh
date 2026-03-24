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

if [ ! -d "$path" ]; then
  echo "Error: worktree does not exist: $path"
  exit 1
fi

git -C "$repo_root" fetch origin
git -C "$path" merge --no-edit origin/main || {
  echo "Merge conflict detected in $path."
  echo "Resolve conflicts, then run:"
  echo "  git -C \"$path\" add -A"
  echo "  git -C \"$path\" commit -m \"chore: resolve merge conflict\""
  exit 1
}

echo "Synced $name with origin/main."
