@echo off
echo ========================================
echo    Starting GlowBridge Development
echo ========================================
echo.

REM Check if we're in the correct directory
if not exist "frontend" (
    echo Error: frontend folder not found!
    echo Please run this script from the GlowBridge root directory.
    pause
    exit /b 1
)

if not exist "backend" (
    echo Error: backend folder not found!
    echo Please run this script from the GlowBridge root directory.
    pause
    exit /b 1
)

echo Starting Backend Server...
echo.
start "GlowBridge Backend" cmd /k "cd backend && npm run dev"

echo Waiting 3 seconds before starting frontend...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
echo.
start "GlowBridge Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo  Both servers are starting up!
echo ========================================
echo  Backend:  Check "GlowBridge Backend" window
echo  Frontend: Check "GlowBridge Frontend" window
echo.
echo  Backend will be available at: http://localhost:5000
echo  Frontend will be available at: http://localhost:3000
echo.
echo  Press any key to exit this launcher...
echo ========================================
pause > nul