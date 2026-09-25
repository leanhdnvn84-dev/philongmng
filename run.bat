@echo off
REM Chay Phi Long Building Management System bang 1 lenh (Windows).
REM
REM   run.bat          che do phat trien  -> http://localhost:3000
REM   run.bat prod     build + chay production
REM   run.bat docker   build + chay bang Docker Compose
setlocal
cd /d "%~dp0"

set "MODE=%~1"
if "%MODE%"=="" set "MODE=dev"
if "%PORT%"=="" set "PORT=3000"

if not exist .env.local (
  echo ==^> Tao .env.local tu .env.local.example
  copy /y .env.local.example .env.local >nul || goto :error
)

if /i "%MODE%"=="docker" (
  where docker >nul 2>nul || (echo Loi: Chua cai Docker Desktop & goto :error)
  echo ==^> Build va chay bang Docker Compose
  docker compose --env-file .env.local up -d --build || goto :error
  echo ==^> Xong! Mo http://localhost:3000
  goto :eof
)

where node >nul 2>nul || (echo Loi: Chua cai Node.js 18+ tai https://nodejs.org & goto :error)

if not exist node_modules (
  echo ==^> Cai thu vien ^(npm ci^)
  call npm ci || goto :error
)

if /i "%MODE%"=="dev" (
  echo ==^> Chay che do phat trien tai http://localhost:%PORT%
  call npx next dev -p %PORT%
  goto :eof
)
if /i "%MODE%"=="prod" (
  echo ==^> Build production
  call npm run build || goto :error
  echo ==^> Chay production tai http://localhost:%PORT%
  call npx next start -p %PORT%
  goto :eof
)

echo Loi: Che do khong hop le: %MODE% ^(dung: dev ^| prod ^| docker^)

:error
pause
exit /b 1
