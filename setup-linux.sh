#!/bin/bash

# Script untuk setup dan menjalankan aplikasi absen-guru di Linux/RasPi

echo "=========================================="
echo "   Absen Guru - Teacher Attendance System"
echo "   Setup Script for Linux/Raspberry Pi"
echo "=========================================="
echo ""

# Update sistem
echo "🔄 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js jika belum ada
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Install build tools untuk native dependencies (untuk SQLite dan lainnya)
echo "🔧 Installing build tools..."
sudo apt-get install -y build-essential python3-dev sqlite3

# Install pnpm jika belum ada
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    export PATH="$HOME/.local/share/pnpm:$PATH"
    source ~/.bashrc
else
    echo "✅ pnpm already installed: $(pnpm --version)"
fi

# Copy environment file
if [ ! -f .env ]; then
    echo "📄 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your settings"
else
    echo "✅ Environment file already exists"
fi

echo ""
echo "🔽 Installing dependencies with pnpm..."
echo "   This includes:"
echo "   - SvelteKit framework"
echo "   - TailwindCSS v4 with DaisyUI 5.1.13"
echo "   - Lucide Svelte (Feather icons)"
echo "   - SQLite database with better-sqlite3"
echo "   - Authentication and session management"
echo ""

# Install dependencies
pnpm install

# Create data directory
echo "📁 Creating data directory..."
mkdir -p data

# Initialize database if not exists
if [ ! -f "absen.db" ]; then
    echo "🗄️ Initializing SQLite database..."
    echo "Database will be created on first run"
fi

# Build aplikasi
echo "🔨 Building application..."
pnpm run build

# Create systemd service file
echo "⚙️  Creating systemd service..."
sudo tee /etc/systemd/system/absen-guru.service > /dev/null <<EOF
[Unit]
Description=Absen Guru - Teacher Attendance System
After=network.target

[Service]
Type=simple
User=pi
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