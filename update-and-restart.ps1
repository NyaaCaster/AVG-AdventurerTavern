# Update code and restart Docker containers
Write-Host "Pulling latest code..." -ForegroundColor Cyan
git pull

Write-Host "`nPulling latest images..." -ForegroundColor Cyan
docker compose pull

Write-Host "`nStopping Docker containers..." -ForegroundColor Cyan
docker compose down

Write-Host "`nStarting Docker containers..." -ForegroundColor Cyan
docker compose up -d

Write-Host "`nDone!" -ForegroundColor Green
