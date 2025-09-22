#!/bin/bash

# Script untuk setup dan menjalankan aplikasi Absen Guru di Linux/RasPi

echo "=========================================="
echo "   🏫 Absen Guru v2.0.0"
echo "   Sistem Manajemen Absensi Guru"
echo "   Setup Script untuk Linux/Raspberry Pi"
echo "=========================================="
echo ""

echo "🚀 Memulai proses instalasi..."
echo ""

# Update sistem
echo "🔄 Memperbarui paket sistem..."
sudo apt update && sudo apt upgrade -y

# Install Node.js jika belum ada
if ! command -v node &> /dev/null; then
    echo "📦 Menginstall Node.js 22.x..."
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
    echo "📦 Menginstall pnpm..."
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    export PATH="$HOME/.local/share/pnpm:$PATH"
    
    # Add to shell profile
    echo 'export PATH="$HOME/.local/share/pnpm:$PATH"' >> ~/.bashrc
    source ~/.bashrc
else
    echo "✅ pnpm sudah terinstall: $(pnpm --version)"
fi

# Copy environment file
if [ ! -f .env ]; then
    echo ""
    echo "📄 Membuat file environment..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ File environment dibuat dari template"
        echo "⚠️  Silakan edit file .env sesuai kebutuhan"
    else
        echo "Membuat file .env default..."
        cat > .env << EOF
# Absen Guru Configuration

# Database
DATABASE_URL="file:./absen.db"

# Session Secret (change in production)
SESSION_SECRET="your-super-secret-key-change-this-$(date +%s)"

# Server Configuration
PORT=3000
HOST=0.0.0.0
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
echo "🚀 To start the application:"
echo "     sudo systemctl start absen-guru"
echo ""
echo "📊 To check status:"
echo "     sudo systemctl status absen-guru"
echo ""
echo "📋 To view logs:"
echo "     sudo journalctl -u absen-guru -f"
echo ""
echo "🌐 Application will be available at:"
echo "     http://your-ip:3000"
echo "     http://localhost:3000 (local access)"
echo ""
echo "⚠️  Important next steps:"
echo "     1. Edit .env file with proper database and JWT settings"
echo "     2. Create the first admin user via the web interface"
echo "     3. Configure your router/firewall if needed"
echo ""
echo "📚 Tech Stack:"
echo "     - Frontend: SvelteKit + TailwindCSS v4 + DaisyUI 5.1.13"
echo "     - Icons: Lucide Svelte (Feather icons)"
echo "     - Database: SQLite with better-sqlite3"
echo "     - Authentication: JWT with secure sessions"
echo ""