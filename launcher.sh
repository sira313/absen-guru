#!/bin/bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                  🏠 ABSEN-GURU LAUNCHER                 ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_menu() {
    echo "Pilih mode deployment:"
    echo ""
    echo -e "${GREEN}[1]${NC} 🖥️  Local Development (localhost:5174)"
    echo -e "${BLUE}[2]${NC} 🌐 Local Network (IP Address + Production)"
    echo -e "${PURPLE}[3]${NC} 🔄 PM2 Local Production (Recommended)"
    echo -e "${PURPLE}[4]${NC} 🔄 PM2 Network Production (Best for 24/7)"
    echo -e "${CYAN}[5]${NC} ☁️  Cloudflare Tunnel (Public Internet)"
    echo -e "${YELLOW}[6]${NC} 🔧 Setup Database Only"
    echo -e "${YELLOW}[7]${NC} 🗑️  Reset Database (Fresh Start)"
    echo -e "${YELLOW}[8]${NC} 📊 PM2 Management (Status/Logs/Stop)"
    echo -e "${RED}[0]${NC} ❌ Exit"
    echo ""
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

get_local_ip() {
    # Try different methods to get local IP
    local ip=""
    
    # Method 1: Windows ipconfig (works in Git Bash)
    if command -v ipconfig &> /dev/null; then
        ip=$(ipconfig | grep -i "IPv4 Address" | grep -E "192\.168\.|10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\." | head -1 | awk -F': ' '{print $2}' | tr -d '\r')
    fi
    
    # Method 2: ip route (Linux)
    if [[ -z "$ip" ]] && command -v ip &> /dev/null; then
        ip=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' | head -1)
    fi
    
    # Method 3: ifconfig (macOS/Linux) - improved pattern
    if [[ -z "$ip" ]] && command -v ifconfig &> /dev/null; then
        ip=$(ifconfig | grep -E 'inet (192\.168\.|10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.)' | grep -v 127.0.0.1 | awk '{print $2}' | head -1)
    fi
    
    # Method 4: hostname -I (Linux)
    if [[ -z "$ip" ]] && command -v hostname &> /dev/null; then
        ip=$(hostname -I 2>/dev/null | awk '{print $1}')
    fi
    
    # Fallback
    if [[ -z "$ip" ]]; then
        ip="127.0.0.1"
    fi
    
    echo "$ip"
}

setup_db_if_needed() {
    if [[ ! -f "absen.db" ]]; then
        print_info "Database not found, creating fresh database..."
        pnpm db:setup
    else
        print_success "Database exists, skipping setup"
    fi
}

local_dev() {
    echo ""
    echo "========================================"
    echo "🖥️  STARTING LOCAL DEVELOPMENT"
    echo "========================================"
    echo ""
    
    print_info "[1/3] Installing dependencies..."
    pnpm install || { print_error "Failed to install dependencies"; exit 1; }
    
    print_info "[2/3] Setting up database..."
    setup_db_if_needed
    
    print_info "[3/3] Starting development server..."
    echo ""
    print_success "Server akan berjalan di: http://localhost:5174"
    print_info "📝 Tekan Ctrl+C untuk stop"
    echo ""
    
    pnpm dev --port 5174
}

network_prod() {
    echo ""
    echo "========================================"
    echo "🌐 STARTING LOCAL NETWORK PRODUCTION"
    echo "========================================"
    echo ""
    
    print_info "[1/4] Detecting IP address..."
    LOCAL_IP=$(get_local_ip)
    ORIGIN="http://$LOCAL_IP:3000"
    
    print_success "IP detected: $LOCAL_IP"
    print_success "ORIGIN: $ORIGIN"
    echo ""
    
    print_info "[2/4] Installing dependencies..."
    pnpm install || { print_error "Failed to install dependencies"; exit 1; }
    
    print_info "[3/4] Setting up database..."
    setup_db_if_needed
    
    print_info "[4/4] Building and starting..."
    pnpm build || { print_error "Build failed"; exit 1; }
    
    echo ""
    print_success "Server berjalan di: $ORIGIN"
    print_success "📱 Akses dari device lain: $ORIGIN"
    print_info "📝 Tekan Ctrl+C untuk stop"
    echo ""
    
    export NODE_ENV=production
    export ORIGIN="$ORIGIN"
    pnpm start
}

