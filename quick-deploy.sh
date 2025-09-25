#!/bin/bash

# =============================================================================
# ⚡ QUICK DEPLOY - Deploy cepat dengan konfigurasi tersimpan
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

CONFIG_FILE=".deploy-config"

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

# Load saved configuration
load_config() {
    if [[ -f "$CONFIG_FILE" ]]; then
        source "$CONFIG_FILE"
        return 0
    else
        return 1
    fi
}

# Save configuration
save_config() {
    cat > "$CONFIG_FILE" << EOF
# Saved deployment configuration
ORIGIN="$1"
PORT="$2"
DEPLOYMENT_TYPE="$3"
SESSION_SECRET="$4"
EOF
    print_success "Konfigurasi disimpan untuk deployment selanjutnya"
}

# Quick deploy function
quick_deploy() {
    local origin="$1"
    local port="$2"
    local deployment_type="$3"
    local session_secret="$4"
    
    print_info "🚀 Quick Deploy dengan konfigurasi tersimpan..."
    
    # Stop existing PM2 process
    pm2 stop absen-guru-production 2>/dev/null || true
    pm2 delete absen-guru-production 2>/dev/null || true
    
    # Quick build (skip if no changes to dependencies)
    if [[ ! -f "node_modules/.quick-deploy" ]] || [[ "package.json" -nt "node_modules/.quick-deploy" ]]; then
        print_info "Installing/updating dependencies..."
        pnpm install
        touch node_modules/.quick-deploy
    else
        print_info "Dependencies up to date, skipping install"
    fi
    
    # Build
    print_info "Building aplikasi..."
    pnpm build
    
    # Generate PM2 config
    cat > ecosystem.production.config.cjs << EOF
module.exports = {
  apps: [{
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
  }]
};
EOF
    
    # Start with PM2
    pm2 start ecosystem.production.config.cjs --env production
    pm2 save
    
    print_success "Quick Deploy selesai!"
    echo "🌐 URL: $origin"
}

# Main function
main() {
    echo -e "${BLUE}"
    echo "⚡ QUICK DEPLOY - Absen Guru"
    echo "=========================="
    echo -e "${NC}"
    
    # Check if saved config exists
    if load_config; then
        echo ""
        print_info "Konfigurasi tersimpan ditemukan:"
        echo "🌐 Origin: $ORIGIN"
        echo "🔌 Port: $PORT"
        echo "📋 Type: $DEPLOYMENT_TYPE"
        
        echo ""
        read -p "Gunakan konfigurasi ini? (y/n/edit): " choice
        
        case $choice in
            y|Y)
                quick_deploy "$ORIGIN" "$PORT" "$DEPLOYMENT_TYPE" "$SESSION_SECRET"
                ;;
            e|edit)
                print_info "Edit konfigurasi:"
                read -p "Origin [$ORIGIN]: " new_origin
                read -p "Port [$PORT]: " new_port
                
                # Use existing values if empty
                origin=${new_origin:-$ORIGIN}
                port=${new_port:-$PORT}
                
                # Generate new session secret if needed
                session_secret=$(openssl rand -hex 32 2>/dev/null || echo "absen-guru-$(date +%s)-production")
                
                # Save new config
                save_config "$origin" "$port" "$DEPLOYMENT_TYPE" "$session_secret"
                
                # Deploy with new config
                quick_deploy "$origin" "$port" "$DEPLOYMENT_TYPE" "$session_secret"
                ;;
            n|N)
                print_info "Gunakan deployment script lengkap:"
                echo "./deploy-production.sh"
                exit 0
                ;;
            *)
                print_error "Pilihan tidak valid!"
                exit 1
                ;;
        esac
    else
        print_warning "Tidak ada konfigurasi tersimpan"
        print_info "Jalankan deployment lengkap terlebih dahulu:"
        echo "./deploy-production.sh"
        exit 1
    fi
}

# Check arguments for non-interactive mode
if [[ $# -eq 2 ]]; then
    # Non-interactive mode: ./quick-deploy.sh <origin> <port>
    origin="$1"
    port="$2"
    deployment_type="Custom"
    session_secret=$(openssl rand -hex 32 2>/dev/null || echo "absen-guru-$(date +%s)-production")
    
    save_config "$origin" "$port" "$deployment_type" "$session_secret"
    quick_deploy "$origin" "$port" "$deployment_type" "$session_secret"
else
    # Interactive mode
    main "$@"
fi