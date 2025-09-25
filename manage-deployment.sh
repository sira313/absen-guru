#!/bin/bash

# =============================================================================
# 🛠️ ABSEN-GURU DEPLOYMENT MANAGER
# =============================================================================
# Script utility untuk mengelola deployment aplikasi absen-guru
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo -e "${BLUE}"
    echo "=============================================="
    echo "🛠️  ABSEN-GURU DEPLOYMENT MANAGER"
    echo "=============================================="
    echo -e "${NC}"
}

# Function to show PM2 status
show_status() {
    print_info "Status PM2 processes:"
    pm2 status
    echo ""
    
    if pm2 list | grep -q "absen-guru-production"; then
        print_info "Logs terbaru (10 baris terakhir):"
        pm2 logs absen-guru-production --lines 10
    fi
}

# Function to show application info
show_app_info() {
    print_info "=== INFORMASI APLIKASI ==="
    
    if [[ -f "ecosystem.production.config.cjs" ]]; then
        echo "📁 Config file: ecosystem.production.config.cjs"
        
        # Extract origin from config
        origin=$(grep -o 'ORIGIN: "[^"]*"' ecosystem.production.config.cjs | cut -d'"' -f2 2>/dev/null || echo "Not set")
        port=$(grep -o 'PORT: [0-9]*' ecosystem.production.config.cjs | cut -d' ' -f2 2>/dev/null || echo "3000")
        
        echo "🌐 Origin: $origin"
        echo "🔌 Port: $port"
    else
        print_warning "Config file tidak ditemukan"
    fi
    
    if [[ -f "package.json" ]]; then
        version=$(grep '"version"' package.json | cut -d'"' -f4)
        echo "📦 Version: $version"
    fi
    
    echo "📊 Database: absen.db"
    if [[ -f "absen.db" ]]; then
        size=$(du -h absen.db | cut -f1)
        echo "💾 Database size: $size"
    fi
}

# Function to update application
update_app() {
    print_info "🔄 Updating aplikasi..."
    
    # Stop application
    print_info "Stopping aplikasi..."
    pm2 stop absen-guru-production 2>/dev/null || true
    
    # Pull latest changes (if git repo)
    if [[ -d ".git" ]]; then
        print_info "Pulling latest changes from git..."
        git pull origin main
    fi
    
    # Install dependencies
    print_info "Installing/updating dependencies..."
    pnpm install
    
    # Rebuild
    print_info "Rebuilding aplikasi..."
    pnpm build
    
    # Update database schema if needed
    print_info "Updating database schema..."
    pnpm db:push
    
    # Restart application
    print_info "Restarting aplikasi..."
    pm2 restart absen-guru-production
    
    print_success "Update selesai!"
}

