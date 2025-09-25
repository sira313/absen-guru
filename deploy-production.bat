@echo off
REM =============================================================================
REM 🚀 ABSEN-GURU PRODUCTION DEPLOYMENT SCRIPT (WINDOWS)
REM =============================================================================
REM Script ini akan membantu Anda deploy aplikasi absen-guru dengan mudah
REM Mendukung: Local network, Domain/subdomain, Cloudflare Tunnel
REM =============================================================================

setlocal enabledelayedexpansion

REM Colors (limited in Windows CMD)
set "GREEN=[92m"
set "BLUE=[94m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

echo.
echo %BLUE%==============================================
echo 🚀 ABSEN-GURU PRODUCTION DEPLOYMENT
echo ==============================================%NC%
echo.

REM Check if pnpm is installed
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ pnpm tidak ditemukan!%NC%
    echo %BLUE%ℹ️  Installing pnpm global...%NC%
    npm install -g pnpm
    echo %GREEN%✅ pnpm berhasil diinstall%NC%
)

REM Check if PM2 is installed
pm2 --version >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ PM2 tidak ditemukan!%NC%
    echo %BLUE%ℹ️  Installing PM2 global...%NC%
    npm install -g pm2
    echo %GREEN%✅ PM2 berhasil diinstall%NC%
)

REM Get local IP using PowerShell
echo %BLUE%ℹ️  Detecting local IP address...%NC%
for /f "tokens=*" %%i in ('powershell -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notmatch 'Loopback'}).IPAddress | Select-Object -First 1"') do set LOCAL_IP=%%i

REM Remove any carriage return characters
set LOCAL_IP=%LOCAL_IP:~0,-1%

echo.
echo %BLUE%ℹ️  Pilih jenis deployment:%NC%
echo 1. Local Network (IP:PORT)
echo 2. Domain/Subdomain (https://domain.com)
echo 3. Cloudflare Tunnel
echo 4. Custom Origin
echo.
set /p DEPLOYMENT_CHOICE="Pilih opsi (1-4): "

set ORIGIN=
set PORT=3000
set DEPLOYMENT_TYPE=

if "%DEPLOYMENT_CHOICE%"=="1" (
    set DEPLOYMENT_TYPE=Local Network
    echo.
    echo %BLUE%ℹ️  IP lokal terdeteksi: %LOCAL_IP%%NC%
    set /p USE_DETECTED_IP="Gunakan IP ini? (y/n) [default: y]: "
    
    if /i "!USE_DETECTED_IP!"=="n" (
        set /p LOCAL_IP="Masukkan IP address: "
    )
    
    set /p CUSTOM_PORT="Port [default: 3000]: "
    if not "!CUSTOM_PORT!"=="" set PORT=!CUSTOM_PORT!
    
    set ORIGIN=http://!LOCAL_IP!:!PORT!

) else if "%DEPLOYMENT_CHOICE%"=="2" (
    set DEPLOYMENT_TYPE=Domain/Subdomain
    echo.
    echo %BLUE%ℹ️  Contoh: https://absen.sdn19periji.sch.id%NC%
    set /p DOMAIN_INPUT="Masukkan domain lengkap (dengan https://): "
    
    REM Add https:// if not present
    echo !DOMAIN_INPUT! | find "http" >nul
    if errorlevel 1 set DOMAIN_INPUT=https://!DOMAIN_INPUT!
    
    set ORIGIN=!DOMAIN_INPUT!
    
    set /p CUSTOM_PORT="Port [default: 3000]: "
    if not "!CUSTOM_PORT!"=="" set PORT=!CUSTOM_PORT!

) else if "%DEPLOYMENT_CHOICE%"=="3" (
    set DEPLOYMENT_TYPE=Cloudflare Tunnel
    echo.
    echo %BLUE%ℹ️  Untuk Cloudflare Tunnel, aplikasi berjalan di localhost%NC%
    echo %BLUE%ℹ️  Tunnel akan meneruskan ke aplikasi lokal%NC%
    
    set /p TUNNEL_DOMAIN="Masukkan domain Cloudflare Tunnel (contoh: https://your-tunnel.domain.com): "
    
    REM Add https:// if not present
    echo !TUNNEL_DOMAIN! | find "http" >nul
    if errorlevel 1 set TUNNEL_DOMAIN=https://!TUNNEL_DOMAIN!
    
    set ORIGIN=!TUNNEL_DOMAIN!
    set PORT=3000
    
    echo %YELLOW%⚠️  Pastikan Cloudflare Tunnel dikonfigurasi ke localhost:3000%NC%

) else if "%DEPLOYMENT_CHOICE%"=="4" (
    set DEPLOYMENT_TYPE=Custom
    echo.
    echo %BLUE%ℹ️  Contoh: http://192.168.8.103:3000, https://mydomain.com%NC%
    set /p ORIGIN="Masukkan origin lengkap: "

) else (
    echo %RED%❌ Pilihan tidak valid!%NC%
    pause
    exit /b 1
)

echo.
echo %BLUE%ℹ️  === KONFIGURASI DEPLOYMENT ===%NC%
echo Jenis: %DEPLOYMENT_TYPE%
echo Origin: %ORIGIN%
echo Port: %PORT%
echo.

set /p CONFIRM="Lanjutkan deployment? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo %BLUE%ℹ️  Deployment dibatalkan%NC%
    pause
    exit /b 0
)

