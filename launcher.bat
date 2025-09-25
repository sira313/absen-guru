@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                  🏠 ABSEN-GURU LAUNCHER                 ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo Pilih mode deployment:
echo.
echo [1] 🖥️  Local Development (localhost:5174)
echo [2] 🌐 Local Network (IP Address + Production)  
echo [3] 🔄 PM2 Local Production (Recommended)
echo [4] 🔄 PM2 Network Production (Best for 24/7)
echo [5] ☁️  Cloudflare Tunnel (Public Internet)
echo [6] 🔧 Setup Database Only
echo [7] �️  Reset Database (Fresh Start)
echo [8] �📊 PM2 Management (Status/Logs/Stop)
echo [0] ❌ Exit
echo.
set /p choice=Masukkan pilihan (0-7): 

if "%choice%"=="0" goto :exit
if "%choice%"=="1" goto :local_dev
if "%choice%"=="2" goto :network_prod
if "%choice%"=="3" goto :pm2_local
if "%choice%"=="4" goto :pm2_network
if "%choice%"=="5" goto :cloudflare
if "%choice%"=="6" goto :setup_db
if "%choice%"=="7" goto :reset_db
if "%choice%"=="8" goto :pm2_management

echo ❌ Pilihan tidak valid!
pause
goto :start

:local_dev
echo.
echo ========================================
echo 🖥️  STARTING LOCAL DEVELOPMENT
echo ========================================
echo.
echo [1/4] Installing dependencies...
call pnpm install
if %ERRORLEVEL% neq 0 goto :error

echo [2/4] Checking database...
if not exist "absen.db" (
    echo Database not found, creating fresh database...
    call pnpm db:push
    call pnpm db:seed
) else (
    echo ✅ Database exists, skipping setup
)

echo [3/4] Starting development server...
echo.
echo ✅ Server akan berjalan di: http://localhost:5174
echo 📝 Tekan Ctrl+C untuk stop
echo.
call pnpm dev --port 5174
goto :end

:network_prod
echo.
echo ========================================
echo 🌐 STARTING LOCAL NETWORK PRODUCTION
echo ========================================
echo.

echo [1/5] Detecting IP address...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1" %%j in ("%%i") do (
        set TEMP_IP=%%j
        set TEMP_IP=!TEMP_IP: =!
        
        rem Check if it's a private network IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        echo !TEMP_IP! | findstr /r "^192\.168\." >nul && set LOCAL_IP=!TEMP_IP! && goto :ip_found
        echo !TEMP_IP! | findstr /r "^10\." >nul && set LOCAL_IP=!TEMP_IP! && goto :ip_found
        echo !TEMP_IP! | findstr /r "^172\.1[6-9]\." >nul && set LOCAL_IP=!TEMP_IP! && goto :ip_found
        echo !TEMP_IP! | findstr /r "^172\.2[0-9]\." >nul && set LOCAL_IP=!TEMP_IP! && goto :ip_found
        echo !TEMP_IP! | findstr /r "^172\.3[0-1]\." >nul && set LOCAL_IP=!TEMP_IP! && goto :ip_found
    )
)
:ip_found

if "!LOCAL_IP!"=="" (
    echo ❌ Could not detect private network IP, using localhost
    set LOCAL_IP=127.0.0.1
)

set ORIGIN=http://!LOCAL_IP!:3000
echo ✅ IP detected: !LOCAL_IP!
echo ✅ ORIGIN: !ORIGIN!
echo.

echo [2/5] Installing dependencies...
call pnpm install
if %ERRORLEVEL% neq 0 goto :error

echo [3/5] Checking database...
if not exist "absen.db" (
    echo Database not found, creating fresh database...
    call pnpm db:push
    call pnpm db:seed
) else (
    echo ✅ Database exists, skipping setup
)

echo [4/5] Building application...
call pnpm build
if %ERRORLEVEL% neq 0 goto :error

echo [5/5] Starting production server...
echo.
echo ✅ Server berjalan di: !ORIGIN!
echo 📱 Akses dari device lain: !ORIGIN!
echo 📝 Tekan Ctrl+C untuk stop
echo.

set NODE_ENV=production
call pnpm start
goto :end

:pm2_local
echo.
echo ========================================
echo 🔄 STARTING PM2 LOCAL PRODUCTION
echo ========================================
echo.

