#!/bin/bash

# =============================================================================
# 🚀 CLOUDFLARE TUNNEL SETUP UNTUK ABSEN-GURU
# =============================================================================
# Script ini akan membantu setup Cloudflare Tunnel untuk aplikasi absen-guru
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
    echo "☁️  CLOUDFLARE TUNNEL SETUP"
    echo "=============================================="
    echo -e "${NC}"
}

# Function to check if cloudflared is installed
check_cloudflared() {
    if ! command -v cloudflared &> /dev/null; then
        print_error "cloudflared tidak ditemukan!"
        echo ""
        print_info "Download cloudflared dari:"
        echo "🌐 https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
        echo ""
        print_info "Atau install dengan package manager:"
        echo "# Ubuntu/Debian:"
        echo "wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb"
        echo "sudo dpkg -i cloudflared-linux-amd64.deb"
        echo ""
        echo "# Windows (dengan chocolatey):"
        echo "choco install cloudflared"
        echo ""
        echo "# macOS:"
        echo "brew install cloudflared"
        exit 1
    fi
}

# Function to create tunnel configuration
create_tunnel_config() {
    local tunnel_name="$1"
    local domain="$2"
    
    print_info "Membuat konfigurasi tunnel..."
    
    mkdir -p ~/.cloudflared
    
    cat > ~/.cloudflared/config.yml << EOF
# Cloudflare Tunnel Configuration untuk Absen-Guru
tunnel: $tunnel_name
credentials-file: ~/.cloudflared/$tunnel_name.json

ingress:
  # Route untuk aplikasi absen-guru
  - hostname: $domain
    service: http://localhost:3000
    
  # Default rule (required)
  - service: http_status:404

# Optional: Logging
# loglevel: info
# transport-loglevel: warn

# Optional: Metrics server
# metrics: 0.0.0.0:9999
EOF
    
    print_success "Konfigurasi tunnel dibuat di ~/.cloudflared/config.yml"
}

# Function to generate systemd service (Linux)
create_systemd_service() {
    local tunnel_name="$1"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_info "Membuat systemd service untuk auto-start..."
        
        sudo tee /etc/systemd/system/cloudflared-$tunnel_name.service > /dev/null << EOF
[Unit]
Description=Cloudflare Tunnel - $tunnel_name
After=network.target

[Service]
Type=simple
User=$USER
ExecStart=/usr/local/bin/cloudflared tunnel --config ~/.cloudflared/config.yml run
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
EOF
        
        sudo systemctl daemon-reload
        sudo systemctl enable cloudflared-$tunnel_name.service
        
        print_success "Systemd service dibuat: cloudflared-$tunnel_name"
        print_info "Untuk start service: sudo systemctl start cloudflared-$tunnel_name"
    fi
}

# Function to generate Windows service batch
create_windows_service() {
    local tunnel_name="$1"
    
    cat > start-tunnel-$tunnel_name.bat << 'EOF'
@echo off
echo Starting Cloudflare Tunnel...
cloudflared tunnel --config %USERPROFILE%\.cloudflared\config.yml run
pause
EOF
    
    print_success "Windows batch file dibuat: start-tunnel-$tunnel_name.bat"
    print_info "Untuk menjalankan tunnel, double-click file tersebut"
}

# Main function
main() {
    print_header
    
    check_cloudflared
    
    echo ""
    print_info "Setup Cloudflare Tunnel untuk Absen-Guru"
    echo ""
    
    # Get tunnel information
    read -p "Nama tunnel [default: absen-guru]: " tunnel_name
    tunnel_name=${tunnel_name:-absen-guru}
    
    read -p "Domain/subdomain (contoh: absen.sdn19periji.sch.id): " domain
    
    if [[ -z "$domain" ]]; then
        print_error "Domain harus diisi!"
        exit 1
    fi
    
    # Remove protocol if present
    domain=${domain#https://}
    domain=${domain#http://}
    
    echo ""
    print_info "=== KONFIGURASI TUNNEL ==="
    echo "Nama Tunnel: $tunnel_name"
    echo "Domain: $domain"
    echo "Target: localhost:3000"
    
    echo ""
    read -p "Lanjutkan setup? (y/n): " confirm
    
    if [[ "$confirm" != "y" ]]; then
        print_info "Setup dibatalkan"
        exit 0
    fi
    
    echo ""
    print_info "🚀 Memulai setup Cloudflare Tunnel..."
    
    # Login to Cloudflare (if not already logged in)
    print_info "Checking Cloudflare login..."
    if ! cloudflared tunnel list &> /dev/null; then
        print_warning "Anda belum login ke Cloudflare"
        print_info "Silakan login terlebih dahulu:"
        cloudflared tunnel login
    fi
    
    # Create tunnel if not exists
    print_info "Membuat tunnel '$tunnel_name'..."
    if cloudflared tunnel list | grep -q "$tunnel_name"; then
        print_warning "Tunnel '$tunnel_name' sudah ada"
    else
        cloudflared tunnel create $tunnel_name
        print_success "Tunnel '$tunnel_name' berhasil dibuat"
    fi
    
    # Create DNS record
    print_info "Membuat DNS record..."
    cloudflared tunnel route dns $tunnel_name $domain
    
    # Create configuration
    create_tunnel_config "$tunnel_name" "$domain"
    
    # Create service files based on OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        create_systemd_service "$tunnel_name"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        create_windows_service "$tunnel_name"
    fi
    
    echo ""
    print_success "🎉 CLOUDFLARE TUNNEL SETUP SELESAI!"
    echo ""
    print_info "=== INFORMASI TUNNEL ==="
    echo "✅ Nama Tunnel: $tunnel_name"
    echo "✅ Domain: https://$domain"
    echo "✅ Target: localhost:3000"
    echo "✅ Config: ~/.cloudflared/config.yml"
    
    echo ""
    print_info "=== LANGKAH SELANJUTNYA ==="
    echo "1. Deploy aplikasi absen-guru dengan origin: https://$domain"
    echo "   ./deploy-production.sh (pilih option 3 - Cloudflare Tunnel)"
    echo ""
    echo "2. Jalankan tunnel:"
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "   sudo systemctl start cloudflared-$tunnel_name"
        echo "   # Atau manual: cloudflared tunnel run $tunnel_name"
    else
        echo "   cloudflared tunnel run $tunnel_name"
        echo "   # Atau double-click: start-tunnel-$tunnel_name.bat"
    fi
    echo ""
    echo "3. Akses aplikasi di: https://$domain"
    
    echo ""
    print_info "=== PERINTAH BERGUNA ==="
    echo "🔍 Status tunnel: cloudflared tunnel list"
    echo "🏃 Run tunnel: cloudflared tunnel run $tunnel_name"
    echo "⏹️  Stop tunnel: Ctrl+C (atau stop systemd service)"
    echo "📋 Logs: cloudflared tunnel --config ~/.cloudflared/config.yml run --loglevel debug"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "🔄 Auto-start: sudo systemctl enable cloudflared-$tunnel_name"
        echo "📊 Service status: sudo systemctl status cloudflared-$tunnel_name"
    fi
    
    echo ""
    print_success "Setup selesai! Jalankan tunnel dan deploy aplikasi. 🚀"
}

# Run main function
main "$@"