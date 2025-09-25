@echo off
REM =============================================================================
REM 🛠️ ABSEN-GURU DEPLOYMENT MANAGER (WINDOWS)
REM =============================================================================
REM Script utility untuk mengelola deployment aplikasi absen-guru di Windows
REM =============================================================================

setlocal enabledelayedexpansion

REM Colors (limited in Windows CMD)
set "GREEN=[92m"
set "BLUE=[94m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

:main_menu
cls
echo.
echo %BLUE%==============================================
echo 🛠️  ABSEN-GURU DEPLOYMENT MANAGER
echo ==============================================%NC%
echo.

REM Show app info
echo %BLUE%ℹ️  === INFORMASI APLIKASI ===%NC%
if exist "ecosystem.production.config.cjs" (
    echo 📁 Config file: ecosystem.production.config.cjs
    
    REM Extract origin from config (simplified)
    for /f "tokens=2 delims=:" %%i in ('findstr "ORIGIN" ecosystem.production.config.cjs') do (
        set origin_line=%%i
        set origin=!origin_line:"=!
        set origin=!origin:,=!
        set origin=!origin: =!
    )
    
    echo 🌐 Origin: !origin!
) else (
    echo %YELLOW%⚠️  Config file tidak ditemukan%NC%
)

if exist "package.json" (
    for /f "tokens=2 delims=:" %%i in ('findstr "version" package.json') do (
        set version_line=%%i
        set version=!version_line:"=!
        set version=!version:,=!
        set version=!version: =!
    )
    echo 📦 Version: !version!
)

if exist "absen.db" (
    for %%i in (absen.db) do echo 💾 Database size: %%~zi bytes
)

echo.
echo %BLUE%ℹ️  Pilih aksi:%NC%
echo 1.  📊 Status ^& Info
echo 2.  🔄 Update Aplikasi
echo 3.  🌐 Ubah Origin/Domain
echo 4.  💾 Backup Database
echo 5.  📥 Restore Database
echo 6.  🔑 Reset Admin Password
echo 7.  📋 Lihat Logs
echo 8.  🧹 Cleanup
echo 9.  🔄 Restart App
echo 10. ⏹️  Stop App
echo 11. ▶️  Start App
echo 0.  🚪 Keluar
echo.

set /p choice="Pilih opsi (0-11): "

if "%choice%"=="1" goto show_status
if "%choice%"=="2" goto update_app
if "%choice%"=="3" goto change_origin
if "%choice%"=="4" goto backup_database
if "%choice%"=="5" goto restore_database
if "%choice%"=="6" goto reset_admin_password
if "%choice%"=="7" goto show_logs
if "%choice%"=="8" goto cleanup
if "%choice%"=="9" goto restart_app
if "%choice%"=="10" goto stop_app
if "%choice%"=="11" goto start_app
if "%choice%"=="0" goto exit_program

echo %RED%❌ Pilihan tidak valid!%NC%
pause
goto main_menu

:show_status
echo.
echo %BLUE%ℹ️  Status PM2 processes:%NC%
pm2 status
echo.
echo %BLUE%ℹ️  Logs terbaru (10 baris terakhir):%NC%
pm2 logs absen-guru-production --lines 10
pause
goto main_menu

:update_app
echo.
echo %BLUE%ℹ️  🔄 Updating aplikasi...%NC%

REM Stop application
echo %BLUE%ℹ️  Stopping aplikasi...%NC%
pm2 stop absen-guru-production >nul 2>&1

REM Pull latest changes if git repo
if exist ".git" (
    echo %BLUE%ℹ️  Pulling latest changes from git...%NC%
    git pull origin main
)

REM Install dependencies
echo %BLUE%ℹ️  Installing/updating dependencies...%NC%
pnpm install

REM Rebuild
echo %BLUE%ℹ️  Rebuilding aplikasi...%NC%
pnpm build

REM Update database schema
echo %BLUE%ℹ️  Updating database schema...%NC%
pnpm db:push

REM Restart application
echo %BLUE%ℹ️  Restarting aplikasi...%NC%
pm2 restart absen-guru-production

echo %GREEN%✅ Update selesai!%NC%
pause
goto main_menu

:change_origin
echo.
echo %BLUE%ℹ️  🌐 Mengubah origin/domain aplikasi%NC%

