@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 22.13 or newer, then try again.
  pause
  exit /b 1
)
if not exist "node_modules\next\dist\bin\next" (
  echo Installing Pinspace dependencies...
  call npm ci --include=dev --include=optional --no-audit --no-fund
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo.


echo.
node scripts/local.mjs dev
pause


