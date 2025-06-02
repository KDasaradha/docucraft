#!/usr/bin/env pwsh
# PowerShell script to force build ignoring errors

Write-Host "🚀 Starting forced build (ignoring errors)..." -ForegroundColor Green

# Set environment variables to ignore errors
$env:CI = "false"
$env:NEXT_TELEMETRY_DISABLED = "1"

try {
    Write-Host "📦 Running pnpm build:ignore-errors..." -ForegroundColor Yellow
    pnpm run build:ignore-errors
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Build completed with warnings/errors (ignored)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Build process encountered issues but continuing..." -ForegroundColor Yellow
}

Write-Host "🎉 Force build process completed!" -ForegroundColor Green