where pm2 >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ PM2 tidak ditemukan!
    echo 📦 Installing PM2 globally...
    call npm install -g pm2
    if %ERRORLEVEL% neq 0 goto :error
)

echo [1/4] Installing dependencies...
call pnpm install
if %ERRORLEVEL% neq 0 goto :error

echo [2/4] Checking database...
if not exist "absen.db" (
    echo Database not found, creating fresh database...
    call pnpm db:push
    call pnpm db:seed
) else (
    echo ✅ Database exists, skipping setup
)

echo [3/4] Building application...
call pnpm build
if %ERRORLEVEL% neq 0 goto :error

echo [4/4] Starting with PM2...
call pm2 stop absen-guru 2>nul
call pm2 delete absen-guru 2>nul
call pnpm pm2:start

echo.
echo ✅ Server berjalan di: http://localhost:3000
echo 📊 Monitor dengan: pm2 monit
echo 📝 Logs dengan: pm2 logs
echo 📋 Gunakan opsi [7] untuk PM2 management
echo.
pause
goto :start

:pm2_network
echo.
echo ========================================
echo 🔄 STARTING PM2 NETWORK PRODUCTION
echo ========================================
echo.

where pm2 >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ PM2 tidak ditemukan!
    echo 📦 Installing PM2 globally...
    call npm install -g pm2
    if %ERRORLEVEL% neq 0 goto :error
)

echo [1/5] Detecting IP address...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1" %%j in ("%%i") do (
        set TEMP_IP=%%j
        set TEMP_IP=!TEMP_IP: =!
        
        rem Check if it's a private network IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        echo !TEMP_IP! | findstr /r "^192\.168\." >nul && set LOCAL_IP=!TEMP_IP! && goto :ip_found2
        echo !TEMP_IP! | findstr /r "^10\." >nul && set LOCAL_IP=!TEMP_IP! && goto :ip_found2
        echo !TEMP_IP! | findstr /r "^172\.1[6-9]\." >nul && set LOCAL_IP=!TEMP_IP! && goto :ip_found2
        echo !TEMP_IP! | findstr /r "^172\.2[0-9]\." >nul && set LOCAL_IP=!TEMP_IP! && goto :ip_found2
        echo !TEMP_IP! | findstr /r "^172\.3[0-1]\." >nul && set LOCAL_IP=!TEMP_IP! && goto :ip_found2
    )
)
:ip_found2

if "!LOCAL_IP!"=="" (
    echo ❌ Could not detect private network IP, using localhost
    set LOCAL_IP=127.0.0.1
)

set ORIGIN=http://!LOCAL_IP!:3000
echo ✅ IP detected: !LOCAL_IP!
echo ✅ ORIGIN: !ORIGIN!
echo.

echo [2/5] Installing dependencies...
call pnpm install
if %ERRORLEVEL% neq 0 goto :error

echo [3/5] Checking database...
if not exist "absen.db" (
    echo Database not found, creating fresh database...
    call pnpm db:push
    call pnpm db:seed
) else (
    echo ✅ Database exists, skipping setup
)

echo [4/5] Building application...
call pnpm build
if %ERRORLEVEL% neq 0 goto :error

echo [5/5] Starting with PM2...
call pm2 stop absen-guru 2>nul
call pm2 delete absen-guru 2>nul
call pnpm pm2:start:network

echo.
echo ✅ Server berjalan di: !ORIGIN!
echo 📱 Akses dari device lain: !ORIGIN!
echo 📊 Monitor dengan: pm2 monit
echo 📝 Logs dengan: pm2 logs
echo 📋 Gunakan opsi [7] untuk PM2 management
echo.
pause
goto :start

:reset_db
echo.
echo ========================================
echo 🗑️  RESET DATABASE (FRESH START)
echo ========================================
echo.

echo ⚠️  This will DELETE all existing data!
echo All users, attendance records, and settings will be lost.
echo.
set /p confirm=Are you sure? Type 'yes' to continue: 

if not "%confirm%"=="yes" (
    echo Reset cancelled.
    pause
    goto :start
)

echo [1/4] Installing dependencies...
call pnpm install
if %ERRORLEVEL% neq 0 goto :error

