@echo off
:: Start Project Hub - Backend service and Angular frontend
:: Run this script from the project-hub-app directory

set SCRIPT_DIR=%~dp0
set ANGULAR_DIR=%SCRIPT_DIR%
set SERVICE_DIR=%SCRIPT_DIR%..\..\java\project-hub-service

echo Starting Project Hub...
echo.
echo [1/2] Starting Project Hub Service (Spring Boot) on http://localhost:8080
start "Project Hub Service" cmd /k "cd /d "%SERVICE_DIR%" && mvn spring-boot:run"

:: Wait a few seconds for the backend to begin starting
timeout /t 3 /nobreak >nul

echo [2/2] Starting Project Hub App (Angular) on http://localhost:4200
start "Project Hub App" cmd /k "cd /d "%ANGULAR_DIR%" && npm start"

echo.
echo Both services are starting in separate windows.
echo - Backend API:  http://localhost:8080
echo - Angular App:  http://localhost:4200
echo.
pause
