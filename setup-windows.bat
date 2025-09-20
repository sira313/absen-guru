@echo off
echo Setting up Absen Guru Application for Windows...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo pnpm is not installed. Installing pnpm globally...
    npm install -g pnpm
)

REM Copy environment file
if not exist .env (
    echo Creating environment file...
    copy .env.example .env
    echo Please edit .env file with your settings
)

REM Install dependencies
echo Installing dependencies with pnpm...
pnpm install

REM Create data directory
echo Creating data directory...
if not exist data mkdir data

REM Build application
echo Building application...
pnpm run build

echo.
echo Setup completed!
echo.
echo To start the application in development:
echo   pnpm dev
echo.
echo To start the application in production:
echo   pnpm start
echo.
echo Application will be available at http://localhost:3000
echo.
echo Don't forget to:
echo   1. Edit .env file with proper settings
echo   2. Create the first admin user
echo.
pause