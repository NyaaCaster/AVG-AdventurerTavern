# 推送前的完整检查脚本 (PowerShell)

$ErrorActionPreference = "Stop"

Write-Host "🔍 开始推送前检查..." -ForegroundColor Cyan

# 1. 检查编码问题
Write-Host "`n📝 检查文件编码..." -ForegroundColor Yellow
try {
    npm run check-encoding
    Write-Host "✅ 编码检查通过" -ForegroundColor Green
} catch {
    Write-Host "❌ 发现编码问题" -ForegroundColor Red
    $response = Read-Host "是否自动修复？(y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        npm run fix-encoding
        Write-Host "✅ 编码问题已修复，请重新提交" -ForegroundColor Green
        exit 1
    } else {
        Write-Host "❌ 请手动修复编码问题" -ForegroundColor Red
        exit 1
    }
}

# 2. 类型检查
Write-Host "`n🔍 运行 TypeScript 类型检查..." -ForegroundColor Yellow
try {
    npm run lint
    Write-Host "✅ 类型检查通过" -ForegroundColor Green
} catch {
    Write-Host "❌ 类型检查失败" -ForegroundColor Red
    exit 1
}

# 3. 构建测试
Write-Host "`n🏗️  测试构建..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ 构建成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 构建失败" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ 所有检查通过，可以安全推送！" -ForegroundColor Green
</contents>