@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║                  🏠 ABSEN-GURU LAUNCHER                 ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo Pilih mode deployment:
echoececho [3] 📝 Logs Tunnel (pm2 logs absen-guru-tunnel)
echo [4] 📈 Monitor (pm2 monit) [2] 📝 Logs App (pm2 logs absen-guru)
echo [3] 📝 Logs Tunnel (pm2 logs absen-guru-tunnel)
echo [4] 📈 Monitor (pm2 monit)echo [1] 🖥️  Local Development (localhost:5174)
echo [2] 🌐 Local Network (IP Address + Production)  
echo [3] 🔄 PM2 Local Production (Recommended)
echo [4] 🔄 PM2 Network Production (Best for 24/7)
echo.
echo 📡 CLOUDFLARE TUNNEL (Internet Access):
echo [5] ☁️  Interactive Mode (Testing/Debug)
echo [6] 🔄 Background Service (Production 24/7)
echo.
echo [7] 🔧 Setup Database Only
echo [8] 🗑️  Reset Database (Fresh Start)
echo [9] 📊 PM2 Management (Status/Logs/Stop)
echo [0] ❌ Exit
echo.
echo 💡 Tips:
echo   • Opsi 5: Manual start/stop, real-time logs
echo   • Opsi 6: Auto-restart, background service, production-ready
echo.
set /p choice=Masukkan pilihan (0-9): 

if "%choice%"=="0" goto :exit
if "%choice%"=="1" goto :local_dev
if "%choice%"=="2" goto :network_prod
if "%choice%"=="3" goto :pm2_local
if "%choice%"=="4" goto :pm2_network
if "%choice%"=="5" goto :cloudflare
if "%choice%"=="6" goto :pm2_cloudflare
if "%choice%"=="7" goto :setup_db
if "%choice%"=="8" goto :reset_db
if "%choice%"=="9" goto :pm2_management

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
echo [2] 📝 Logs App (pm2 logs absen-guru)
echo [3] � Logs Tunnel (pm2 logs absen-guru-tunnel)
echo [4] �📈 Monitor (pm2 monit)
echo [5] 🔄 Restart All (pm2 restart all)
echo [6] 🔄 Restart App Only (pm2 restart absen-guru)
echo [7] ⏹️  Stop All (pm2 stop all)
echo [8] 🗑️  Delete All (pm2 delete all)
echo [9] 💾 Save Config (pm2 save)
echo [10] 🚀 Startup Script (pm2 startup)
echo [0] ← Back to main menu
echo.
set /p pm2_choice=Masukkan pilihan (0-10): 

if "%pm2_choice%"=="1" (
    echo.
    call pm2 status
    echo.
    pause
    goto :pm2_management
)
if "%pm2_choice%"=="2" (
    echo.
    echo ℹ️  Showing app logs...
    call pm2 logs absen-guru-app --lines 50 2>nul || call pm2 logs absen-guru --lines 50 2>nul || echo No app logs found
    pause
    goto :pm2_management
)
if "%pm2_choice%"=="3" (
    echo.
    echo ℹ️  Showing tunnel logs...
    call pm2 logs absen-guru-tunnel --lines 50 2>nul || echo No tunnel logs found
    pause
    goto :pm2_management
)
if "%pm2_choice%"=="4" (
    echo.
    echo 📈 Opening monitor (q to quit)...
    call pm2 monit
    goto :pm2_management
)
if "%pm2_choice%"=="5" (
    echo.
    call pm2 restart all
    echo ✅ All services restarted!
    pause
    goto :pm2_management
)
if "%pm2_choice%"=="6" (
    echo.
    call pm2 restart absen-guru-app 2>nul || call pm2 restart absen-guru 2>nul || echo No app to restart
    echo ✅ Application restarted!
    pause
    goto :pm2_management
)
if "%pm2_choice%"=="7" (
    echo.
    call pm2 stop all
    echo ✅ All services stopped!
    pause
    goto :pm2_management
)
if "%pm2_choice%"=="8" (
    echo.
    call pm2 stop absen-guru-app absen-guru-tunnel absen-guru 2>nul
    call pm2 delete absen-guru-app absen-guru-tunnel absen-guru 2>nul
    echo ✅ All services deleted from PM2!
    pause
    goto :pm2_management
)
if "%pm2_choice%"=="9" (
    echo.
    call pm2 save
    echo ✅ PM2 configuration saved!
    pause
    goto :pm2_management
)
if "%pm2_choice%"=="10" (
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

call :check_cloudflared
if %ERRORLEVEL% neq 0 goto :start

echo ✅ cloudflared found
echo.
echo Pilih jenis tunnel:
echo [1] � Quick Tunnel (Random URL, tidak perlu setup)
echo [2] 🏷️  Named Tunnel (Custom domain, perlu setup sekali)
echo [3] 🔧 Setup Cloudflare dulu (untuk Named Tunnel)
echo [0] ❌ Cancel
echo.
set /p tunnel_choice=Masukkan pilihan (0-3): 

if "%tunnel_choice%"=="1" call :cloudflare_quick_tunnel
if "%tunnel_choice%"=="2" call :cloudflare_named_tunnel
if "%tunnel_choice%"=="3" call :setup_cloudflare_first_time
if "%tunnel_choice%"=="0" goto :start
goto :end

:pm2_cloudflare
echo.
echo ========================================
echo 🔄 PM2 + CLOUDFLARE TUNNEL SERVICE
echo ========================================
echo.

where pm2 >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ PM2 tidak ditemukan!
    echo 📦 Install PM2: npm install -g pm2
    pause
    goto :start
)

