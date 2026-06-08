Write-Host "=== Iniciando Backend (Spring Boot - BancaPersonasV3) ===" -ForegroundColor Cyan
Set-Location "$PSScriptRoot\..\..\apps\backend\bancapersonasv3"
mvn spring-boot:run
