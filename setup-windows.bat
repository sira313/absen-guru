@echo off
echo ==========================================
echo    Absen Guru - Teacher Attendance System
echo    Setup Script for Windows
echo ==========================================
echo.

REM Check if Node.js is installed
echo 📋 Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. 
    echo 📦 Please install Node.js 18+ from https://nodejs.org
    echo    Recommended: Node.js 20.x LTS
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
    node --version
)

REM Check if pnpm is installed
echo 📋 Checking pnpm installation...
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 pnpm is not installed. Installing pnpm globally...
    npm install -g pnpm
    if %errorlevel% neq 0 (
        echo ❌ Failed to install pnpm. Please run as Administrator or install manually.
        pause
        exit /b 1
    )
) else (
    echo ✅ pnpm is installed
    pnpm --version
)

REM Copy environment file
echo 📄 Setting up environment configuration...
if not exist .env (
    echo Creating environment file...
    copy .env.example .env >nul
    echo ✅ Environment file created (.env)
    echo ⚠️  Please edit .env file with your settings
) else (
    echo ✅ Environment file already exists
)

echo.
echo 🔽 Installing dependencies with pnpm...
echo    This includes:
echo    - SvelteKit framework
echo    - TailwindCSS v4 with DaisyUI 5.1.13
echo    - Lucide Svelte (Feather icons)
echo    - SQLite database with better-sqlite3
echo    - Authentication and session management
echo.

REM Install dependencies
pnpm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    echo    Try running: npm install -g node-gyp
    echo    Or install Visual Studio Build Tools
    pause
    exit /b 1
)

REM Create data directory
echo 📁 Creating data directory...
if not exist data mkdir data

REM Initialize database if not exists
if not exist absen.db (
    echo 🗄️ SQLite database will be created on first run...
)

REM Build application
echo 🔨 Building application...
pnpm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed. Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 🚀 To start the application:
echo.
echo    Development mode (with hot reload):
echo      pnpm dev
echo.
echo    Production mode:
echo      pnpm start
echo.
echo    Preview built application:
echo      pnpm preview
echo.
echo 🌐 Application will be available at:
echo      http://localhost:5173 (development)
echo      http://localhost:3000 (production)
echo      http://localhost:4173 (preview)
echo.
echo ⚠️  Important next steps:
echo      1. Edit .env file with proper database and JWT settings
echo      2. Create the first admin user via the web interface
echo      3. Configure Windows Defender/firewall if needed
echo.
echo 📚 Tech Stack:
echo      - Frontend: SvelteKit + TailwindCSS v4 + DaisyUI 5.1.13
echo      - Icons: Lucide Svelte (Feather icons)
echo      - Database: SQLite with better-sqlite3
echo      - Authentication: JWT with secure sessions
echo.
echo 💡 Troubleshooting:
echo      - If build fails, install Visual Studio Build Tools
echo      - Run Windows PowerShell as Administrator if needed
echo      - Check Windows Defender isn't blocking Node.js
echo.
pause