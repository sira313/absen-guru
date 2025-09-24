@echo off
chcp 65001 >nul
echo ==========================================
echo    🏫 Absen Guru v2.0.0 - Production Ready
echo    Sistem Manajemen Absensi Guru dengan PWA
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
    echo 📦 Silakan install Node.js v22.19.0 LTS dari https://nodejs.org
    echo    📌 Rekomendasi: Node.js v22.x LTS (latest)
    echo    🔗 Direct link: https://nodejs.org/en/blog/release/v22.19.0
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
    echo 📦 pnpm tidak terinstall. Installing pnpm v9.12+ globally...
    echo 🔧 Menggunakan npm untuk install pnpm terbaru...
    npm install -g pnpm@latest
    if %errorlevel% neq 0 (
        echo ❌ Gagal install pnpm via npm. Mencoba Corepack...
        corepack enable pnpm
        corepack use pnpm@latest
        if %errorlevel% neq 0 (
            echo ❌ Gagal install pnpm. Jalankan sebagai Administrator atau install manual.
            echo 🔗 Guide: https://pnpm.io/installation
            pause
            exit /b 1
        )
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
        echo ⚠️  Silakan edit file .env sesuai kebutuhan production
    ) else (
        echo Membuat file .env default universal...
        echo # Absen Guru Configuration > .env
        echo. >> .env
        echo # Database Configuration >> .env
        echo DATABASE_URL="file:./absen.db" >> .env
        echo DB_FILE_NAME=file:absen.db >> .env
        echo. >> .env
        echo # Server Configuration >> .env  
        echo PORT=3000 >> .env
        echo HOST=0.0.0.0 >> .env
        echo. >> .env
        echo # Optional: Timezone >> .env
        echo TZ=Asia/Jakarta >> .env
        echo. >> .env
        echo # NOTE: NODE_ENV dan ORIGIN harus di-set via command line >> .env
        echo # Contoh: set NODE_ENV=production ^&^& set ORIGIN=https://yourdomain.com ^&^& pnpm start >> .env
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
echo 🚀 Pilih cara menjalankan aplikasi:
echo.
echo 1️⃣  Development Mode (localhost + hot reload):
echo      pnpm dev
echo      → http://localhost:5173
echo.
echo 2️⃣  Network Access (untuk akses mobile/tablet):
echo      start-network.bat
echo      → Auto-detect IP dan start server
echo.
echo 3️⃣  Manual Network Setup:
echo      ipconfig
echo      set ORIGIN=http://YOUR_IP:3000 ^&^& pnpm start
echo      → Ganti YOUR_IP dengan IP dari ipconfig
echo.
echo 4️⃣  Production Mode:
echo      set NODE_ENV=production ^&^& set ORIGIN=https://yourdomain.com ^&^& pnpm start
echo      → Untuk deployment server
echo.
echo 👤 Login default:
echo      Username: admin
echo      Password: admin123
echo.
echo 📖 Dokumentasi lengkap:
echo      - README.md - Setup dan usage guide
echo      - NETWORK_SETUP.md - Network troubleshooting
echo      - FIRST_INSTALL.md - Panduan instalasi detail
echo.
echo ⚠️  Penting untuk Network Access:
echo      1. Jalankan start-network.bat untuk auto-setup
echo      2. Buka port 3000 di Windows Firewall
echo      3. Pastikan device di WiFi yang sama
echo.
echo � Tech Stack:
echo      - Frontend: SvelteKit + TailwindCSS v4 + DaisyUI 5.1.14
echo      - Database: SQLite dengan Drizzle ORM
echo      - Auth: Custom session management
echo      - PWA: Install di mobile/desktop
echo.
pause