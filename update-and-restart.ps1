# Update code and restart client containers
Write-Host "Pulling latest code..." -ForegroundColor Cyan
git pull

Write-Host "`nUpdating submodules..." -ForegroundColor Cyan
git submodule update --init --recursive

Write-Host "`nPulling latest client image..." -ForegroundColor Cyan
docker compose pull

Write-Host "`nStopping client containers..." -ForegroundColor Cyan
docker compose down

Write-Host "`nStarting client containers..." -ForegroundColor Cyan
docker compose up -d

Write-Host "`nCleaning up old images..." -ForegroundColor Cyan
docker image prune -f

Write-Host "`nDone!" -ForegroundColor Green
Write-Host "`nNote: Database server and File server are managed independently." -ForegroundColor Yellow
Write-Host "  - Database: database-server/rebuild-and-restart.ps1" -ForegroundColor Yellow
Write-Host "  - File server: file-server/rebuild-and-restart.ps1" -ForegroundColor Yellow
