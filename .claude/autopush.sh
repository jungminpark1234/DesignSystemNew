#!/usr/bin/env bash
# Debounced auto commit + push for the design-system-demo repo.
# Invoked on every Claude Stop hook. Each call cancels the previous pending
# timer and starts a fresh one; when DELAY elapses with no new Stop (i.e. the
# user has been idle), it commits any WIP and pushes — but only on the target
# branch and only if the tree is dirty. Never force-pushes.
set -u

# 레포 위치가 머신마다 다르다 — 이 레포 안에 두기도 하고 형제 경로에 두기도 한다.
# launch.json 과 같은 후보 순서로 찾는다. AUTOPUSH_REPO 로 덮어쓸 수 있다.
if [ -z "${AUTOPUSH_REPO:-}" ]; then
  here="$(cd "$(dirname "$0")/.." && pwd)"
  for p in "$here/design-system-demo" "$here/../../design-system-demo" /d/design-system-demo; do
    [ -d "$p/.git" ] && { AUTOPUSH_REPO="$(cd "$p" && pwd)"; break; }
  done
fi
REPO="${AUTOPUSH_REPO:-}"
BRANCH="${AUTOPUSH_BRANCH:-feat/runway-prd-274-272-comments}"
DELAY="${AUTOPUSH_DELAY:-1800}"          # 30 min; override for testing
PIDFILE="$REPO/.git/claude-autopush.pid"

[ -d "$REPO/.git" ] || exit 0

# Cancel a previously scheduled timer, if still pending.
if [ -f "$PIDFILE" ]; then
  kill "$(cat "$PIDFILE" 2>/dev/null)" 2>/dev/null
fi

# Spawn a fresh detached timer.
nohup bash -c "
  sleep $DELAY
  cd '$REPO' 2>/dev/null || exit 0
  [ \"\$(git rev-parse --abbrev-ref HEAD 2>/dev/null)\" = '$BRANCH' ] || exit 0
  [ -z \"\$(git status --porcelain)\" ] && exit 0
  git add -A
  git commit -m \"chore(runway): WIP 자동 저장 \$(date '+%Y-%m-%d %H:%M')\" >/dev/null 2>&1
  git push >/dev/null 2>&1
" >/dev/null 2>&1 &

echo $! > "$PIDFILE"
exit 0
