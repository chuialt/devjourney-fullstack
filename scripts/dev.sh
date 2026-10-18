#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ ! -x "$ROOT/backend/.venv/bin/python" || ! -d "$ROOT/frontend/node_modules" ]]; then
  echo "Dependencies are not installed. Run ./scripts/setup.sh first."
  exit 1
fi
cd "$ROOT/backend"
"$ROOT/backend/.venv/bin/python" manage.py runserver 127.0.0.1:8000 &
BACKEND_PID=$!
cleanup() { kill "$BACKEND_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM
cd "$ROOT/frontend"
npm run dev
