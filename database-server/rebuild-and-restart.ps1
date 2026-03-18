# Rebuild and restart database server containers
# 使用 -p 参数明确指定项目名称，避免与主项目冲突
# 使用 -f 参数明确指定配置文件路径

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectName = "database-server"
$ComposeFile = Join-Path $ScriptDir "docker-compose.yml"

Write-Host "Stopping database containers..." -ForegroundColor Cyan
docker compose -p $ProjectName -f $ComposeFile down

Write-Host "`nRebuilding and starting database containers..." -ForegroundColor Cyan
docker compose -p $ProjectName -f $ComposeFile up -d --build

Write-Host "`nCleaning up old adventurertavern-database images..." -ForegroundColor Cyan
docker images --filter "dangling=true" --filter "label=com.docker.compose.project=$ProjectName" --format "{{.ID}}" | ForEach-Object { docker rmi $_ }

Write-Host "`nDone!" -ForegroundColor Green
