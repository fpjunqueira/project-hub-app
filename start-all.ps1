# Start Project Hub - Backend service and Angular frontend
# Run this script from the project-hub-app directory

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$AngularDir = $ScriptDir
$ServiceDir = Join-Path $ScriptDir "..\..\java\project-hub-service"

Write-Host "Starting Project Hub..." -ForegroundColor Cyan
Write-Host ""

# Start backend in new PowerShell window
Write-Host "[1/2] Starting Project Hub Service (Spring Boot) on http://localhost:8080" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ServiceDir'; mvn spring-boot:run"

# Brief delay for backend to begin starting
Start-Sleep -Seconds 3

# Start frontend in new PowerShell window
Write-Host "[2/2] Starting Project Hub App (Angular) on http://localhost:4200" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$AngularDir'; npm start"

Write-Host ""
Write-Host "Both services are starting in separate windows." -ForegroundColor Yellow
Write-Host "  - Backend API:  http://localhost:8080"
Write-Host "  - Angular App:  http://localhost:4200"
Write-Host ""
