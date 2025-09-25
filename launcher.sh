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
    printf "${BLUE}\n"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                  🏠 ABSEN-GURU LAUNCHER                 ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    printf "${NC}\n"
}

print_menu() {
    echo "Pilih mode deployment:"
    echo ""
    echo "[1] 🖥️  Local Development (localhost:5174)"
    echo "[2] 🌐 Local Network (IP Address + Production)"
    echo "[3] 🔄 PM2 Local Production (Recommended)"
    echo "[4] 🔄 PM2 Network Production (Best for 24/7)"
    echo ""
    echo "📡 CLOUDFLARE TUNNEL (Internet Access):"
    echo "[5] ☁️  Interactive Mode (Testing/Debug)"
    echo "[6] 🔄 Background Service (Production 24/7)"
    echo ""
    echo "[7] 🔧 Setup Database Only"
    echo "[8] 🗑️  Reset Database (Fresh Start)"
    echo "[9] 📊 PM2 Management (Status/Logs/Stop)"
    echo "[0] ❌ Exit"
    echo ""
    
    print_info "💡 Tips:"
    echo "  • Opsi 5: Manual start/stop, real-time logs"
    echo "  • Opsi 6: Auto-restart, background service, production-ready"
    echo ""
}

print_info() {
    printf "${BLUE}ℹ️  $1${NC}\n"
}

print_success() {
    printf "${GREEN}✅ $1${NC}\n"
}

print_error() {
    printf "${RED}❌ $1${NC}\n"
}

print_warning() {
    printf "${YELLOW}⚠️  $1${NC}\n"
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
    if [ ! -f "absen.db" ]; then
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
    
    printf "Press Enter to continue..."; read dummy
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
    
    printf "Press Enter to continue..."; read dummy
}

cloudflare_tunnel() {
    echo ""
    echo "========================================"
    echo "☁️  CLOUDFLARE TUNNEL SETUP"
    echo "========================================"
    echo ""
    
    # Check cloudflared
    if ! check_cloudflared; then
        return
    fi
    
    print_success "cloudflared found at: $CLOUDFLARED_PATH"
    
    # Tunnel type selection
    echo ""
    echo "Pilih jenis tunnel:"
    echo "[1] 🚀 Quick Tunnel (Random URL, tidak perlu setup)"
    echo "[2] 🏷️  Named Tunnel (Custom domain, perlu setup sekali)"
    echo "[3] 🔧 Setup Cloudflare dulu (untuk Named Tunnel)"
    echo "[0] ❌ Cancel"
    echo ""
    
    printf "Masukkan pilihan (0-3): "
    read tunnel_choice
    
    case $tunnel_choice in
        1)
            cloudflare_quick_tunnel
            ;;
        2)
            cloudflare_named_tunnel
            ;;
        3)
            setup_cloudflare_first_time
            printf "Press Enter to continue..."; read dummy
            ;;
        0)
            return
            ;;
        *)
            print_error "Pilihan tidak valid!"
            return
            ;;
    esac
}

cloudflare_quick_tunnel() {
    echo ""
    echo "🚀 Starting Quick Tunnel..."
    
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
    print_success "🌐 Quick tunnel akan dimulai dengan URL random"
    print_warning "⚠️  URL akan berubah setiap restart"
    echo ""
    
    trap "kill $SERVER_PID 2>/dev/null" EXIT
    "$CLOUDFLARED_PATH" tunnel --url localhost:3000
}

