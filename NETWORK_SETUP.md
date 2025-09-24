# 🌐 Network Access Setup Guide

## Quick Setup

### 🎯 **Auto-Detection Scripts** (Recommended)

**Windows:**
```cmd
# Run batch script - detects IP automatically
start-network.bat
```

**Linux/macOS:**
```bash
# Run shell script - detects IP automatically  
./start-network.sh
```

### 📱 **Manual Setup**

**1. Find Your IP Address:**

**Windows:**
```cmd
ipconfig
```

**Linux/macOS:**
```bash
ifconfig
# or
ip addr show
```

**2. Start Server with IP:**
```bash
# Replace 192.168.1.100 with your actual IP
ORIGIN=http://192.168.1.100:3000 pnpm start
```

**3. Access from Any Device:**
- Open browser on phone/tablet/other PC
- Navigate to: `http://192.168.1.100:3000`

## 🔧 Environment Configuration

### Development vs Production Mode

| Mode | Command | CSRF | Usage |
|------|---------|------|-------|
| **Development** | `pnpm dev` | Disabled | Localhost only |
| **Network Testing** | `ORIGIN=http://IP:3000 pnpm start` | Flexible | Network access |
| **Production** | `NODE_ENV=production ORIGIN=... pnpm start` | Strict | Production deployment |

### CSRF Protection Logic

```javascript
// Development Mode (NODE_ENV !== 'production')
trustedOrigins: [
  'http://localhost:5173',
  'http://localhost:5174', 
  'http://localhost:3000',
  process.env.ORIGIN,  // Your network IP if set
]

// Production Mode (NODE_ENV === 'production')
trustedOrigins: [
  process.env.ORIGIN || 'http://localhost:3000'  // Only specified origin
]
```

## 🔍 Troubleshooting

### ❌ **Error: 403 Forbidden on Login**

**Cause:** CSRF protection rejecting the request

**Solution:**
1. **Check ORIGIN variable:**
   ```bash
   echo $ORIGIN  # Linux/Mac
   echo %ORIGIN% # Windows
   ```

2. **Restart server with correct IP:**
   ```bash
   # Stop current server (Ctrl+C)
   # Start with correct IP
   ORIGIN=http://192.168.1.100:3000 pnpm start
   ```

3. **Use auto-detection script:**
   ```bash
   ./start-network.sh    # Linux/Mac
   start-network.bat     # Windows
   ```

### ❌ **Cannot Connect from Other Devices**

**Possible Causes:**

1. **Firewall blocking port 3000**
   ```bash
   # Windows: Allow port 3000 in Windows Firewall
   # Linux: sudo ufw allow 3000
   # macOS: System Preferences > Security > Firewall
   ```

2. **Wrong IP address**
   ```bash
   # Double-check with ipconfig/ifconfig
   # Use the IP from your local network (192.168.x.x or 10.x.x.x)
   ```

3. **Router blocking connections**
   ```bash
   # Try connecting from same WiFi network
   # Check if devices are on same subnet
   ```

### ❌ **Auto-Detection Script Not Working**

**Windows (start-network.bat):**
```cmd
# Manual fallback:
ipconfig
set ORIGIN=http://YOUR_IP:3000
pnpm start
```

**Linux/macOS (start-network.sh):**
```bash
# Manual fallback:
ifconfig
export ORIGIN=http://YOUR_IP:3000
pnpm start
```

## 📱 **Mobile Access Examples**

### Same WiFi Network Setup

1. **Computer (Server):** `192.168.1.100`
2. **Phone/Tablet:** Connect to same WiFi
3. **Open browser:** `http://192.168.1.100:3000`
4. **Login:** admin / admin123

### Hotspot Setup

1. **Phone:** Enable hotspot
2. **Computer:** Connect to phone's hotspot  
3. **Find IP:** Run `ipconfig`/`ifconfig`
4. **Start server:** `ORIGIN=http://YOUR_IP:3000 pnpm start`
5. **Access from phone:** `http://YOUR_IP:3000`

## 🏢 **Production Deployment**

### VPS/Server Setup

```bash
# 1. Build application
pnpm build

# 2. Start with domain
NODE_ENV=production ORIGIN=https://yourdomain.com pnpm start

# 3. Or with server IP
NODE_ENV=production ORIGIN=http://your-server-ip:3000 pnpm start
```

### PM2 Process Manager

```bash
# ecosystem.config.js already configured with proper environment
pm2 start ecosystem.config.js
```

### Docker Deployment

```dockerfile
# Set ORIGIN environment variable in docker-compose.yml or Dockerfile
ENV ORIGIN=https://yourdomain.com
ENV NODE_ENV=production
```

## 💡 **Tips & Best Practices**

1. **Always use HTTPS in production**
2. **Set ORIGIN to exact domain/IP being used**  
3. **Use PM2 for process management in production**
4. **Configure reverse proxy (nginx) for better performance**
5. **Enable firewall rules for security**

## 📞 **Support**

If you're still having issues:

1. **Check browser console** for error messages
2. **Check server logs** for CSRF errors
3. **Verify network connectivity** with ping/telnet
4. **Test with different devices** to isolate the issue

**Common working examples:**
- Development: `pnpm dev` → `http://localhost:5173`
- Network: `ORIGIN=http://192.168.1.100:3000 pnpm start` → `http://192.168.1.100:3000`
- Production: `NODE_ENV=production ORIGIN=https://domain.com pnpm start`