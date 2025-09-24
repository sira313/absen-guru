#!/bin/bash

echo "=================================================="
echo "   ABSEN GURU - NETWORK ACCESS"
echo "=================================================="
echo ""
echo "Detecting IP Address..."

# Try to get IP address using different methods
if command -v ip &> /dev/null; then
    LOCAL_IP=$(ip route get 1 | sed -n 's/^.*src \([0-9.]*\) .*$/\1/p')
elif command -v ifconfig &> /dev/null; then
    LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -1)
elif command -v ipconfig &> /dev/null; then
    # Windows environment (Git Bash, WSL, etc.)
    LOCAL_IP=$(ipconfig | grep -A 1 "Wireless LAN adapter Wi-Fi" | grep "IPv4 Address" | head -1 | cut -d: -f2 | tr -d ' ')
    if [ -z "$LOCAL_IP" ]; then
        LOCAL_IP=$(ipconfig | grep "IPv4 Address" | head -1 | cut -d: -f2 | tr -d ' ')
    fi
else
    echo "ERROR: Could not detect IP address"
    echo "Available commands to try manually:"
    echo "  Linux: ip addr show or ifconfig" 
    echo "  Windows: ipconfig"
    echo "Then run: ORIGIN=http://YOUR_IP:3000 pnpm start"
    exit 1
fi

if [ -z "$LOCAL_IP" ]; then
    echo "ERROR: Could not detect IP address"
    echo "Please check: ifconfig or ip addr"
    echo "Then manually run: ORIGIN=http://YOUR_IP:3000 pnpm start"
    exit 1
fi

echo "Detected IP Address: $LOCAL_IP"
echo ""
echo "Network URL: http://$LOCAL_IP:3000"
echo ""
echo "Starting server with network access..."
echo "Press Ctrl+C to stop"
echo ""

# Set ORIGIN and start server
export ORIGIN="http://$LOCAL_IP:3000"
pnpm start