call :check_cloudflared
if %ERRORLEVEL% neq 0 goto :start

echo ✅ PM2 found
echo ✅ cloudflared found
echo.
echo Pilih jenis tunnel untuk PM2 service:
echo [1] 🚀 Quick Tunnel Service (Random URL, tidak perlu setup)
echo [2] 🏷️  Named Tunnel Service (Custom domain, perlu setup sekali)
echo [3] 🔧 Setup Cloudflare dulu (untuk Named Tunnel)
echo [0] ❌ Cancel
echo.
set /p tunnel_choice=Masukkan pilihan (0-3): 

if "%tunnel_choice%"=="1" call :pm2_quick_tunnel_service
if "%tunnel_choice%"=="2" call :pm2_named_tunnel_service
if "%tunnel_choice%"=="3" call :setup_cloudflare_first_time
if "%tunnel_choice%"=="0" goto :start
pause
goto :start

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
goto :start

:check_cloudflared
where cloudflared >nul 2>nul
if %ERRORLEVEL% equ 0 exit /b 0

if exist "%ProgramFiles%\cloudflared\cloudflared.exe" exit /b 0
if exist "%ProgramFiles(x86)%\cloudflared\cloudflared.exe" exit /b 0

echo ❌ cloudflared tidak ditemukan!
echo.
echo 📥 Install cloudflared terlebih dahulu:
echo 🌐 https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
echo.
pause
exit /b 1

:cloudflare_quick_tunnel
echo.
echo 🚀 Starting Quick Tunnel...

echo [1/4] Installing dependencies...
call pnpm install
if %ERRORLEVEL% neq 0 goto :error

echo [2/4] Setting up database...
call :setup_db_if_needed

echo [3/4] Building application...
call pnpm build
if %ERRORLEVEL% neq 0 goto :error

echo [4/4] Starting tunnel...
start /B pnpm start
timeout /t 3 /nobreak >nul

echo.
echo ✅ 🌐 Quick tunnel akan dimulai dengan URL random
echo ⚠️  URL akan berubah setiap restart
echo.
cloudflared tunnel --url localhost:3000
exit /b 0

:cloudflare_named_tunnel
echo.
echo 🏷️  Named Tunnel Setup
echo.