echo [2/4] Removing old database...
if exist "absen.db" del /f "absen.db"
echo ✅ Old database removed

echo [3/4] Creating fresh database schema...
call pnpm db:push

echo [4/4] Seeding fresh data...
call pnpm db:seed

echo.
echo ✅ Database reset completed!
echo ✅ Fresh database with default admin user created
echo 📝 Default login: admin / admin
echo.
pause
goto :start

:pm2_management
echo.
echo ========================================
echo 📊 PM2 MANAGEMENT
echo ========================================
echo.

where pm2 >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ PM2 tidak ditemukan!
    pause
    goto :start
)

echo Pilih aksi PM2:
echo.
echo [1] 📊 Status (pm2 status)
echo [2] 📝 Logs (pm2 logs)
echo [3] 📈 Monitor (pm2 monit)
echo [4] 🔄 Restart (pm2 restart)
echo [5] ⏹️  Stop (pm2 stop)
echo [6] 🗑️  Delete (pm2 delete)
echo [7] 💾 Save Config (pm2 save)
echo [8] 🚀 Startup Script (pm2 startup)
echo [0] ← Back to main menu
echo.
set /p pm2_choice=Masukkan pilihan (0-8): 

if "%pm2_choice%"=="1" (
    echo.
    call pm2 status
    echo.
    pause
    goto :pm2_management
)
if "%pm2_choice%"=="2" (
    echo.
    echo 📝 Showing logs (Ctrl+C to exit)...
    call pm2 logs
    goto :pm2_management
)
if "%pm2_choice%"=="3" (
    echo.
    echo 📈 Opening monitor (q to quit)...
    call pm2 monit
    goto :pm2_management
)
if "%pm2_choice%"=="4" (
    echo.
    call pm2 restart absen-guru
    echo ✅ Application restarted!
    pause
    goto :pm2_management
)
if "%pm2_choice%"=="5" (
    echo.
    call pm2 stop absen-guru
    echo ✅ Application stopped!
    pause
    goto :pm2_management
)
if "%pm2_choice%"=="6" (
    echo.
    call pm2 stop absen-guru 2>nul
    call pm2 delete absen-guru 2>nul
    echo ✅ Application deleted from PM2!
    pause
    goto :pm2_management
)
if "%pm2_choice%"=="7" (
    echo.
    call pm2 save
    echo ✅ PM2 configuration saved!
    pause
    goto :pm2_management
)
if "%pm2_choice%"=="8" (
    echo.
    echo 🚀 Setting up PM2 startup script...
    call pm2 startup
    echo.
    echo ⚠️  Jalankan command yang ditampilkan di atas sebagai Administrator
    pause
    goto :pm2_management
)
if "%pm2_choice%"=="0" goto :start

echo ❌ Pilihan tidak valid!
pause
goto :pm2_management

:cloudflare
echo.
echo ========================================
echo ☁️  CLOUDFLARE TUNNEL SETUP
echo ========================================
echo.

where cloudflared >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ cloudflared tidak ditemukan!
    echo.
    echo 📥 Download dari: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
    echo.
    pause
    goto :start
)

echo [1/3] Installing dependencies & Building...
call pnpm install
call pnpm build
if %ERRORLEVEL% neq 0 goto :error

echo [2/3] Starting production server in background...
start /B pnpm start

timeout /t 3 /nobreak >nul

echo [3/3] Starting Cloudflare tunnel...
echo.
echo ✅ Tunnel akan dimulai, ikuti instruksi cloudflare
echo 🌐 Aplikasi akan dapat diakses dari internet
echo.
cloudflared tunnel --url localhost:3000
goto :end

:setup_db
echo.
echo ========================================
echo 🔧 DATABASE SETUP ONLY
echo ========================================
echo.

echo [1/3] Installing dependencies...
call pnpm install
if %ERRORLEVEL% neq 0 goto :error

echo [2/3] Setting up database schema...
call pnpm db:push

echo [3/3] Seeding initial data...
call pnpm db:seed

echo.
echo ✅ Database setup completed!
pause
goto :start

:error
echo.
echo ❌ Error occurred! Check the output above.
pause
exit /b 1

:exit
echo.
echo 👋 Goodbye!
exit /b 0

:end
echo.
echo 🏁 Process completed.
pause