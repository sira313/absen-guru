#!/bin/bash

# Script untuk setup dan menjalankan aplikasi Absen Guru di Linux/VPS

echo "=========================================="
echo "   🏫 Absen Guru v2.0.0 - Production Ready"
echo "   Sistem Manajemen Absensi Guru dengan PWA"
echo "   Setup Script untuk Linux/Ubuntu/VPS"
echo "=========================================="
echo ""

echo "🚀 Memulai proses instalasi..."
echo ""

# Update sistem
echo "🔄 Memperbarui paket sistem..."
sudo apt update && sudo apt upgrade -y

# Install Node.js jika belum ada
if ! command -v node &> /dev/null; then
    echo "📦 Menginstall Node.js v22.x LTS..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js sudah terinstall: $(node --version)"
fi

# Install build tools untuk native dependencies (untuk SQLite dan lainnya)
echo "🔧 Menginstall build tools..."
sudo apt-get install -y build-essential python3-dev sqlite3 curl wget git

# Install pnpm jika belum ada
if ! command -v pnpm &> /dev/null; then
    echo "📦 Menginstall pnpm v9.12+ terbaru..."
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    export PATH="$HOME/.local/share/pnpm:$PATH"
    
    # Add to shell profile
    echo 'export PATH="$HOME/.local/share/pnpm:$PATH"' >> ~/.bashrc
    source ~/.bashrc
    
    # Verify pnpm installation
    if ! command -v pnpm &> /dev/null; then
        echo "🔧 Pnpm install via curl failed, trying npm..."
        npm install -g pnpm@latest
        if [ $? -ne 0 ]; then
            echo "❌ Gagal install pnpm. Trying with corepack..."
            corepack enable pnpm
            corepack use pnpm@latest
        fi
    fi
else
    echo "✅ pnpm sudah terinstall: $(pnpm --version)"
fi

# Copy environment file
if [ ! -f .env ]; then
    echo ""
    echo "📄 Membuat file environment universal..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ File environment dibuat dari template"
        echo "⚠️  Silakan edit file .env untuk production deployment"
    else
        echo "Membuat file .env default universal..."
        cat > .env << EOF
# Absen Guru Configuration

# Database Configuration
DATABASE_URL="file:./absen.db"
DB_FILE_NAME=file:absen.db

# Server Configuration  
PORT=3000
HOST=0.0.0.0

# Optional: Timezone
TZ=Asia/Jakarta

# Optional: Attendance Rules
ATTENDANCE_CUTOFF_HOUR=8
ATTENDANCE_LATE_MINUTES=15

# Optional: App Branding
APP_NAME="Sistem Absensi Guru"

# NOTE: NODE_ENV dan ORIGIN harus di-set via command line atau environment
# Contoh:
# NODE_ENV=production ORIGIN=https://yourdomain.com pnpm start
EOF
        echo "✅ File .env default dibuat"
        echo "⚠️  Silakan edit file .env untuk production"
    fi
else
    echo "✅ File environment sudah ada"
fi

echo ""
echo "🔽 Menginstall dependencies dengan pnpm...""
echo "   This includes:"
echo "   - SvelteKit framework"
echo "   - TailwindCSS v4 with DaisyUI 5.1.13"
echo "   - SvelteKit framework"
echo "   - TailwindCSS v4 dengan DaisyUI 5.1.13"
echo "   - Lucide Svelte (ikon Feather)"
echo "   - Database SQLite"
echo "   - Sistem autentikasi dan session"
echo ""

# Install dependencies
pnpm install
if [ $? -ne 0 ]; then
    echo "❌ Gagal install dependencies"
    echo "   Coba jalankan: sudo apt-get install build-essential"
    exit 1
else
    echo "✅ Dependencies berhasil diinstall"
fi

echo ""
echo "🗄️ Menyiapkan database..."
pnpm run db:push
if [ $? -ne 0 ]; then
    echo "❌ Gagal setup database"
    exit 1
else
    echo "✅ Database schema berhasil dibuat"
fi

echo ""
echo "🌱 Menambahkan data awal..."
pnpm run db:seed
if [ $? -ne 0 ]; then
    echo "❌ Gagal menambahkan data awal"
    exit 1
else
    echo "✅ Data awal berhasil ditambahkan"
