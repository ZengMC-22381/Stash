#!/usr/bin/env bash
set -euo pipefail

if [ "${1:-}" = "" ] || [ "${2:-}" = "" ]; then
  echo "Usage: $0 <issue-number> <slug> [base-branch]"
  echo "Example: $0 128 login-page main"
  exit 1
fi

issue="$1"
slug_raw="$2"
base_branch="${3:-main}"

if [[ ! "$issue" =~ ^[0-9]+$ ]]; then
  echo "Error: <issue-number> must be numeric."
  exit 1
fi

slug="$(echo "$slug_raw" | tr '[:upper:]' '[:lower:]' | sed -E 's/[^a-z0-9]+/-/g; s/^-+//; s/-+$//')"
if [ -z "$slug" ]; then
  echo "Error: slug became empty after normalization."
  exit 1
fi

repo_root="$(git rev-parse --show-toplevel)"
wt_root="${WT_ROOT:-$(cd "$repo_root/.." && pwd)/_wt}"
name="${issue}-${slug}"
branch="codex/${name}"
path="${wt_root}/${name}"

# Best-effort remote sync. If network is unstable, continue with local refs.
if ! git -C "$repo_root" fetch origin --prune >/dev/null 2>&1; then
  echo "Warning: 'git fetch origin' failed. Continue with local refs."
fi

if ! git -C "$repo_root" rev-parse --verify --quiet "${base_branch}^{commit}" >/dev/null; then
  echo "Error: base branch not found: $base_branch"
  echo "Tip: use an existing local branch, e.g. 'main'"
  exit 1
fi

if git -C "$repo_root" show-ref --verify --quiet "refs/heads/${branch}"; then
  echo "Error: local branch already exists: $branch"
  exit 1
fi

if [ -e "$path" ]; then
  echo "Error: target worktree path already exists: $path"
  exit 1
fi

mkdir -p "$wt_root"
git -C "$repo_root" worktree add --no-track -b "$branch" "$path" "$base_branch"

echo "Created worktree."
echo "  Branch: $branch"
echo "  Path:   $path"
echo "Next:"
echo "  cd \"$path\""
echo "  git push -u origin HEAD"
echo "Open this path in Codex as an independent thread."