echo.
echo %BLUE%ℹ️  🚀 Memulai deployment...%NC%

REM Stop existing PM2 process if any
echo %BLUE%ℹ️  Stopping existing PM2 processes...%NC%
pm2 stop absen-guru-production >nul 2>&1
pm2 delete absen-guru-production >nul 2>&1

REM Install dependencies
echo %BLUE%ℹ️  Installing dependencies dengan pnpm...%NC%
pnpm install
if errorlevel 1 (
    echo %RED%❌ Gagal install dependencies%NC%
    pause
    exit /b 1
)

REM Build the application
echo %BLUE%ℹ️  Building production bundle...%NC%
pnpm build
if errorlevel 1 (
    echo %RED%❌ Gagal build aplikasi%NC%
    pause
    exit /b 1
)

REM Setup database
echo %BLUE%ℹ️  Setting up database...%NC%
pnpm db:push
pnpm db:seed

REM Generate session secret
for /f %%i in ('powershell -Command "[System.Web.Security.Membership]::GeneratePassword(32, 0)"') do set SESSION_SECRET=%%i
if "%SESSION_SECRET%"=="" set SESSION_SECRET=absen-guru-production-secret-%RANDOM%

REM Generate PM2 ecosystem config
echo %BLUE%ℹ️  Generating PM2 ecosystem config...%NC%
(
echo module.exports = {
echo   apps: [
echo     {
echo       name: "absen-guru-production",
echo       script: "./build/index.js",
echo       exec_mode: "fork",
echo       instances: 1,
echo       autorestart: true,
echo       watch: false,
echo       max_memory_restart: "1G",
echo       log_date_format: "YYYY-MM-DD HH:mm:ss Z",
echo       merge_logs: true,
echo       error_file: "./logs/pm2-error.log",
echo       out_file: "./logs/pm2-out.log",
echo       env_production: {
echo         NODE_ENV: "production",
echo         PORT: %PORT%,
echo         HOST: "0.0.0.0",
echo         ORIGIN: "%ORIGIN%",
echo         SESSION_SECRET: "%SESSION_SECRET%",
echo         TZ: "Asia/Jakarta"
echo       }
echo     }
echo   ]
echo };
) > ecosystem.production.config.cjs

REM Start with PM2
echo %BLUE%ℹ️  Starting aplikasi dengan PM2...%NC%
pm2 start ecosystem.production.config.cjs --env production
if errorlevel 1 (
    echo %RED%❌ Gagal start aplikasi%NC%
    pause
    exit /b 1
)

REM Save PM2 configuration
pm2 save

echo.
echo %GREEN%🎉 DEPLOYMENT SELESAI!%NC%
echo.
echo %BLUE%ℹ️  === INFORMASI DEPLOYMENT ===%NC%
echo ✅ Jenis: %DEPLOYMENT_TYPE%
echo ✅ Origin: %ORIGIN%
echo ✅ Port: %PORT%
echo ✅ PM2 Process: absen-guru-production
echo.
echo %BLUE%ℹ️  === AKSES APLIKASI ===%NC%
echo 🌐 URL: %ORIGIN%
echo 👤 Admin Username: admin
echo 🔑 Admin Password: admin123
echo.
echo %BLUE%ℹ️  === PERINTAH BERGUNA ===%NC%
echo 📊 Status: pm2 status
echo 📋 Logs: pm2 logs absen-guru-production
echo 🔄 Restart: pm2 restart absen-guru-production
echo ⏹️  Stop: pm2 stop absen-guru-production
echo 📈 Monitor: pm2 monit
echo.

if "%DEPLOYMENT_TYPE%"=="Cloudflare Tunnel" (
    echo %YELLOW%⚠️  CATATAN CLOUDFLARE TUNNEL:%NC%
    echo 1. Pastikan tunnel dikonfigurasi ke localhost:3000
    echo 2. Jalankan: cloudflared tunnel run [tunnel-name]
    echo 3. Aplikasi harus dapat diakses melalui domain tunnel
    echo.
)

echo %GREEN%✅ Aplikasi siap digunakan! 🚀%NC%
echo.
pause