if not exist "ecosystem.production.config.cjs" (
    echo %RED%❌ Config file tidak ditemukan!%NC%
    echo Jalankan deployment script terlebih dahulu
    pause
    goto main_menu
)

REM Show current origin (simplified)
for /f "tokens=2 delims=:" %%i in ('findstr "ORIGIN" ecosystem.production.config.cjs') do (
    set origin_line=%%i
    set current_origin=!origin_line:"=!
    set current_origin=!current_origin:,=!
    set current_origin=!current_origin: =!
)
echo Origin saat ini: !current_origin!

echo.
set /p new_origin="Masukkan origin baru (contoh: https://domain.com): "

if "%new_origin%"=="" (
    echo %RED%❌ Origin tidak boleh kosong!%NC%
    pause
    goto main_menu
)

REM Update config file (simplified - recreate the relevant line)
echo %BLUE%ℹ️  Updating config file...%NC%
powershell -Command "(Get-Content ecosystem.production.config.cjs) -replace 'ORIGIN: \"[^\"]*\"', 'ORIGIN: \"%new_origin%\"' | Set-Content ecosystem.production.config.cjs"

REM Restart application
echo %BLUE%ℹ️  Restarting aplikasi dengan origin baru...%NC%
pm2 restart absen-guru-production

echo %GREEN%✅ Origin berhasil diubah ke: %new_origin%%NC%
pause
goto main_menu

:backup_database
echo.
echo %BLUE%ℹ️  💾 Backup database...%NC%

if not exist "absen.db" (
    echo %RED%❌ Database tidak ditemukan!%NC%
    pause
    goto main_menu
)

REM Create backup directory
if not exist "backups" mkdir backups

REM Generate timestamp
for /f "tokens=1-3 delims=/- " %%a in ("%date%") do set mydate=%%c%%b%%a
for /f "tokens=1-3 delims=:. " %%a in ("%time%") do set mytime=%%a%%b%%c
set timestamp=%mydate%_%mytime%
set backup_file=backups\absen_backup_%timestamp%.db

REM Stop application temporarily
echo %BLUE%ℹ️  Stopping aplikasi sementara...%NC%
pm2 stop absen-guru-production >nul 2>&1

REM Copy database
copy absen.db "%backup_file%" >nul

REM Restart application
echo %BLUE%ℹ️  Restarting aplikasi...%NC%
pm2 restart absen-guru-production >nul 2>&1

echo %GREEN%✅ Backup berhasil: %backup_file%%NC%
for %%i in ("%backup_file%") do echo 📊 Ukuran backup: %%~zi bytes
pause
goto main_menu

:restore_database
echo.
echo %BLUE%ℹ️  📥 Restore database dari backup%NC%

if not exist "backups" (
    echo %RED%❌ Folder backup tidak ditemukan!%NC%
    pause
    goto main_menu
)

REM List backup files
dir /b backups\*.db >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ Tidak ada file backup ditemukan!%NC%
    pause
    goto main_menu
)

echo.
echo %BLUE%ℹ️  File backup tersedia:%NC%
dir /b backups\*.db

echo.
set /p backup_file="Masukkan nama file backup (tanpa path): "

if not exist "backups\%backup_file%" (
    echo %RED%❌ File backup tidak ditemukan!%NC%
    pause
    goto main_menu
)

echo %YELLOW%⚠️  PERINGATAN: Ini akan mengganti database saat ini!%NC%
set /p confirm="Lanjutkan? (y/n): "

if /i not "%confirm%"=="y" (
    echo %BLUE%ℹ️  Restore dibatalkan%NC%
    pause
    goto main_menu
)

REM Stop application
echo %BLUE%ℹ️  Stopping aplikasi...%NC%
pm2 stop absen-guru-production >nul 2>&1

REM Backup current database
for /f "tokens=1-3 delims=/- " %%a in ("%date%") do set mydate=%%c%%b%%a
for /f "tokens=1-3 delims=:. " %%a in ("%time%") do set mytime=%%a%%b%%c
set current_backup=backups\absen_before_restore_%mydate%_%mytime%.db
copy absen.db "%current_backup%" >nul
echo %BLUE%ℹ️  Current database backed up to: %current_backup%%NC%

REM Restore from backup
copy "backups\%backup_file%" absen.db >nul

