#!/bin/bash

# =============================================================================
# 🚀 ABSEN-GURU PRODUCTION DEPLOYMENT SCRIPT
# =============================================================================
# Script ini akan membantu Anda deploy aplikasi absen-guru dengan mudah
# Mendukung: Local network, Domain/subdomain, Cloudflare Tunnel
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
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
    echo "🚀 ABSEN-GURU PRODUCTION DEPLOYMENT"
    echo "=============================================="
    echo -e "${NC}"
}

# Function to detect local IP
get_local_ip() {
    # Try different methods to get local IP
    local ip=""
    
    # Method 1: ip route (Linux)
    if command -v ip &> /dev/null; then
        ip=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || true)
    fi
    
    # Method 2: hostname -I (Linux)
    if [[ -z "$ip" ]] && command -v hostname &> /dev/null; then
        ip=$(hostname -I 2>/dev/null | awk '{print $1}' || true)
    fi
    
    # Method 3: ifconfig (Linux/macOS)
    if [[ -z "$ip" ]] && command -v ifconfig &> /dev/null; then
        ip=$(ifconfig 2>/dev/null | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1 || true)
    fi
    
    # Method 4: PowerShell (Windows)
    if [[ -z "$ip" ]] && command -v powershell.exe &> /dev/null; then
        ip=$(powershell.exe -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notmatch 'Loopback'}).IPAddress" 2>/dev/null | head -1 | tr -d '\r' || true)
    fi
    
    # Default fallback
    if [[ -z "$ip" ]]; then
        ip="192.168.1.100"
    fi
    
    echo "$ip"
}

