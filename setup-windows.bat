@echo off
chcp 65001 >nul
echo ==========================================
echo    🏫 Absen Guru v2.0.0
echo    Sistem Manajemen Absensi Guru
echo    Setup Script untuk Windows
echo ==========================================
echo.

echo 🚀 Memulai proses instalasi...
echo.

REM Check if Node.js is installed
echo 📋 Mengecek instalasi Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js tidak terinstall. 
    echo 📦 Silakan install Node.js 22+ dari https://nodejs.org
    echo    Rekomendasi: Node.js 22.x LTS
    pause
    exit /b 1
) else (
    echo ✅ Node.js terinstall
    for /f "tokens=*" %%i in ('node --version') do echo    Versi: %%i
)

REM Check if pnpm is installed
echo 📋 Mengecek instalasi pnpm...
pnpm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 pnpm tidak terinstall. Installing pnpm globally...
    npm install -g pnpm
    if %errorlevel% neq 0 (
        echo ❌ Gagal install pnpm. Jalankan sebagai Administrator atau install manual.
        pause
        exit /b 1
    )
) else (
    echo ✅ pnpm terinstall
    for /f "tokens=*" %%i in ('pnpm --version') do echo    Versi: %%i
)

REM Copy environment file
echo.
echo 📄 Menyiapkan konfigurasi environment...
if not exist .env (
    if exist .env.example (
        echo Membuat file environment...
        copy .env.example .env >nul
        echo ✅ File environment dibuat (.env)
        echo ⚠️  Silakan edit file .env sesuai kebutuhan
    ) else (
        echo Membuat file .env default...
        echo # Absen Guru Configuration > .env
        echo. >> .env
        echo # Database >> .env
        echo DATABASE_URL="file:./absen.db" >> .env
        echo. >> .env
        echo # Session Secret (change in production) >> .env
        echo SESSION_SECRET="your-super-secret-key-change-this" >> .env
        echo. >> .env
        echo ✅ File .env default dibuat
        echo ⚠️  Silakan edit file .env untuk production
    )
) else (
    echo ✅ File environment sudah ada
)

echo.
echo 🔽 Installing dependencies dengan pnpm...
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
    echo ❌ Gagal install dependencies
    echo    Coba jalankan: npm install -g node-gyp
    echo    Atau install Visual Studio Build Tools
    pause
    exit /b 1
) else (
    echo ✅ Dependencies berhasil diinstall
)

echo.
echo �️ Menyiapkan database...
pnpm run db:push
if %errorlevel% neq 0 (
    echo ❌ Gagal setup database
    pause
    exit /b 1
) else (
    echo ✅ Database schema berhasil dibuat
)

echo.
echo 🌱 Menambahkan data awal...
pnpm run db:seed
if %errorlevel% neq 0 (
    echo ❌ Gagal menambahkan data awal
    pause
    exit /b 1
) else (
    echo ✅ Data awal berhasil ditambahkan
)

echo.
echo 🔨 Building aplikasi...
pnpm run build
if %errorlevel% neq 0 (
    echo ❌ Build gagal. Silakan cek error di atas.
    pause
    exit /b 1
) else (
    echo ✅ Build berhasil
)

echo.
echo 🎉 Setup berhasil diselesaikan!
echo.
echo 🚀 Untuk menjalankan aplikasi:
echo.
echo    Mode Development (dengan hot reload):
echo      pnpm dev
echo.
echo    Mode Production:
echo      pnpm start
echo.
echo    Preview aplikasi yang sudah di-build:
echo      pnpm preview
echo.
echo 🌐 Aplikasi akan tersedia di:
echo      http://localhost:5173 (development)
echo      http://localhost:4173 (preview)
echo      http://localhost:3000 (production)
echo.
echo 👤 Login default:
echo      Username: admin
echo      Password: admin123
echo.
echo � PWA Support:
echo      - Install sebagai app di mobile/desktop
echo      - Bekerja offline (terbatas)
echo      - Auto-update otomatis
echo.
echo �📖 Baca FIRST_INSTALL.md untuk panduan lengkap
echo.
pause
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