pm2_local() {
    echo ""
    echo "========================================"
    echo "🔄 STARTING PM2 LOCAL PRODUCTION"
    echo "========================================"
    echo ""
    
    if ! command -v pm2 &> /dev/null; then
        print_error "PM2 tidak ditemukan!"
        print_info "Installing PM2 globally..."
        npm install -g pm2 || { print_error "Failed to install PM2"; return; }
    fi
    
    print_info "[1/4] Installing dependencies..."
    pnpm install || { print_error "Failed to install dependencies"; exit 1; }
    
    print_info "[2/4] Setting up database..."
    setup_db_if_needed
    
    print_info "[3/4] Building application..."
    pnpm build || { print_error "Build failed"; exit 1; }
    
    print_info "[4/4] Starting with PM2..."
    pm2 stop absen-guru 2>/dev/null || true
    pm2 delete absen-guru 2>/dev/null || true
    pnpm pm2:start
    
    echo ""
    print_success "🔄 Server berjalan di: http://localhost:3000"
    print_success "📊 Monitor dengan: pm2 monit"
    print_success "📝 Logs dengan: pm2 logs"
    print_info "📋 Gunakan opsi [8] untuk PM2 management"
    echo ""
    
    read -p "Press Enter to continue..."
}

pm2_network() {
    echo ""
    echo "========================================"
    echo "🔄 STARTING PM2 NETWORK PRODUCTION" 
    echo "========================================"
    echo ""
    
    if ! command -v pm2 &> /dev/null; then
        print_error "PM2 tidak ditemukan!"
        print_info "Installing PM2 globally..."
        npm install -g pm2 || { print_error "Failed to install PM2"; return; }
    fi
    
    print_info "[1/5] Detecting IP address..."
    LOCAL_IP=$(get_local_ip)
    ORIGIN="http://$LOCAL_IP:3000"
    
    print_success "IP detected: $LOCAL_IP"
    print_success "ORIGIN: $ORIGIN"
    echo ""
    
    print_info "[2/5] Installing dependencies..."
    pnpm install || { print_error "Failed to install dependencies"; exit 1; }
    
    print_info "[3/5] Setting up database..."
    setup_db_if_needed
    
    print_info "[4/5] Building application..."
    pnpm build || { print_error "Build failed"; exit 1; }
    
    print_info "[5/5] Starting with PM2..."
    pm2 stop absen-guru 2>/dev/null || true
    pm2 delete absen-guru 2>/dev/null || true
    
    export ORIGIN="$ORIGIN"
    pnpm pm2:start:network
    
    echo ""
    print_success "🔄 Server berjalan di: $ORIGIN"
    print_success "📱 Akses dari device lain: $ORIGIN"
    print_success "📊 Monitor dengan: pm2 monit"
    print_success "📝 Logs dengan: pm2 logs"
    print_info "📋 Gunakan opsi [8] untuk PM2 management"
    echo ""
    
    read -p "Press Enter to continue..."
}

cloudflare_tunnel() {
    echo ""
    echo "========================================"
    echo "☁️  CLOUDFLARE TUNNEL SETUP"
    echo "========================================"
    echo ""
    
    if ! command -v cloudflared &> /dev/null; then
        print_error "cloudflared tidak ditemukan!"
        echo ""
        print_info "Install cloudflared terlebih dahulu:"
        echo "🌐 https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
        echo ""
        read -p "Press Enter to continue..."
        return
    fi
    
    print_info "[1/4] Installing dependencies..."
    pnpm install || { print_error "Failed to install dependencies"; exit 1; }
    
    print_info "[2/4] Setting up database..."
    setup_db_if_needed
    
    print_info "[3/4] Building application..."
    pnpm build || { print_error "Build failed"; exit 1; }
    
    print_info "[4/4] Starting tunnel..."
    pnpm start &
    SERVER_PID=$!
    
    sleep 3
    
    echo ""
    print_success "Tunnel akan dimulai, ikuti instruksi cloudflare"
    print_success "🌐 Aplikasi akan dapat diakses dari internet"
    echo ""
    
    trap "kill $SERVER_PID 2>/dev/null" EXIT
    cloudflared tunnel --url localhost:3000
}

setup_database() {
    echo ""
    echo "========================================"
    echo "🔧 DATABASE SETUP ONLY"
    echo "========================================"
    echo ""
    
    print_info "[1/2] Installing dependencies..."
    pnpm install || { print_error "Failed to install dependencies"; exit 1; }
    
    print_info "[2/2] Setting up database..."
    pnpm db:setup
    
    echo ""
    print_success "Database setup completed!"
    print_info "Default login: admin / admin123"
    read -p "Press Enter to continue..."
}