REM Restart application
echo %BLUE%ℹ️  Restarting aplikasi...%NC%
pm2 restart absen-guru-production >nul 2>&1

echo %GREEN%✅ Database berhasil di-restore dari: %backup_file%%NC%
pause
goto main_menu

:reset_admin_password
echo.
echo %BLUE%ℹ️  🔑 Reset password admin%NC%

if not exist "scripts\reset-admin-password.js" (
    echo %RED%❌ Script reset password tidak ditemukan!%NC%
    pause
    goto main_menu
)

echo %YELLOW%⚠️  Password admin akan direset ke: admin123%NC%
set /p confirm="Lanjutkan? (y/n): "

if /i not "%confirm%"=="y" (
    echo %BLUE%ℹ️  Reset dibatalkan%NC%
    pause
    goto main_menu
)

REM Run reset script
node scripts\reset-admin-password.js

echo %GREEN%✅ Password admin berhasil direset!%NC%
echo 👤 Username: admin
echo 🔑 Password: admin123
pause
goto main_menu

:show_logs
echo.
echo %BLUE%ℹ️  📋 Menampilkan logs aplikasi%NC%
echo.
echo 1. Live logs (real-time)
echo 2. Error logs
echo 3. Output logs
echo 4. All logs (last 50 lines)
echo.
set /p log_choice="Pilih opsi (1-4): "

if "%log_choice%"=="1" (
    echo %BLUE%ℹ️  Menampilkan live logs (Ctrl+C untuk keluar)...%NC%
    pm2 logs absen-guru-production --follow
) else if "%log_choice%"=="2" (
    echo %BLUE%ℹ️  Error logs (50 baris terakhir):%NC%
    pm2 logs absen-guru-production --err --lines 50
) else if "%log_choice%"=="3" (
    echo %BLUE%ℹ️  Output logs (50 baris terakhir):%NC%
    pm2 logs absen-guru-production --out --lines 50
) else if "%log_choice%"=="4" (
    echo %BLUE%ℹ️  All logs (50 baris terakhir):%NC%
    pm2 logs absen-guru-production --lines 50
) else (
    echo %RED%❌ Pilihan tidak valid!%NC%
)

pause
goto main_menu

:cleanup
echo.
echo %BLUE%ℹ️  🧹 Cleanup temporary files dan cache%NC%

REM Clean build cache
echo %BLUE%ℹ️  Cleaning build cache...%NC%
if exist ".svelte-kit" rmdir /s /q .svelte-kit >nul 2>&1
if exist "build" rmdir /s /q build >nul 2>&1
if exist "node_modules\.vite" rmdir /s /q "node_modules\.vite" >nul 2>&1

REM Clean PM2 logs
set /p clean_logs="Clean PM2 logs? (y/n): "
if /i "%clean_logs%"=="y" (
    pm2 flush absen-guru-production >nul 2>&1
    if exist "logs\pm2-error.log" del "logs\pm2-error.log" >nul 2>&1
    if exist "logs\pm2-out.log" del "logs\pm2-out.log" >nul 2>&1
    echo %BLUE%ℹ️  PM2 logs cleaned%NC%
)

REM Clean old backups (older than 30 days) - simplified approach
if exist "backups" (
    echo %BLUE%ℹ️  Checking old backups...%NC%
    forfiles /p backups /s /c "cmd /c echo @path" 2>nul
)

echo %GREEN%✅ Cleanup selesai!%NC%
pause
goto main_menu

:restart_app
echo.
echo %BLUE%ℹ️  Restarting aplikasi...%NC%
pm2 restart absen-guru-production
echo %GREEN%✅ Aplikasi direstart!%NC%
pause
goto main_menu

:stop_app
echo.
echo %BLUE%ℹ️  Stopping aplikasi...%NC%
pm2 stop absen-guru-production
echo %GREEN%✅ Aplikasi dihentikan!%NC%
pause
goto main_menu

:start_app
echo.
echo %BLUE%ℹ️  Starting aplikasi...%NC%
pm2 start absen-guru-production
echo %GREEN%✅ Aplikasi dijalankan!%NC%
pause
goto main_menu

:exit_program
echo.
echo %BLUE%ℹ️  Keluar dari deployment manager%NC%
exit /b 0