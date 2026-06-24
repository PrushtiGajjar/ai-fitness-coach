@echo off
echo ===================================================
echo       INITIALIZING AI FITNESS COACH SYSTEM
echo ===================================================
echo.

echo [1/2] Starting Python Backend Server...
start "AI Coach Backend (Port 8001)" cmd /k "cd backend && python main.py"

echo [2/2] Starting Next.js Frontend Server...
start "AI Coach Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are now starting up in separate windows!
echo Please wait about 5-10 seconds for them to load.
echo.
echo When ready, open your browser to:
echo http://localhost:3000
echo.
pause