cloudflared tunnel list >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ⚠️  Belum login ke Cloudflare!
    echo.
    echo ℹ️  Langkah-langkah setup:
    echo 1. Login ke Cloudflare: cloudflared tunnel login
    echo 2. Buat tunnel: cloudflared tunnel create absen-guru
    echo 3. Set DNS record: cloudflared tunnel route dns absen-guru YOUR-DOMAIN.com
    echo 4. Jalankan lagi launcher ini
    echo.
    
    set /p login_choice=Mau login sekarang? (y/n): 
    if /i not "%login_choice%"=="y" (
        echo Setup dibatalkan - login diperlukan
        exit /b 1
    )
    
    echo.
    echo ℹ️  Membuka browser untuk login...
    cloudflared tunnel login
    if %ERRORLEVEL% neq 0 (
        echo ❌ Login gagal!
        exit /b 1
    )
    
    set /p login_done=Sudah login? (y/n): 
    if /i not "%login_done%"=="y" (
        echo ❌ Setup dibatalkan
        exit /b 1
    )
)

echo.
echo ℹ️  Checking existing tunnels...
cloudflared tunnel list | findstr "absen-guru" >nul
if %ERRORLEVEL% neq 0 (
    echo ⚠️  Tunnel 'absen-guru' belum ada
    echo.
    set /p create_choice=Buat tunnel baru 'absen-guru'? (y/n): 
    
    if /i "%create_choice%"=="y" (
        echo ℹ️  Membuat tunnel 'absen-guru'...
        cloudflared tunnel create absen-guru
        if %ERRORLEVEL% neq 0 (
            echo ❌ Gagal membuat tunnel
            exit /b 1
        )
    ) else (
        echo ❌ Setup dibatalkan
        exit /b 1
    )
) else (
    echo ✅ Tunnel 'absen-guru' sudah ada
)

set /p DOMAIN=Masukkan domain (contoh: absen.yourschool.sch.id): 
if "%DOMAIN%"=="" (
    echo ❌ Domain tidak boleh kosong!
    exit /b 1
)

echo.
echo ℹ️  Membuat konfigurasi tunnel...
if not exist "%USERPROFILE%\.cloudflared" mkdir "%USERPROFILE%\.cloudflared"

for /f "tokens=1" %%a in ('cloudflared tunnel list ^| findstr "absen-guru"') do set TUNNEL_ID=%%a

echo tunnel: %TUNNEL_ID%> "%USERPROFILE%\.cloudflared\config.yml"
echo credentials-file: %USERPROFILE%\.cloudflared\%TUNNEL_ID%.json>> "%USERPROFILE%\.cloudflared\config.yml"
echo.>> "%USERPROFILE%\.cloudflared\config.yml"
echo ingress:>> "%USERPROFILE%\.cloudflared\config.yml"
echo   - hostname: %DOMAIN%>> "%USERPROFILE%\.cloudflared\config.yml"
echo     service: http://localhost:3000>> "%USERPROFILE%\.cloudflared\config.yml"
echo   - service: http_status:404>> "%USERPROFILE%\.cloudflared\config.yml"

echo ✅ Konfigurasi dibuat

REM Auto-create DNS record
echo.
echo ℹ️  🌐 Auto-setting DNS record...
cloudflared tunnel route dns absen-guru %DOMAIN% >nul 2>&1
if %ERRORLEVEL%==0 (
    echo ✅ DNS record created for %DOMAIN%
) else (
    echo ⚠️  DNS record already exists or failed ^(continuing anyway^)
)

echo.
echo [1/3] Installing dependencies...
call pnpm install
if %ERRORLEVEL% neq 0 goto :error

echo [2/3] Setting up database...
call :setup_db_if_needed

echo [3/3] Building application...
call pnpm build
if %ERRORLEVEL% neq 0 goto :error

echo.
echo ℹ️  Starting application and tunnel...
start /B pnpm start
timeout /t 3 /nobreak >nul

echo.
echo ✅ 🌐 Named tunnel dimulai!
echo ✅ Domain: https://%DOMAIN%
echo ℹ️  Tunnel: absen-guru
echo.
cloudflared tunnel run absen-guru
exit /b 0

:pm2_quick_tunnel_service
echo.
echo 🚀 Setting up PM2 Quick Tunnel Service...

echo [1/4] Installing dependencies...
call pnpm install
if %ERRORLEVEL% neq 0 goto :error

echo [2/4] Setting up database...
call :setup_db_if_needed

echo [3/4] Building application...
call pnpm build
if %ERRORLEVEL% neq 0 goto :error