# Function to validate URL format
validate_origin() {
    local origin="$1"
    if [[ "$origin" =~ ^https?://[a-zA-Z0-9.-]+(:[0-9]+)?$ ]] || [[ "$origin" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+(:[0-9]+)?$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to check if PM2 is installed
check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        print_error "PM2 tidak ditemukan!"
        print_info "Menginstall PM2 global..."
        npm install -g pm2
        print_success "PM2 berhasil diinstall"
    fi
}

# Function to check if pnpm is installed
check_pnpm() {
    if ! command -v pnpm &> /dev/null; then
        print_error "pnpm tidak ditemukan!"
        print_info "Menginstall pnpm global..."
        npm install -g pnpm
        print_success "pnpm berhasil diinstall"
    fi
}

# Function to build application
build_app() {
    print_info "Building aplikasi..."
    
    # Install dependencies
    print_info "Installing dependencies dengan pnpm..."
    pnpm install
    
    # Build the application
    print_info "Building production bundle..."
    pnpm build
    
    print_success "Build selesai!"
}

# Function to setup database
setup_database() {
    print_info "Setting up database..."
    
    # Push database schema
    pnpm db:push
    
    # Seed database
    pnpm db:seed
    
    print_success "Database setup selesai!"
}

# Function to generate PM2 ecosystem config
generate_ecosystem_config() {
    local deployment_type="$1"
    local origin="$2"
    local port="$3"
    local session_secret="$4"
    
    print_info "Generating PM2 ecosystem config untuk $deployment_type..."
    
    cat > ecosystem.production.config.cjs << EOF
module.exports = {
  apps: [
    {
      name: "absen-guru-production",
      script: "./build/index.js",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      error_file: "./logs/pm2-error.log",
      out_file: "./logs/pm2-out.log",
      env_production: {
        NODE_ENV: "production",
        PORT: $port,
        HOST: "0.0.0.0",
        ORIGIN: "$origin",
        SESSION_SECRET: "$session_secret",
        TZ: "Asia/Jakarta"
      }
    }
  ]
};
EOF
    
    print_success "Ecosystem config generated!"
}

# Main deployment function
main() {
    print_header
    
    # Check prerequisites
    check_pnpm
    check_pm2
    
    echo ""
    print_info "Pilih jenis deployment:"
    echo "1. Local Network (IP:PORT)"
    echo "2. Domain/Subdomain (https://domain.com)"
    echo "3. Cloudflare Tunnel"
    echo "4. Custom Origin"
    
    read -p "Pilih opsi (1-4): " deployment_choice
    
    local origin=""
    local port=3000
    local deployment_type=""
    
    case $deployment_choice in
        1)
            deployment_type="Local Network"
            local_ip=$(get_local_ip)
            print_info "IP lokal terdeteksi: $local_ip"
            read -p "Gunakan IP ini? (y/n) [default: y]: " use_detected_ip
            
            if [[ "$use_detected_ip" == "n" ]]; then
                read -p "Masukkan IP address: " custom_ip
                local_ip="$custom_ip"
            fi
            
            read -p "Port [default: 3000]: " custom_port
            port=${custom_port:-3000}
            
            origin="http://$local_ip:$port"
            ;;
        2)
            deployment_type="Domain/Subdomain"
            echo ""
            print_info "Contoh: https://absen.sdn19periji.sch.id"
            read -p "Masukkan domain lengkap (dengan https://): " domain_input
            
            if [[ ! "$domain_input" =~ ^https?:// ]]; then
                domain_input="https://$domain_input"
            fi
            
            origin="$domain_input"
            
            read -p "Port [default: 3000]: " custom_port
            port=${custom_port:-3000}
            ;;
        3)
            deployment_type="Cloudflare Tunnel"
            echo ""
            print_info "Untuk Cloudflare Tunnel, aplikasi berjalan di localhost"
            print_info "Tunnel akan meneruskan ke aplikasi lokal"
            
            read -p "Masukkan domain Cloudflare Tunnel (contoh: https://your-tunnel.domain.com): " tunnel_domain
            
            if [[ ! "$tunnel_domain" =~ ^https?:// ]]; then
                tunnel_domain="https://$tunnel_domain"
            fi
            
            origin="$tunnel_domain"
            port=3000
            
            print_warning "Pastikan Cloudflare Tunnel dikonfigurasi ke localhost:3000"
            ;;
        4)
            deployment_type="Custom"
            echo ""
            print_info "Contoh: http://192.168.8.103:3000, https://mydomain.com"
            read -p "Masukkan origin lengkap: " custom_origin
            origin="$custom_origin"
            
            # Extract port from origin if present
            if [[ "$origin" =~ :([0-9]+)$ ]]; then
                port="${BASH_REMATCH[1]}"
            fi
            ;;
        *)
            print_error "Pilihan tidak valid!"
            exit 1
            ;;
    esac
    
    # Validate origin
    if ! validate_origin "$origin"; then
        print_error "Format origin tidak valid: $origin"
        print_info "Format yang benar: http://domain.com, https://domain.com, atau IP:PORT"
        exit 1
    fi
    
    echo ""
    print_info "=== KONFIGURASI DEPLOYMENT ==="
    echo "Jenis: $deployment_type"
    echo "Origin: $origin"
    echo "Port: $port"
    
    # Generate session secret
    session_secret=$(openssl rand -hex 32 2>/dev/null || echo "absen-guru-$(date +%s)-production-secret")
    
    echo ""
    read -p "Lanjutkan deployment? (y/n): " confirm
    
    if [[ "$confirm" != "y" ]]; then
        print_info "Deployment dibatalkan"
        exit 0
    fi
    
    echo ""
    print_info "🚀 Memulai deployment..."
    
    # Stop existing PM2 process if any
    print_info "Stopping existing PM2 processes..."
    pm2 stop absen-guru-production 2>/dev/null || true
    pm2 delete absen-guru-production 2>/dev/null || true
    
    # Build application
    build_app
    
    # Setup database
    setup_database
    
    # Generate ecosystem config
    generate_ecosystem_config "$deployment_type" "$origin" "$port" "$session_secret"
    
    # Start with PM2
    print_info "Starting aplikasi dengan PM2..."
    pm2 start ecosystem.production.config.cjs --env production
    
    # Save PM2 configuration
    pm2 save
    
    echo ""
    print_success "🎉 DEPLOYMENT SELESAI!"
    echo ""
    print_info "=== INFORMASI DEPLOYMENT ==="
    echo "✅ Jenis: $deployment_type"
    echo "✅ Origin: $origin"
    echo "✅ Port: $port"
    echo "✅ PM2 Process: absen-guru-production"
    echo ""
    print_info "=== AKSES APLIKASI ==="
    echo "🌐 URL: $origin"
    echo "👤 Admin Username: admin"
    echo "🔑 Admin Password: admin123"
    echo ""
    print_info "=== PERINTAH BERGUNA ==="
    echo "📊 Status: pm2 status"
    echo "📋 Logs: pm2 logs absen-guru-production"
    echo "🔄 Restart: pm2 restart absen-guru-production"
    echo "⏹️  Stop: pm2 stop absen-guru-production"
    echo "📈 Monitor: pm2 monit"
    echo ""
    
    if [[ "$deployment_type" == "Cloudflare Tunnel" ]]; then
        print_warning "CATATAN CLOUDFLARE TUNNEL:"
        echo "1. Pastikan tunnel dikonfigurasi ke localhost:3000"
        echo "2. Jalankan: cloudflared tunnel run [tunnel-name]"
        echo "3. Aplikasi harus dapat diakses melalui domain tunnel"
    fi
    
    print_success "Aplikasi siap digunakan! 🚀"
}

# Run main function
main "$@"