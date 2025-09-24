@echo off
echo ==================================================
echo   ABSEN GURU - NETWORK ACCESS
echo ==================================================
echo.
echo Detecting IP Address...

:: Get IP address using ipconfig and findstr
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set LOCAL_IP=%%b
        goto :found
    )
)

:found
if "%LOCAL_IP%"=="" (
    echo ERROR: Could not detect IP address
    echo Please run: ipconfig
    echo Then manually run: set ORIGIN=http://YOUR_IP:3000 ^&^& pnpm start
    pause
    exit /b 1
)

:: Remove leading spaces
set LOCAL_IP=%LOCAL_IP: =%

echo Detected IP Address: %LOCAL_IP%
echo.
echo Network URL: http://%LOCAL_IP%:3000
echo.
echo Starting server with network access...
echo Press Ctrl+C to stop
echo.

:: Set ORIGIN and start server
set ORIGIN=http://%LOCAL_IP%:3000
pnpm start