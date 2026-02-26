# Rebuild and restart database server containers
Write-Host "Stopping database containers..." -ForegroundColor Cyan
docker compose down

Write-Host "`nRebuilding and starting database containers..." -ForegroundColor Cyan
docker compose up -d --build

Write-Host "`nCleaning up old adventurertavern-database images..." -ForegroundColor Cyan
docker images --filter "dangling=true" --filter "label=com.docker.compose.project=database-server" --format "{{.ID}}" | ForEach-Object { docker rmi $_ }

Write-Host "`nDone!" -ForegroundColor Green