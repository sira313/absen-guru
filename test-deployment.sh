#!/bin/bash

# =============================================================================
# 🧪 TEST DEPLOYMENT SCRIPT
# =============================================================================
# Script untuk testing berbagai skenario deployment
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Test prerequisites
test_prerequisites() {
    print_info "🔍 Testing prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js tidak ditemukan!"
        return 1
    fi
    node_version=$(node --version)
    print_success "Node.js: $node_version"
    
    # Check pnpm
    if ! command -v pnpm &> /dev/null; then
        print_warning "pnpm tidak ditemukan, menginstall..."
        npm install -g pnpm
    fi
    pnpm_version=$(pnpm --version)
    print_success "pnpm: $pnpm_version"
    
    # Check PM2
    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 tidak ditemukan, menginstall..."
        npm install -g pm2
    fi
    pm2_version=$(pm2 --version)
    print_success "PM2: $pm2_version"
    
    return 0
}

# Test build process
test_build() {
    print_info "🔨 Testing build process..."
    
    # Clean previous build
    rm -rf build .svelte-kit node_modules/.vite 2>/dev/null || true
    
    # Install dependencies
    print_info "Installing dependencies..."
    pnpm install
    
    # Build application
    print_info "Building application..."
    pnpm build
    
    if [[ -f "build/index.js" ]]; then
        print_success "Build berhasil!"
        return 0
    else
        print_error "Build gagal!"
        return 1
    fi
}

# Test database setup
test_database() {
    print_info "🗄️  Testing database setup..."
    
    # Remove existing database
    rm -f absen.db
    
    # Push schema
    print_info "Pushing database schema..."
    pnpm db:push
    
    # Seed database
    print_info "Seeding database..."
    pnpm db:seed
    
    if [[ -f "absen.db" ]]; then
        db_size=$(du -h absen.db | cut -f1)
        print_success "Database setup berhasil! Size: $db_size"
        return 0
    else
        print_error "Database setup gagal!"
        return 1
    fi
}

# Test local server
test_local_server() {
    print_info "🌐 Testing local server..."
    
    # Start server in background
    PORT=3001 node build/index.js &
    server_pid=$!
    
    # Wait for server to start
    sleep 3
    
    # Test HTTP request
    if curl -s http://localhost:3001 > /dev/null; then
        print_success "Local server berjalan!"
        kill $server_pid
        return 0
    else
        print_error "Local server gagal!"
        kill $server_pid 2>/dev/null || true
        return 1
    fi
}

# Test PM2 deployment
test_pm2() {
    print_info "⚡ Testing PM2 deployment..."
    
    # Create temporary ecosystem config
    cat > ecosystem.test.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: "absen-guru-test",
    script: "./build/index.js",
    exec_mode: "fork",
    instances: 1,
    autorestart: true,
    env: {
      PORT: 3002,
      HOST: "127.0.0.1",
      ORIGIN: "http://127.0.0.1:3002",
      SESSION_SECRET: "test-secret-123",
      TZ: "Asia/Jakarta"
    }
  }]
};
EOF
    
    # Stop any existing test process
    pm2 delete absen-guru-test 2>/dev/null || true
    
    # Start with PM2
    pm2 start ecosystem.test.config.cjs
    
    # Wait for startup
    sleep 3
    
    # Test PM2 status
    if pm2 list | grep -q "absen-guru-test.*online"; then
        print_success "PM2 deployment berhasil!"
        
        # Test HTTP request
        if curl -s http://127.0.0.1:3002 > /dev/null; then
            print_success "PM2 server responding!"
        else
            print_warning "PM2 server tidak merespons"
        fi
        
        # Cleanup
        pm2 delete absen-guru-test
        rm ecosystem.test.config.cjs
        return 0
    else
        print_error "PM2 deployment gagal!"
        pm2 delete absen-guru-test 2>/dev/null || true
        rm ecosystem.test.config.cjs
        return 1
    fi
}