cloudflare_named_tunnel() {
    echo ""
    echo "🏷️  Named Tunnel Setup"
    echo ""
    
    # Check if logged in
    if ! "$CLOUDFLARED_PATH" tunnel list >/dev/null 2>&1; then
        print_warning "Belum login ke Cloudflare!"
        echo ""
        print_info "Langkah-langkah setup:"
        echo "1. Login ke Cloudflare: cloudflared tunnel login"
        echo "2. Buat tunnel: cloudflared tunnel create absen-guru"
        echo "3. Set DNS record: cloudflared tunnel route dns absen-guru YOUR-DOMAIN.com"
        echo "4. Jalankan lagi launcher ini"
        echo ""
        
        printf "Mau login sekarang? (y/n): "
        read login_choice
        
        if [[ "$login_choice" == "y" || "$login_choice" == "Y" ]]; then
            echo ""
            print_info "Membuka browser untuk login..."
            "$CLOUDFLARED_PATH" tunnel login
            echo ""
            printf "Sudah login? (y/n): "
            read login_done
            
            if [[ "$login_done" != "y" && "$login_done" != "Y" ]]; then
                print_error "Setup dibatalkan"
                return
            fi
        else
            print_error "Setup dibatalkan - login diperlukan"
            return
        fi
    fi
    
    # Check existing tunnels
    echo ""
    print_info "Checking existing tunnels..."
    
    TUNNEL_NAME="absen-guru"
    TUNNEL_EXISTS=$("$CLOUDFLARED_PATH" tunnel list | grep -c "$TUNNEL_NAME" || echo "0")
    
    if [ "$TUNNEL_EXISTS" -eq 0 ]; then
        print_warning "Tunnel '$TUNNEL_NAME' belum ada"
        echo ""
        printf "Buat tunnel baru '$TUNNEL_NAME'? (y/n): "
        read create_choice
        
        if [[ "$create_choice" == "y" || "$create_choice" == "Y" ]]; then
            print_info "Membuat tunnel '$TUNNEL_NAME'..."
            "$CLOUDFLARED_PATH" tunnel create "$TUNNEL_NAME"
            if [ $? -ne 0 ]; then
                print_error "Gagal membuat tunnel"
                return
            fi
        else
            print_error "Setup dibatalkan"
            return
        fi
    else
        print_success "Tunnel '$TUNNEL_NAME' sudah ada"
    fi
    
    # Get domain
    echo ""
    printf "Masukkan domain (contoh: absen.yourschool.sch.id): "
    read DOMAIN
    
    if [ -z "$DOMAIN" ]; then
        print_error "Domain tidak boleh kosong!"
        return
    fi
    
    # Create config file
    CONFIG_DIR="$HOME/.cloudflared"
    CONFIG_FILE="$CONFIG_DIR/config.yml"
    
    mkdir -p "$CONFIG_DIR"
    
    echo ""
    print_info "Membuat konfigurasi tunnel..."
    
    TUNNEL_ID=$("$CLOUDFLARED_PATH" tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
    
    cat > "$CONFIG_FILE" << EOF
tunnel: $TUNNEL_ID
credentials-file: $CONFIG_DIR/$TUNNEL_ID.json

ingress:
  - hostname: $DOMAIN
    service: http://localhost:3000
  - service: http_status:404
EOF
    
    print_success "Konfigurasi dibuat di: $CONFIG_FILE"
    
    # Auto-create DNS record
    echo ""
    print_info "🌐 Setting up DNS record..."
    DNS_RESULT=$("$CLOUDFLARED_PATH" tunnel route dns "$TUNNEL_NAME" "$DOMAIN" 2>&1)
    if echo "$DNS_RESULT" | grep -q "Added CNAME\|already exists"; then
        print_success "✅ DNS record configured for $DOMAIN"
    else
        print_warning "⚠️  DNS setup may have failed, but continuing..."
        echo "DNS Result: $DNS_RESULT"
    fi
    
    # Start application and tunnel
    echo ""
    print_info "[1/3] Installing dependencies..."
    pnpm install || { print_error "Failed to install dependencies"; exit 1; }
    
    print_info "[2/3] Setting up database..."
    setup_db_if_needed
    
    print_info "[3/3] Building application..."
    pnpm build || { print_error "Build failed"; exit 1; }
    
    echo ""
    print_info "Starting application and tunnel..."
    pnpm start &
    SERVER_PID=$!
    
    sleep 3
    
    echo ""
    print_success "🌐 Named tunnel dimulai!"
    print_success "Domain: https://$DOMAIN"
    print_info "Tunnel: $TUNNEL_NAME"
    echo ""
    
    trap "kill $SERVER_PID 2>/dev/null" EXIT
    "$CLOUDFLARED_PATH" tunnel run "$TUNNEL_NAME"
}

check_cloudflared() {
    CLOUDFLARED_PATH=""
    if command -v cloudflared >/dev/null 2>&1; then
        CLOUDFLARED_PATH=$(command -v cloudflared)
    elif [ -f "/c/Program Files (x86)/cloudflared/cloudflared" ]; then
        CLOUDFLARED_PATH="/c/Program Files (x86)/cloudflared/cloudflared"
    elif [ -f "/c/Program Files/cloudflared/cloudflared" ]; then
        CLOUDFLARED_PATH="/c/Program Files/cloudflared/cloudflared"
    elif [ -f "/usr/local/bin/cloudflared" ]; then
        CLOUDFLARED_PATH="/usr/local/bin/cloudflared"
    elif [ -f "/usr/bin/cloudflared" ]; then
        CLOUDFLARED_PATH="/usr/bin/cloudflared"
    fi
    
    if [ -z "$CLOUDFLARED_PATH" ]; then
        print_error "cloudflared tidak ditemukan!"
        echo ""
        print_info "Install cloudflared terlebih dahulu:"
        echo "🌐 https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
        echo ""
        printf "Press Enter to continue..."; read dummy
        return 1
    fi
    
    return 0
}

setup_cloudflare_first_time() {
    echo ""
    print_info "🔧 SETUP CLOUDFLARE (One-time setup)"
    echo ""
    
    # Check if already setup
    if "$CLOUDFLARED_PATH" tunnel list >/dev/null 2>&1; then
        TUNNEL_EXISTS=$("$CLOUDFLARED_PATH" tunnel list | grep -c "absen-guru" || echo "0")
        if [ "$TUNNEL_EXISTS" -gt 0 ]; then
            print_success "✅ Cloudflare sudah ter-setup!"
            return 0
        fi
    fi
    
    print_warning "⚠️  Setup Cloudflare diperlukan (hanya sekali)"
    echo ""
    print_info "Langkah yang akan dilakukan:"
    echo "1. Login ke akun Cloudflare gratis"
    echo "2. Buat tunnel 'absen-guru'"  
    echo "3. Setup DNS untuk domain kustom (opsional)"
    echo ""
    
    printf "Lanjutkan setup? (y/n): "
    read setup_choice
    
    if [[ "$setup_choice" != "y" && "$setup_choice" != "Y" ]]; then
        print_info "Setup dibatalkan - gunakan Quick Tunnel tanpa setup"
        return 1
    fi
    
    echo ""
    print_info "💻 Membuka browser untuk login Cloudflare..."
    "$CLOUDFLARED_PATH" tunnel login
    
    if [ $? -ne 0 ]; then
        print_error "Login gagal!"
        return 1
    fi
    
    echo ""
    printf "Sudah login berhasil? (y/n): "
    read login_ok
    
    if [[ "$login_ok" != "y" && "$login_ok" != "Y" ]]; then
        print_error "Setup dibatalkan"
        return 1
    fi
    
    echo ""
    print_info "🚇 Membuat tunnel 'absen-guru'..."
    "$CLOUDFLARED_PATH" tunnel create absen-guru
    
    if [ $? -ne 0 ]; then
        print_error "Gagal membuat tunnel!"
        return 1
    fi
    
    echo ""
    print_success "✅ Setup Cloudflare berhasil!"
    print_info "Tunnel 'absen-guru' sudah dibuat dan siap digunakan"
    echo ""
    
    return 0
}

pm2_cloudflare_tunnel() {
    echo ""
    echo "========================================"
    echo "🔄 PM2 + CLOUDFLARE TUNNEL SERVICE"
    echo "========================================"
    echo ""
    
    # Check PM2
    if ! command -v pm2 >/dev/null 2>&1; then
        print_error "PM2 tidak ditemukan!"
        print_info "Install PM2: npm install -g pm2"
        printf "Press Enter to continue..."; read dummy
        return
    fi
    
    # Check cloudflared
    if ! check_cloudflared; then
        return
    fi
    
    print_success "PM2 found: $(command -v pm2)"
    print_success "cloudflared found: $CLOUDFLARED_PATH"
    
    # Tunnel type selection
    echo ""
    echo "Pilih jenis tunnel untuk PM2 service:"
    echo "[1] 🚀 Quick Tunnel Service (Random URL, tidak perlu setup)"
    echo "[2] 🏷️  Named Tunnel Service (Custom domain, perlu setup sekali)"
    echo "[3] 🔧 Setup Cloudflare dulu (untuk Named Tunnel)"
    echo "[0] ❌ Cancel"
    echo ""
    
    printf "Masukkan pilihan (0-3): "
    read tunnel_choice
    
    case $tunnel_choice in
        1)
            pm2_quick_tunnel_service
            ;;
        2)
            pm2_named_tunnel_service
            ;;
        3)
            setup_cloudflare_first_time
            ;;
        0)
            return
            ;;
        *)
            print_error "Pilihan tidak valid!"
            return
            ;;
    esac
}