# Function to change origin/domain
change_origin() {
    print_info "🌐 Mengubah origin/domain aplikasi"
    
    if [[ ! -f "ecosystem.production.config.cjs" ]]; then
        print_error "Config file tidak ditemukan!"
        echo "Jalankan deployment script terlebih dahulu"
        return 1
    fi
    
    # Show current origin
    current_origin=$(grep -o 'ORIGIN: "[^"]*"' ecosystem.production.config.cjs | cut -d'"' -f2 2>/dev/null || echo "Not set")
    echo "Origin saat ini: $current_origin"
    
    echo ""
    read -p "Masukkan origin baru (contoh: https://domain.com): " new_origin
    
    if [[ -z "$new_origin" ]]; then
        print_error "Origin tidak boleh kosong!"
        return 1
    fi
    
    # Validate format
    if [[ ! "$new_origin" =~ ^https?://[a-zA-Z0-9.-]+(:[0-9]+)?$ ]]; then
        print_error "Format origin tidak valid!"
        return 1
    fi
    
    # Update config file
    print_info "Updating config file..."
    sed -i.bak "s|ORIGIN: \"[^\"]*\"|ORIGIN: \"$new_origin\"|g" ecosystem.production.config.cjs
    
    # Restart application
    print_info "Restarting aplikasi dengan origin baru..."
    pm2 restart absen-guru-production
    
    print_success "Origin berhasil diubah ke: $new_origin"
}

# Function to backup database
backup_database() {
    print_info "💾 Backup database..."
    
    if [[ ! -f "absen.db" ]]; then
        print_error "Database tidak ditemukan!"
        return 1
    fi
    
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_file="backups/absen_backup_$timestamp.db"
    
    # Create backup directory
    mkdir -p backups
    
    # Stop application temporarily
    print_info "Stopping aplikasi sementara..."
    pm2 stop absen-guru-production
    
    # Copy database
    cp absen.db "$backup_file"
    
    # Restart application
    print_info "Restarting aplikasi..."
    pm2 restart absen-guru-production
    
    print_success "Backup berhasil: $backup_file"
    
    # Show backup size
    size=$(du -h "$backup_file" | cut -f1)
    echo "📊 Ukuran backup: $size"
}

# Function to restore database
restore_database() {
    print_info "📥 Restore database dari backup"
    
    if [[ ! -d "backups" ]] || [[ -z $(ls backups/*.db 2>/dev/null) ]]; then
        print_error "Tidak ada file backup ditemukan!"
        return 1
    fi
    
    echo ""
    print_info "File backup tersedia:"
    ls -la backups/*.db
    
    echo ""
    read -p "Masukkan nama file backup (tanpa path): " backup_file
    
    if [[ ! -f "backups/$backup_file" ]]; then
        print_error "File backup tidak ditemukan!"
        return 1
    fi
    
    print_warning "PERINGATAN: Ini akan mengganti database saat ini!"
    read -p "Lanjutkan? (y/n): " confirm
    
    if [[ "$confirm" != "y" ]]; then
        print_info "Restore dibatalkan"
        return 0
    fi
    
    # Stop application
    print_info "Stopping aplikasi..."
    pm2 stop absen-guru-production
    
    # Backup current database
    current_backup="backups/absen_before_restore_$(date +%Y%m%d_%H%M%S).db"
    cp absen.db "$current_backup"
    print_info "Current database backed up to: $current_backup"
    
    # Restore from backup
    cp "backups/$backup_file" absen.db
    
    # Restart application
    print_info "Restarting aplikasi..."
    pm2 restart absen-guru-production
    
    print_success "Database berhasil di-restore dari: $backup_file"
}

# Function to reset admin password
reset_admin_password() {
    print_info "🔑 Reset password admin"
    
    if [[ ! -f "scripts/reset-admin-password.js" ]]; then
        print_error "Script reset password tidak ditemukan!"
        return 1
    fi
    
    print_warning "Password admin akan direset ke: admin123"
    read -p "Lanjutkan? (y/n): " confirm
    
    if [[ "$confirm" != "y" ]]; then
        print_info "Reset dibatalkan"
        return 0
    fi
    
    # Run reset script
    node scripts/reset-admin-password.js
    
    print_success "Password admin berhasil direset!"
    echo "👤 Username: admin"
    echo "🔑 Password: admin123"
}

# Function to show logs
show_logs() {
    print_info "📋 Menampilkan logs aplikasi"
    
    echo ""
    echo "1. Live logs (real-time)"
    echo "2. Error logs"
    echo "3. Output logs" 
    echo "4. All logs (last 50 lines)"
    
    read -p "Pilih opsi (1-4): " log_choice
    
    case $log_choice in
        1)
            print_info "Menampilkan live logs (Ctrl+C untuk keluar)..."
            pm2 logs absen-guru-production --follow
            ;;
        2)
            print_info "Error logs (50 baris terakhir):"
            pm2 logs absen-guru-production --err --lines 50
            ;;
        3)
            print_info "Output logs (50 baris terakhir):"
            pm2 logs absen-guru-production --out --lines 50
            ;;
        4)
            print_info "All logs (50 baris terakhir):"
            pm2 logs absen-guru-production --lines 50
            ;;
        *)
            print_error "Pilihan tidak valid!"
            ;;
    esac
}

# Function to clean up
cleanup() {
    print_info "🧹 Cleanup temporary files dan cache"
    
    # Clean build cache
    print_info "Cleaning build cache..."
    rm -rf .svelte-kit build node_modules/.vite 2>/dev/null || true
    
    # Clean PM2 logs
    read -p "Clean PM2 logs? (y/n): " clean_logs
    if [[ "$clean_logs" == "y" ]]; then
        pm2 flush absen-guru-production 2>/dev/null || true
        rm -f logs/pm2-*.log 2>/dev/null || true
        print_info "PM2 logs cleaned"
    fi
    
    # Clean old backups (older than 30 days)
    if [[ -d "backups" ]]; then
        print_info "Removing backups older than 30 days..."
        find backups -name "*.db" -mtime +30 -delete 2>/dev/null || true
    fi
    
    print_success "Cleanup selesai!"
}

# Main menu
main_menu() {
    while true; do
        print_header
        show_app_info
        echo ""
        
        echo "Pilih aksi:"
        echo "1.  📊 Status & Info"
        echo "2.  🔄 Update Aplikasi"
        echo "3.  🌐 Ubah Origin/Domain"
        echo "4.  💾 Backup Database"
        echo "5.  📥 Restore Database"
        echo "6.  🔑 Reset Admin Password"
        echo "7.  📋 Lihat Logs"
        echo "8.  🧹 Cleanup"
        echo "9.  🔄 Restart App"
        echo "10. ⏹️  Stop App"
        echo "11. ▶️  Start App"
        echo "0.  🚪 Keluar"
        
        echo ""
        read -p "Pilih opsi (0-11): " choice
        
        case $choice in
            1) show_status ;;
            2) update_app ;;
            3) change_origin ;;
            4) backup_database ;;
            5) restore_database ;;
            6) reset_admin_password ;;
            7) show_logs ;;
            8) cleanup ;;
            9) 
                print_info "Restarting aplikasi..."
                pm2 restart absen-guru-production
                print_success "Aplikasi direstart!"
                ;;
            10)
                print_info "Stopping aplikasi..."
                pm2 stop absen-guru-production
                print_success "Aplikasi dihentikan!"
                ;;
            11)
                print_info "Starting aplikasi..."
                pm2 start absen-guru-production
                print_success "Aplikasi dijalankan!"
                ;;
            0)
                print_info "Keluar dari deployment manager"
                exit 0
                ;;
            *)
                print_error "Pilihan tidak valid!"
                ;;
        esac
        
        echo ""
        read -p "Tekan Enter untuk kembali ke menu..."
    done
}

# Run main menu
main_menu