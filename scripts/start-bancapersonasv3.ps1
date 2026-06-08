Write-Host "=== BancaPersonasV3 ===" -ForegroundColor Yellow
Write-Host "Abriendo backend y frontend en terminales separadas..." -ForegroundColor Gray

$root = $PSScriptRoot

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend\bancapersonasv3'; Write-Host 'Backend iniciando...' -ForegroundColor Cyan; mvn spring-boot:run"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend\bancapersonasv3'; Write-Host 'Frontend iniciando...' -ForegroundColor Green; npx ng serve --open"

Write-Host ""
Write-Host "  Backend  -> http://localhost:8080" -ForegroundColor Cyan
Write-Host "  Frontend -> http://localhost:4200" -ForegroundColor Green
Write-Host ""
Write-Host "Cierra las dos ventanas para detener la aplicacion." -ForegroundColor Gray