reset_database() {
    echo ""
    echo "========================================"
    echo "🗑️  RESET DATABASE (FRESH START)"
    echo "========================================"
    echo ""
    
    print_warning "⚠️  This will DELETE all existing data!"
    print_info "All users, attendance records, and settings will be lost."
    echo ""
    
    read -p "Are you sure? Type 'yes' to continue: " confirm
    
    if [[ "$confirm" != "yes" ]]; then
        print_info "Reset cancelled."
        read -p "Press Enter to continue..."
        return
    fi
    
    print_info "[1/3] Installing dependencies..."
    pnpm install || { print_error "Failed to install dependencies"; exit 1; }
    
    print_info "[2/3] Removing old database..."
    rm -f absen.db
    print_success "Old database removed"
    
    print_info "[3/3] Setting up fresh database..."
    pnpm db:setup
    
    echo ""
    print_success "🗑️  Database reset completed!"
    print_success "Fresh database with default admin user created"
    print_info "Default login: admin / admin123"
    echo ""
    
    read -p "Press Enter to continue..."
}

pm2_management() {
    echo ""
    echo "========================================"
    echo "📊 PM2 MANAGEMENT"
    echo "========================================"
    echo ""
    
    if ! command -v pm2 &> /dev/null; then
        print_error "PM2 tidak ditemukan!"
        return
    fi
    
    echo "Pilih aksi PM2:"
    echo ""
    echo -e "${GREEN}[1]${NC} 📊 Status (pm2 status)"
    echo -e "${BLUE}[2]${NC} 📝 Logs (pm2 logs)"
    echo -e "${PURPLE}[3]${NC} 📈 Monitor (pm2 monit)"
    echo -e "${YELLOW}[4]${NC} 🔄 Restart (pm2 restart)"
    echo -e "${RED}[5]${NC} ⏹️  Stop (pm2 stop)"
    echo -e "${RED}[6]${NC} 🗑️  Delete (pm2 delete)"
    echo -e "${CYAN}[7]${NC} 💾 Save Config (pm2 save)"
    echo -e "${GREEN}[8]${NC} 🚀 Startup Script (pm2 startup)"
    echo -e "${YELLOW}[0]${NC} ← Back to main menu"
    echo ""
    
    read -p "Masukkan pilihan (0-8): " pm2_choice
    
    case $pm2_choice in
        1)
            echo ""
            pm2 status
            echo ""
            read -p "Press Enter to continue..."
            ;;
        2)
            echo ""
            print_info "Showing logs (Ctrl+C to exit)..."
            pm2 logs
            ;;
        3)
            echo ""
            print_info "Opening monitor (q to quit)..."
            pm2 monit
            ;;
        4)
            echo ""
            pm2 restart absen-guru
            print_success "Application restarted!"
            read -p "Press Enter to continue..."
            ;;
        5)
            echo ""
            pm2 stop absen-guru
            print_success "Application stopped!"
            read -p "Press Enter to continue..."
            ;;
        6)
            echo ""
            pm2 stop absen-guru 2>/dev/null || true
            pm2 delete absen-guru 2>/dev/null || true
            print_success "Application deleted from PM2!"
            read -p "Press Enter to continue..."
            ;;
        7)
            echo ""
            pm2 save
            print_success "PM2 configuration saved!"
            read -p "Press Enter to continue..."
            ;;
        8)
            echo ""
            print_info "Setting up PM2 startup script..."
            pm2 startup
            echo ""
            print_warning "Jalankan command yang ditampilkan di atas dengan sudo (jika diminta)"
            read -p "Press Enter to continue..."
            ;;
        0)
            return
            ;;
        *)
            print_error "Pilihan tidak valid!"
            sleep 2
            pm2_management
            ;;
    esac
}

main() {
    while true; do
        clear
        print_header
        print_menu
        
        read -p "Masukkan pilihan (0-8): " choice
        
        case $choice in
            1)
                local_dev
                break
                ;;
            2)
                network_prod
                break
                ;;
            3)
                pm2_local
                ;;
            4)
                pm2_network
                ;;
            5)
                cloudflare_tunnel
                break
                ;;
            6)
                setup_database
                ;;
            7)
                reset_database
                ;;
            8)
                pm2_management
                ;;
            0)
                echo ""
                print_info "👋 Goodbye!"
                exit 0
                ;;
            *)
                print_error "Pilihan tidak valid!"
                sleep 2
                ;;
        esac
    done
}

main