fi

echo ""
echo "🔨 Building aplikasi..."
pnpm run build
if [ $? -ne 0 ]; then
    echo "❌ Build gagal. Silakan cek error di atas."
    exit 1
else
    echo "✅ Build berhasil"
fi

# Create systemd service file
echo ""
echo "⚙️  Membuat systemd service..."
sudo tee /etc/systemd/system/absen-guru.service > /dev/null <<EOF
[Unit]
Description=Absen Guru - Sistem Manajemen Absensi Guru
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=$(which node) build/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd dan enable service
sudo systemctl daemon-reload
sudo systemctl enable absen-guru

echo ""
echo "🎉 Setup berhasil diselesaikan!"
echo ""
echo "🚀 Untuk menjalankan aplikasi:"
echo ""
echo "   Mode Development (dengan hot reload):"
echo "     pnpm dev"
echo ""
echo "   Mode Production:"
echo "     pnpm start"
echo "   Atau menggunakan systemd service:"
echo "     sudo systemctl start absen-guru"
echo "     sudo systemctl status absen-guru"
echo ""
echo "   Preview aplikasi yang sudah di-build:"
echo "     pnpm preview"
echo ""
echo "🌐 Aplikasi akan tersedia di:"
echo "     http://localhost:5173 (development)"
echo "     http://localhost:4173 (preview)"
echo "     http://localhost:3000 (production)"
echo "     http://$(hostname -I | awk '{print $1}'):3000 (akses dari jaringan)"
echo ""
echo "👤 Login default:"
echo "     Username: admin"
echo "     Password: admin123"
echo ""
echo "� PWA Support:"
echo "     - Install sebagai app di mobile/desktop"
echo "     - Bekerja offline (terbatas)"
echo "     - Auto-update otomatis"
echo ""
echo "�🔧 Manage service:"
echo "     sudo systemctl start absen-guru    # Start service"
echo "     sudo systemctl stop absen-guru     # Stop service"
echo "     sudo systemctl restart absen-guru  # Restart service"
echo "     sudo systemctl status absen-guru   # Check status"
echo ""
echo "📖 Baca FIRST_INSTALL.md untuk panduan lengkap"
echo ""
echo "✨ Selamat menggunakan Absen Guru!"
echo "🎉 Setup completed successfully!"
echo ""
echo "🚀 Pilih cara menjalankan aplikasi:"
echo ""
echo "1️⃣  Development Mode (localhost + hot reload):"
echo "     pnpm dev"
echo "     → http://localhost:5173"
echo ""
echo "2️⃣  Network Access (untuk akses multi-device):"
echo "     ./start-network.sh"
echo "     → Auto-detect IP dan start server"
echo ""
echo "3️⃣  Manual Network Setup:"
echo "     ifconfig  # atau: ip addr"
echo "     ORIGIN=http://YOUR_IP:3000 pnpm start"
echo "     → Ganti YOUR_IP dengan IP server Anda"
echo ""
echo "4️⃣  Production Mode dengan Systemd:"
echo "     sudo systemctl start absen-guru"
echo "     → Service otomatis dengan auto-restart"
echo ""
echo "5️⃣  Production Manual:"
echo "     NODE_ENV=production ORIGIN=https://yourdomain.com pnpm start"
echo "     → Untuk deployment manual"
echo ""
echo "👤 Login default:"
echo "     Username: admin"
echo "     Password: admin123"
echo ""
echo "📖 Dokumentasi lengkap:"
echo "     - README.md - Setup dan usage guide"
echo "     - NETWORK_SETUP.md - Network troubleshooting"
echo "     - FIRST_INSTALL.md - Panduan instalasi detail"
echo ""
echo "⚠️  Penting untuk Network Access:"
echo "     1. Gunakan ./start-network.sh untuk auto-setup"
echo "     2. Buka port 3000 di firewall: sudo ufw allow 3000"
echo "     3. NODE_ENV jangan di .env file (gunakan command line)"
echo ""
echo "� Tech Stack:"
echo "     - Frontend: SvelteKit + TailwindCSS v4 + DaisyUI 5.1.14"
echo "     - Database: SQLite dengan Drizzle ORM"
echo "     - Auth: Custom session management"
echo "     - PWA: Install di mobile/desktop"
echo ""