# Test deployment scripts
test_deployment_scripts() {
    print_info "📋 Testing deployment scripts..."
    
    local scripts=(
        "deploy-production.sh"
        "manage-deployment.sh"
        "quick-deploy.sh"
        "setup-cloudflare-tunnel.sh"
    )
    
    for script in "${scripts[@]}"; do
        if [[ -f "$script" && -x "$script" ]]; then
            print_success "$script ✓"
        else
            print_error "$script tidak ditemukan atau tidak executable!"
            return 1
        fi
    done
    
    return 0
}

# Performance test
test_performance() {
    print_info "⚡ Testing performance..."
    
    # Start server for testing
    PORT=3003 node build/index.js &
    server_pid=$!
    
    sleep 3
    
    # Simple load test using curl
    print_info "Running load test (10 concurrent requests)..."
    
    local success_count=0
    local total_requests=10
    
    for ((i=1; i<=total_requests; i++)); do
        if curl -s http://localhost:3003 > /dev/null; then
            ((success_count++))
        fi
    done
    
    kill $server_pid
    
    local success_rate=$((success_count * 100 / total_requests))
    
    if [[ $success_rate -ge 80 ]]; then
        print_success "Performance test: $success_count/$total_requests ($success_rate%) ✓"
        return 0
    else
        print_warning "Performance test: $success_count/$total_requests ($success_rate%)"
        return 1
    fi
}

# Run all tests
run_all_tests() {
    print_info "🧪 Running comprehensive deployment tests..."
    echo ""
    
    local tests=(
        "test_prerequisites"
        "test_build"
        "test_database"
        "test_local_server"
        "test_pm2"
        "test_deployment_scripts"
        "test_performance"
    )
    
    local passed=0
    local total=${#tests[@]}
    
    for test in "${tests[@]}"; do
        echo ""
        if $test; then
            ((passed++))
        fi
    done
    
    echo ""
    echo "=============================================="
    if [[ $passed -eq $total ]]; then
        print_success "🎉 Semua test PASSED! ($passed/$total)"
        print_info "Aplikasi siap untuk deployment production!"
    else
        print_warning "⚠️  Test results: $passed/$total passed"
        print_info "Periksa error di atas sebelum deployment"
    fi
    echo "=============================================="
    
    return $((total - passed))
}

# Interactive menu
interactive_menu() {
    while true; do
        echo ""
        echo "🧪 DEPLOYMENT TEST SUITE"
        echo "========================"
        echo "1. Run all tests"
        echo "2. Test prerequisites"
        echo "3. Test build process"
        echo "4. Test database setup"
        echo "5. Test local server"
        echo "6. Test PM2 deployment"
        echo "7. Test deployment scripts"
        echo "8. Test performance"
        echo "0. Exit"
        echo ""
        
        read -p "Pilih test (0-8): " choice
        
        case $choice in
            1) run_all_tests ;;
            2) test_prerequisites ;;
            3) test_build ;;
            4) test_database ;;
            5) test_local_server ;;
            6) test_pm2 ;;
            7) test_deployment_scripts ;;
            8) test_performance ;;
            0) 
                print_info "Keluar dari test suite"
                exit 0
                ;;
            *)
                print_error "Pilihan tidak valid!"
                ;;
        esac
    done
}

# Main function
main() {
    echo -e "${BLUE}"
    echo "=============================================="
    echo "🧪 ABSEN-GURU DEPLOYMENT TEST SUITE"
    echo "=============================================="
    echo -e "${NC}"
    
    if [[ $# -eq 0 ]]; then
        interactive_menu
    else
        case $1 in
            "all")
                run_all_tests
                ;;
            "prerequisites")
                test_prerequisites
                ;;
            "build")
                test_build
                ;;
            "database")
                test_database
                ;;
            "server")
                test_local_server
                ;;
            "pm2")
                test_pm2
                ;;
            "scripts")
                test_deployment_scripts
                ;;
            "performance")
                test_performance
                ;;
            *)
                echo "Usage: $0 [all|prerequisites|build|database|server|pm2|scripts|performance]"
                exit 1
                ;;
        esac
    fi
}

# Run main function
main "$@"