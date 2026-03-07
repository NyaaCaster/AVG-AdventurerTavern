# 数据库备份脚本
# 按时间戳格式备份数据库文件

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$dbPath = Join-Path $scriptDir "data\database.sqlite"

# 检查数据库文件是否存在
if (-not (Test-Path $dbPath)) {
    Write-Error "错误: 数据库文件不存在 - $dbPath"
    exit 1
}

# 生成时间戳格式: YYMMDDHHMMSS
$timestamp = Get-Date -Format "yyMMddHHmmss"
$backupName = "database_$timestamp.sqlite.bak"
$backupPath = Join-Path $scriptDir "data\$backupName"

# 执行备份
try {
    Copy-Item $dbPath $backupPath
    $fileSize = (Get-Item $backupPath).Length / 1KB
    Write-Host "✓ 数据库备份成功!" -ForegroundColor Green
    Write-Host "  备份文件: $backupName"
    Write-Host "  文件大小: $([math]::Round($fileSize, 2)) KB"
    Write-Host "  备份时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
} catch {
    Write-Error "备份失败: $_"
    exit 1
}
