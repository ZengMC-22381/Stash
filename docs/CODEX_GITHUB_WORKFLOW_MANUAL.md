# Codex + GitHub Engineering Manual

This project uses `GitHub Flow + Codex Worktree`.

## 0. New Thread Context Bootstrap (Recommended)
To reduce context-window cost on each new thread, use modular context docs:

```bash
./scripts/context-read.sh --list
./scripts/context-read.sh core <module-1> <module-2>
```

Example:
```bash
./scripts/context-read.sh core frontend-homepage architecture
```

Context docs entry:
- `docs/context/README.md`

## 1. Team Rules (Must Follow)
- `main` is always releasable.
- Never push directly to `main`.
- One issue maps to one branch and one PR.
- Branch naming must be `codex/<issue>-<slug>`.
- Every branch should be developed in its own worktree directory.
- Merge strategy is `Squash and merge`.

## 2. One-Time Setup (Already Prepared)
- PR template: `.github/pull_request_template.md`
- Issue templates:
  - `.github/ISSUE_TEMPLATE/feature_request.md`
  - `.github/ISSUE_TEMPLATE/bug_report.md`
- PR guard workflow: `.github/workflows/pr-guard.yml`
- Worktree scripts:
  - `scripts/wt-new.sh`
  - `scripts/wt-list.sh`
  - `scripts/wt-sync.sh`
  - `scripts/wt-clean.sh`

## 3. Daily Operating Procedure
1. Create an Issue in GitHub.
2. Copy issue number and create worktree:
   ```bash
   ./scripts/wt-new.sh 128 login-page
   ```
3. Open generated worktree path in Codex as a new thread.
4. Develop and commit in that worktree:
   ```bash
   cd ../_wt/128-login-page
   git add -A
   git commit -m "feat: add login page"
   git push -u origin codex/128-login-page
   ```
5. Open a PR to `main` and fill checklist.
6. Wait for `PR Guard` check and review approval.
7. Merge with `Squash and merge`.
8. Clean local worktree:
   ```bash
   cd /Users/zeng.m.c/Documents/Stash
   ./scripts/wt-clean.sh 128-login-page
   ```

## 4. Multi-Thread Collaboration (Parallel Work)
- Thread A works on `codex/201-auth`.
- Thread B works on `codex/202-home-feed`.
- They are isolated by worktree, so local files do not conflict.
- Integration happens only through PR merges.

## 5. Keep Branch Updated With Main
When a PR is open for more than one day, sync once:
```bash
./scripts/wt-sync.sh 128-login-page
```

If conflict happens:
```bash
cd ../_wt/128-login-page
git status
# resolve conflict files
git add -A
git commit -m "chore: resolve merge conflict"
git push
```

## 6. PM Checklist
- Every requirement has an issue number.
- Every issue has exactly one active PR.
- PR title and checklist are complete.
- No PR contains unrelated changes.
- PR size should stay reviewable (prefer < 500 lines changed).

## 7. Naming Conventions
- Branch: `codex/<issue>-<slug>`
  - Example: `codex/128-login-page`
- Commit:
  - `feat: ...`
  - `fix: ...`
  - `chore: ...`

## 8. Common Commands
List worktrees:
```bash
./scripts/wt-list.sh
```

Check current git status:
```bash
git status -sb
```

View branch graph:
```bash
git log --oneline --decorate --graph -20
```
