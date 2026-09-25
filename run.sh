#!/usr/bin/env bash
# Chạy Phi Long Building Management System bằng 1 lệnh.
#
#   ./run.sh          # chế độ phát triển (npm run dev)   -> http://localhost:3000
#   ./run.sh prod     # build + chạy production (npm start)
#   ./run.sh docker   # build + chạy bằng Docker Compose
#
# Cổng mặc định 3000, đổi bằng: PORT=8080 ./run.sh
set -euo pipefail

cd "$(dirname "$0")"

MODE="${1:-dev}"
PORT="${PORT:-3000}"

info()  { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
fail()  { printf '\033[1;31mLỗi:\033[0m %s\n' "$*" >&2; exit 1; }

# 1. File môi trường
if [ ! -f .env.local ]; then
  [ -f .env.local.example ] || fail "Không tìm thấy .env.local.example"
  info "Tạo .env.local từ .env.local.example"
  cp .env.local.example .env.local
fi

if [ "$MODE" = "docker" ]; then
  command -v docker >/dev/null 2>&1 || fail "Chưa cài Docker: https://docs.docker.com/get-docker/"
  info "Build và chạy bằng Docker Compose (cổng 3000)"
  docker compose --env-file .env.local up -d --build
  info "Xong! Mở http://localhost:3000  (xem log: docker compose logs -f)"
  exit 0
fi

# 2. Kiểm tra Node.js >= 18
command -v node >/dev/null 2>&1 || fail "Chưa cài Node.js 18+: https://nodejs.org"
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 18 ] || fail "Cần Node.js 18+, đang có $(node -v)"

# 3. Cài thư viện (chỉ khi chưa có hoặc package-lock.json thay đổi)
if [ ! -d node_modules ] || [ package-lock.json -nt node_modules ]; then
  info "Cài thư viện (npm ci)"
  npm ci
  touch node_modules
fi

# 4. Chạy
case "$MODE" in
  dev)
    info "Chạy chế độ phát triển tại http://localhost:$PORT"
    exec npx next dev -p "$PORT"
    ;;
  prod)
    info "Build production"
    npm run build
    info "Chạy production tại http://localhost:$PORT"
    exec npx next start -p "$PORT"
    ;;
  *)
    fail "Chế độ không hợp lệ: $MODE (dùng: dev | prod | docker)"
    ;;
esac
