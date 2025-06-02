@echo off
echo 🚀 Starting forced build (ignoring errors)...

REM Set environment variables to ignore errors
set CI=false
set NEXT_TELEMETRY_DISABLED=1

echo 📦 Running pnpm build:ignore-errors...
pnpm run build:ignore-errors

if %errorlevel% equ 0 (
    echo ✅ Build completed successfully!
) else (
    echo ⚠️  Build completed with warnings/errors (ignored)
)

echo 🎉 Force build process completed!
pause