echo [4/4] Starting PM2 services...
call pm2 stop absen-guru-app absen-guru-tunnel 2>nul
call pm2 delete absen-guru-app absen-guru-tunnel 2>nul

call pm2 start "node build/index.js" --name "absen-guru-app" --env production
timeout /t 3 /nobreak >nul
call pm2 start "cloudflared tunnel --url localhost:3000" --name "absen-guru-tunnel"
call pm2 save

echo.
echo ✅ 🎉 PM2 + Quick Tunnel Service berhasil dimulai!
echo.
echo ℹ️  Services yang berjalan:
echo   • absen-guru-app (Node.js application)
echo   • absen-guru-tunnel (Cloudflare tunnel)
echo.
echo ℹ️  Perintah berguna:
echo   • pm2 status              - Lihat status services
echo   • pm2 logs absen-guru-app - Lihat logs aplikasi  
echo   • pm2 logs absen-guru-tunnel - Lihat logs tunnel
echo   • pm2 restart all         - Restart semua services
echo   • pm2 stop all            - Stop semua services
echo.
echo 🔍 Mencari tunnel URL...
timeout /t 5 /nobreak >nul
echo URL akan muncul dalam beberapa saat di: pm2 logs absen-guru-tunnel
exit /b 0

:pm2_named_tunnel_service
echo.
echo 🏷️  Setting up PM2 Named Tunnel Service...

cloudflared tunnel list >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ⚠️  Belum login ke Cloudflare atau tunnel belum dibuat!
    echo.
    echo ℹ️  Setup manual diperlukan:
    echo 1. cloudflared tunnel login
    echo 2. cloudflared tunnel create absen-guru
    echo 3. cloudflared tunnel route dns absen-guru YOUR-DOMAIN.com
    echo 4. Jalankan lagi opsi ini
    pause
    exit /b 1
)

cloudflared tunnel list | findstr "absen-guru" >nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Tunnel 'absen-guru' tidak ditemukan!
    echo.
    echo ℹ️  Buat tunnel terlebih dahulu:
    echo cloudflared tunnel create absen-guru
    pause
    exit /b 1
)

set /p DOMAIN=Masukkan domain (contoh: absen.yourschool.sch.id): 
if "%DOMAIN%"=="" (
    echo ❌ Domain tidak boleh kosong!
    exit /b 1
)

REM Get tunnel ID
for /f "tokens=1" %%a in ('cloudflared tunnel list ^| findstr "absen-guru"') do set TUNNEL_ID=%%a

REM Auto-create DNS record  
echo.
echo ℹ️  🌐 Setting up DNS record...
cloudflared tunnel route dns absen-guru "%DOMAIN%" >nul 2>&1
if %ERRORLEVEL%==0 (
    echo ✅ DNS record created for %DOMAIN%
) else (
    echo ⚠️  DNS record already exists or failed ^(continuing anyway^)
)

REM Force update config
echo ℹ️  📝 Creating/updating tunnel configuration...
if not exist "%USERPROFILE%\.cloudflared" mkdir "%USERPROFILE%\.cloudflared"

echo tunnel: !TUNNEL_ID!> "%USERPROFILE%\.cloudflared\config.yml"
echo credentials-file: %USERPROFILE%\.cloudflared\!TUNNEL_ID!.json>> "%USERPROFILE%\.cloudflared\config.yml"
echo.>> "%USERPROFILE%\.cloudflared\config.yml"
echo ingress:>> "%USERPROFILE%\.cloudflared\config.yml"
echo   - hostname: %DOMAIN%>> "%USERPROFILE%\.cloudflared\config.yml"
echo     service: http://localhost:3000>> "%USERPROFILE%\.cloudflared\config.yml"
echo   - service: http_status:404>> "%USERPROFILE%\.cloudflared\config.yml"

echo ✅ Configuration updated

echo [1/4] Installing dependencies...
call pnpm install
if %ERRORLEVEL% neq 0 goto :error

echo [2/4] Setting up database...
call :setup_db_if_needed

echo [3/4] Building application...
call pnpm build
if %ERRORLEVEL% neq 0 goto :error

echo [4/4] Starting PM2 services...
call pm2 stop absen-guru-app absen-guru-tunnel 2>nul
call pm2 delete absen-guru-app absen-guru-tunnel 2>nul

