# Update code and restart Docker containers
Write-Host "Pulling latest code..." -ForegroundColor Cyan
git pull

Write-Host "`nUpdating submodules..." -ForegroundColor Cyan
git submodule update --init --recursive

Write-Host "`nPulling latest images..." -ForegroundColor Cyan
docker compose pull

Write-Host "`nStopping Docker containers..." -ForegroundColor Cyan
docker compose down

Write-Host "`nStarting Docker containers..." -ForegroundColor Cyan
docker compose up -d --pull never

Write-Host "`nCleaning up old honywen/adv-tavern images..." -ForegroundColor Cyan
docker images --filter "dangling=true" --format "{{.Repository}}:{{.ID}}" | Where-Object { $_ -like "honywen/adv-tavern:*" } | ForEach-Object { docker rmi $_.Split(':')[1] }

Write-Host "`nDone!" -ForegroundColor Green
