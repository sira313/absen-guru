#!/bin/bash

# Script untuk setup dan menjalankan aplikasi absen-guru di Linux/RasPi

echo "Setting up Absen Guru Application..."

# Update sistem
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js jika belum ada
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install build tools untuk native dependencies
echo "Installing build tools..."
sudo apt-get install -y build-essential python3-dev

# Install pnpm jika belum ada
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    export PATH="$HOME/.local/share/pnpm:$PATH"
fi

# Copy environment file
if [ ! -f .env ]; then
    echo "Creating environment file..."
    cp .env.example .env
    echo "Please edit .env file with your settings"
fi

# Install dependencies
echo "Installing dependencies with pnpm..."
pnpm install

# Create data directory
echo "Creating data directory..."
mkdir -p data

# Build aplikasi
echo "Building application..."
pnpm run build

# Create systemd service file
echo "Creating systemd service..."
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
echo "Setup completed!"
echo ""
echo "To start the application:"
echo "  sudo systemctl start absen-guru"
echo ""
echo "To check status:"
echo "  sudo systemctl status absen-guru"
echo ""
echo "To view logs:"
echo "  sudo journalctl -u absen-guru -f"
echo ""
echo "Application will be available at http://your-ip:3000"
echo ""
echo "Don't forget to:"
echo "  1. Edit .env file with proper settings"
echo "  2. Create the first admin user"
echo ""