pm2_quick_tunnel_service() {
    echo ""
    echo "🚀 Setting up PM2 Quick Tunnel Service..."
    
    print_info "[1/4] Installing dependencies..."
    pnpm install || { print_error "Failed to install dependencies"; exit 1; }
    
    print_info "[2/4] Setting up database..."
    setup_db_if_needed
    
    print_info "[3/4] Building application..."
    pnpm build || { print_error "Build failed"; exit 1; }
    
    # Stop existing services
    pm2 stop absen-guru-app 2>/dev/null || true
    pm2 stop absen-guru-tunnel 2>/dev/null || true
    pm2 delete absen-guru-app 2>/dev/null || true
    pm2 delete absen-guru-tunnel 2>/dev/null || true
    
    print_info "[4/4] Starting PM2 services..."
    
    # Start application
    pm2 start "node build/index.js" --name "absen-guru-app" --env production
    
    # Wait for app to start
    sleep 3
    
    # Start cloudflare tunnel
    pm2 start "$CLOUDFLARED_PATH tunnel --url localhost:3000" --name "absen-guru-tunnel"
    
    # Save PM2 configuration
    pm2 save
    
    echo ""
    print_success "🎉 PM2 + Quick Tunnel Service berhasil dimulai!"
    echo ""
    print_info "Services yang berjalan:"
    echo "  • absen-guru-app (Node.js application)"
    echo "  • absen-guru-tunnel (Cloudflare tunnel)"
    echo ""
    print_info "Perintah berguna:"
    echo "  • pm2 status              - Lihat status services"
    echo "  • pm2 logs absen-guru-app - Lihat logs aplikasi"
    echo "  • pm2 logs absen-guru-tunnel - Lihat logs tunnel"
    echo "  • pm2 restart all         - Restart semua services"
    echo "  • pm2 stop all            - Stop semua services"
    echo ""
    
    # Show tunnel URL
    sleep 5
    echo "🔍 Mencari tunnel URL..."
    pm2 logs absen-guru-tunnel --lines 20 | grep -o "https://[^[:space:]]*\.trycloudflare\.com" | head -1 || echo "URL akan muncul dalam beberapa saat di pm2 logs absen-guru-tunnel"
    
    printf "Press Enter to continue..."; read dummy
}

