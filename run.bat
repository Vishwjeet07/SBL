@echo off
title Library Management System - Service Runner
color 0A
cls

echo ================================================================
echo    LIBRARY MANAGEMENT SYSTEM (LMS) - FULL STACK RUNNER
echo ================================================================
echo.
echo  [1/3] Starting Payment Gateway Server on Port 3000...
start "LMS Payment Gateway (Port 3000)" cmd /k "title LMS Payment Gateway && cd /d "%~dp0" && node payment-gateway/server.js"

timeout /t 2 >nul

echo  [2/3] Starting Backend & JWT Authentication Server on Port 5000...
start "LMS Backend & JWT Auth (Port 5000)" cmd /k "title LMS Backend & JWT Auth && cd /d "%~dp0backend" && node server.js"

timeout /t 2 >nul

echo  [3/3] Starting React Frontend Web App on Port 5173...
start "LMS Frontend Vite (Port 5173)" cmd /k "title LMS React Frontend && cd /d "%~dp0" && npm run dev"

timeout /t 3 >nul

echo.
echo ================================================================
echo    ALL SERVICES ARE LAUNCHED SUCCESSFULLY!
echo ================================================================
echo.
echo  - Frontend Webpage:       http://localhost:5173
echo  - JWT Backend Server:     http://localhost:5000
echo  - Payment Gateway Server: http://localhost:3000
echo.
echo  Demo Credentials:
echo    Email:    demo@library.com
echo    Password: 123456
echo.
echo  Opening browser in 2 seconds...
timeout /t 2 >nul
start http://localhost:5173

echo.
echo Press any key to close this launcher window (services keep running)...
pause >nul
