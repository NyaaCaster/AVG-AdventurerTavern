# Rebuild and restart database server containers
Write-Host "Stopping database containers..." -ForegroundColor Cyan
docker compose down

Write-Host "`nRebuilding and starting database containers..." -ForegroundColor Cyan
docker compose up -d --build

Write-Host "`nDone!" -ForegroundColor Green