call pm2 start "node build/index.js" --name "absen-guru-app" --env production
timeout /t 3 /nobreak >nul
call pm2 start "cloudflared tunnel run absen-guru" --name "absen-guru-tunnel"
call pm2 save

echo.
echo ✅ 🎉 PM2 + Named Tunnel Service berhasil dimulai!
echo.
echo ✅ 🌐 Domain: https://%DOMAIN%
echo ℹ️  🔗 Tunnel ID: %TUNNEL_ID%
echo.

REM DNS validation check
echo ℹ️  🔍 Testing DNS resolution...
timeout /t 2 /nobreak >nul

nslookup %DOMAIN% 8.8.8.8 >nul 2>&1
if %ERRORLEVEL%==0 (
    echo ✅ DNS sudah aktif!
    echo.
    echo ℹ️  🚀 Coba akses: https://%DOMAIN%
) else (
    echo ⚠️  DNS belum propagate ^(normal, butuh 5-15 menit^)
    echo.
    echo ℹ️  💡 Tips sementara menunggu DNS:
    echo   • Coba akses: https://%TUNNEL_ID%.cfargotunnel.com
    echo   • Atau tunggu 5-15 menit lalu coba: https://%DOMAIN%
    echo.
    echo ℹ️  🔍 Check DNS status:
    echo   • nslookup %DOMAIN% 8.8.8.8
    echo   • Online: https://dnschecker.org/#CNAME/%DOMAIN%
)

echo.
echo ℹ️  📊 Services yang berjalan:
echo   • absen-guru-app (Node.js application)
echo   • absen-guru-tunnel (Cloudflare named tunnel)
echo.
echo ℹ️  🛠️  Perintah berguna:
echo   • pm2 status              - Lihat status services
echo   • pm2 logs absen-guru-app - Logs aplikasi
echo   • pm2 logs absen-guru-tunnel - Logs tunnel
echo   • pm2 restart all         - Restart semua services
echo.
pause
exit /b 0

:setup_cloudflare_first_time
echo.
echo ℹ️  🔧 SETUP CLOUDFLARE (One-time setup)
echo.

cloudflared tunnel list >nul 2>nul
if %ERRORLEVEL% equ 0 (
    cloudflared tunnel list | findstr "absen-guru" >nul
    if %ERRORLEVEL% equ 0 (
        echo ✅ Cloudflare sudah ter-setup!
        pause
        exit /b 0
    )
)

echo ⚠️  Setup Cloudflare diperlukan (hanya sekali)
echo.
echo ℹ️  Langkah yang akan dilakukan:
echo 1. Login ke akun Cloudflare gratis
echo 2. Buat tunnel 'absen-guru'
echo 3. Setup DNS untuk domain kustom (opsional)
echo.

set /p setup_choice=Lanjutkan setup? (y/n): 
if /i not "%setup_choice%"=="y" (
    echo ℹ️  Setup dibatalkan - gunakan Quick Tunnel tanpa setup
    pause
    exit /b 1
)

echo.
echo ℹ️  💻 Membuka browser untuk login Cloudflare...
cloudflared tunnel login
if %ERRORLEVEL% neq 0 (
    echo ❌ Login gagal!
    pause
    exit /b 1
)

echo.
set /p login_ok=Sudah login berhasil? (y/n): 
if /i not "%login_ok%"=="y" (
    echo ❌ Setup dibatalkan
    pause
    exit /b 1
)

echo.
echo ℹ️  🚇 Membuat tunnel 'absen-guru'...
cloudflared tunnel create absen-guru
if %ERRORLEVEL% neq 0 (
    echo ❌ Gagal membuat tunnel!
    pause
    exit /b 1
)

echo.
echo ✅ Setup Cloudflare berhasil!
echo ℹ️  Tunnel 'absen-guru' sudah dibuat dan siap digunakan
echo.
pause
exit /b 0

:setup_db_if_needed
if not exist "absen.db" (
    echo ℹ️  Database not found, creating fresh database...
    call pnpm db:setup
) else (
    echo ✅ Database exists, skipping setup
)
exit /b 0