pm2_named_tunnel_service() {
    echo ""
    echo "🏷️  Setting up PM2 Named Tunnel Service..."
    
    # Check if logged in and tunnel exists
    if ! "$CLOUDFLARED_PATH" tunnel list >/dev/null 2>&1; then
        print_warning "Belum login ke Cloudflare atau tunnel belum dibuat!"
        echo ""
        print_info "Setup manual diperlukan:"
        echo "1. cloudflared tunnel login"
        echo "2. cloudflared tunnel create absen-guru"
        echo "3. cloudflared tunnel route dns absen-guru YOUR-DOMAIN.com"
        echo "4. Jalankan lagi opsi ini"
        printf "Press Enter to continue..."; read dummy
        return
    fi
    
    TUNNEL_NAME="absen-guru"
    TUNNEL_EXISTS=$("$CLOUDFLARED_PATH" tunnel list | grep -c "$TUNNEL_NAME" || echo "0")
    
    if [ "$TUNNEL_EXISTS" -eq 0 ]; then
        print_error "Tunnel '$TUNNEL_NAME' tidak ditemukan!"
        echo ""
        print_info "Buat tunnel terlebih dahulu:"
        echo "cloudflared tunnel create $TUNNEL_NAME"
        printf "Press Enter to continue..."; read dummy
        return
    fi
    
    # Get domain
    echo ""
    printf "Masukkan domain (contoh: absen.yourschool.sch.id): "
    read DOMAIN
    
    if [ -z "$DOMAIN" ]; then
        print_error "Domain tidak boleh kosong!"
        return
    fi
    
    # Get tunnel ID
    TUNNEL_ID=$("$CLOUDFLARED_PATH" tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
    
    # Auto-create DNS record
    echo ""
    print_info "🌐 Setting up DNS record..."
    "$CLOUDFLARED_PATH" tunnel route dns "$TUNNEL_NAME" "$DOMAIN" 2>/dev/null && {
        print_success "✅ DNS record created for $DOMAIN"
    } || {
        print_warning "⚠️  DNS record already exists or failed (continuing anyway)"
    }
    
    # Force update config
    CONFIG_DIR="$HOME/.cloudflared"
    CONFIG_FILE="$CONFIG_DIR/config.yml"
    
    print_info "📝 Creating/updating tunnel configuration..."
    mkdir -p "$CONFIG_DIR"
    
    cat > "$CONFIG_FILE" << EOF
tunnel: $TUNNEL_ID
credentials-file: $CONFIG_DIR/$TUNNEL_ID.json

ingress:
  - hostname: $DOMAIN
    service: http://localhost:3000
  - service: http_status:404
EOF
    
    print_success "✅ Configuration updated: $CONFIG_FILE"
    
    print_info "[1/4] Installing dependencies..."
    pnpm install || { print_error "Failed to install dependencies"; exit 1; }
    
    print_info "[2/4] Setting up database..."
    setup_db_if_needed
    
    print_info "[3/4] Building application..."
    pnpm build || { print_error "Build failed"; exit 1; }
    
    # Stop existing services
    pm2 stop absen-guru-app 2>/dev/null || true
    pm2 stop absen-guru-tunnel 2>/dev/null || true
    pm2 delete absen-guru-app 2>/dev/null || true
    pm2 delete absen-guru-tunnel 2>/dev/null || true
    
    print_info "[4/4] Starting PM2 services..."
    
    # Start application
    pm2 start "node build/index.js" --name "absen-guru-app" --env production
    
    # Wait for app to start
    sleep 3
    
    # Start named tunnel
    pm2 start "$CLOUDFLARED_PATH tunnel run $TUNNEL_NAME" --name "absen-guru-tunnel"
    
    # Save PM2 configuration
    pm2 save
    
    echo ""
    print_success "🎉 PM2 + Named Tunnel Service berhasil dimulai!"
    echo ""
    print_success "🌐 Domain: https://$DOMAIN"
    print_info "🔗 Tunnel ID: $TUNNEL_ID"
    echo ""
    
    # DNS validation check
    print_info "🔍 Testing DNS resolution..."
    sleep 5
    
    DNS_CHECK=$(nslookup "$DOMAIN" 8.8.8.8 2>/dev/null)
    if echo "$DNS_CHECK" | grep -q "104.21\|172.67\|cloudflare"; then
        print_success "✅ DNS sudah aktif dan mengarah ke Cloudflare!"
        echo ""
        print_info "🚀 Website siap: https://$DOMAIN"
        echo ""
        print_warning "⚠️  Jika browser error 'ERR_FAILED':"
        echo "  • Clear browser DNS cache: chrome://net-internals/#dns"
        echo "  • Flush Windows DNS: ipconfig /flushdns"
        echo "  • Coba incognito/private mode"
        echo "  • Ganti DNS Windows ke 8.8.8.8"
    else
        print_warning "⚠️  DNS belum propagate (normal, butuh 5-15 menit)"
        echo ""
        print_info "💡 Solusi sementara:"
        echo "  • Test tunnel: cloudflared tunnel info $TUNNEL_NAME"
        echo "  • Tunggu 5-15 menit untuk DNS propagation"
        echo ""
        print_info "🔍 Monitor DNS:"
        echo "  • nslookup $DOMAIN 8.8.8.8"
        echo "  • Online check: https://dnschecker.org/#CNAME/$DOMAIN"
    fi
    
    echo ""
    print_info "📊 Services yang berjalan:"
    echo "  • absen-guru-app (Node.js application)"
    echo "  • absen-guru-tunnel (Cloudflare named tunnel)"
    echo ""
    print_info "🛠️  Perintah berguna:"
    echo "  • pm2 status              - Lihat status services"
    echo "  • pm2 logs absen-guru-app - Logs aplikasi"
    echo "  • pm2 logs absen-guru-tunnel - Logs tunnel"
    echo "  • pm2 restart all         - Restart semua services"
    echo ""
    
    printf "Press Enter to continue..."; read dummy
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
    printf "Press Enter to continue..."; read dummy
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
    
    printf "Are you sure? Type 'yes' to continue: "; read confirm
    
    if [[ "$confirm" != "yes" ]]; then
        print_info "Reset cancelled."
        printf "Press Enter to continue..."; read dummy
        return
    fi
    
    print_info "[1/3] Installing dependencies..."
    pnpm install || { print_error "Failed to install dependencies"; exit 1; }
    
    print_info "[2/3] Removing old database..."
    rm -f absen.db
    print_success "Old database removed"
    
    print_info "[3/3] Setting up fresh database..."
    pnpm db:setup
    
    # Restart PM2 services jika ada yang berjalan
    if command -v pm2 &> /dev/null && pm2 list 2>/dev/null | grep -q "absen-guru-app"; then
        print_info "[4/4] Restarting PM2 services..."
        pm2 restart absen-guru-app 2>/dev/null || echo "No app service to restart"
        print_success "PM2 services restarted with fresh database"
    fi
    
    echo ""
    print_success "🗑️  Database reset completed!"
    print_success "Fresh database with default admin user created"
    print_info "Default login: admin / admin123"
    echo ""
    
    printf "Press Enter to continue..."; read dummy
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
    echo -e "${BLUE}[2]${NC} 📝 Logs App (pm2 logs absen-guru)"
    echo -e "${BLUE}[3]${NC} 📝 Logs Tunnel (pm2 logs absen-guru-tunnel)"
    echo -e "${PURPLE}[4]${NC} 📈 Monitor (pm2 monit)"
    echo -e "${YELLOW}[5]${NC} 🔄 Restart All (pm2 restart all)"
    echo -e "${YELLOW}[6]${NC} 🔄 Restart App Only (pm2 restart absen-guru)"
    echo -e "${RED}[7]${NC} ⏹️  Stop All (pm2 stop all)"
    echo -e "${RED}[8]${NC} 🗑️  Delete All (pm2 delete all)"
    echo -e "${CYAN}[9]${NC} 💾 Save Config (pm2 save)"
    echo -e "${GREEN}[10]${NC} 🚀 Startup Script (pm2 startup)"
    echo -e "${YELLOW}[0]${NC} ← Back to main menu"
    echo ""
    
    printf "Masukkan pilihan (0-10): "; read pm2_choice
    
    case $pm2_choice in
        1)
            echo ""
            pm2 status
            echo ""
            printf "Press Enter to continue..."; read dummy
            ;;
        2)
            echo ""
            print_info "Showing app logs..."
            pm2 logs absen-guru-app --lines 50 2>/dev/null || pm2 logs absen-guru --lines 50 2>/dev/null || echo "No app logs found"
            printf "Press Enter to continue..."; read dummy
            ;;
        3)
            echo ""
            print_info "Showing tunnel logs..."
            pm2 logs absen-guru-tunnel --lines 50 2>/dev/null || echo "No tunnel logs found"
            printf "Press Enter to continue..."; read dummy
            ;;
        4)
            echo ""
            print_info "Opening monitor (q to quit)..."
            pm2 monit
            ;;
        5)
            echo ""
            pm2 restart all
            print_success "All services restarted!"
            printf "Press Enter to continue..."; read dummy
            ;;
        6)
            echo ""
            pm2 restart absen-guru-app 2>/dev/null || pm2 restart absen-guru 2>/dev/null || echo "No app to restart"
            print_success "Application restarted!"
            printf "Press Enter to continue..."; read dummy
            ;;
        7)
            echo ""
            pm2 stop all
            print_success "All services stopped!"
            printf "Press Enter to continue..."; read dummy
            ;;
        8)
            echo ""
            pm2 stop absen-guru-app absen-guru-tunnel absen-guru 2>/dev/null || true
            pm2 delete absen-guru-app absen-guru-tunnel absen-guru 2>/dev/null || true
            print_success "All services deleted from PM2!"
            printf "Press Enter to continue..."; read dummy
            ;;
        9)
            echo ""
            pm2 save
            print_success "PM2 configuration saved!"
            printf "Press Enter to continue..."; read dummy
            ;;
        10)
            echo ""
            print_info "Setting up PM2 startup script..."
            pm2 startup
            echo ""
            print_warning "Jalankan command yang ditampilkan di atas dengan sudo (jika diminta)"
            printf "Press Enter to continue..."; read dummy
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
        
        printf "Masukkan pilihan (0-9): "; read choice
        
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
                pm2_cloudflare_tunnel
                ;;
            7)
                setup_database
                ;;
            8)
                reset_database
                ;;
            9)
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