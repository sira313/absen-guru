# 🚀 Launcher Absen Guru - Cara Mudah Menjalankan Aplikasi

> **Launcher adalah tool yang akan bertanya "mau dijalankan gimana?" sehingga Anda tidak perlu repot dengan command manual.**

## ⚡ Cara Menggunakan (Super Mudah!)

### Windows
Double-click file: **`launcher.bat`**

### Linux/Mac
Ketik di terminal: **`./launcher.sh`**

**Nanti akan muncul menu pilihan seperti ini:**

```
╔══════════════════════════════════════════════════════════╗
║                  🏠 ABSEN-GURU LAUNCHER                 ║
╚══════════════════════════════════════════════════════════╝

Pilih mode deployment:

[1] 🖥️  Local Development (localhost:5174)
[2] 🌐 Local Network (IP Address + Production)
[3] 🔄 PM2 Local Production (Recommended)
[4] 🔄 PM2 Network Production (Best for 24/7)
[5] ☁️  Cloudflare Tunnel (Public Internet)
[6] 🔧 Setup Database Only
[7] 🗑️  Reset Database (Fresh Start)
[8] 📊 PM2 Management (Status/Logs/Stop)
[0] ❌ Exit

Masukkan pilihan (0-8):
```

**Tinggal ketik angka sesuai kebutuhan!**

---

## 🤔 Pilih Yang Mana?

### **Baru Pertama Kali / Testing**
**Pilih [1] 🖥️ Local Development**
- Buka browser: `http://localhost:5174`
- Cocok untuk: Testing, development, belajar pakai aplikasi

### **Mau Akses dari HP/Laptop Lain (Paling Popular!)**
**Pilih [2] 🌐 Local Network**  
- Otomatis detect IP address komputer Anda
- Dapat URL seperti: `http://192.168.1.100:3000`
- Buka URL tersebut di HP dalam WiFi yang sama
- Cocok untuk: Penggunaan sehari-hari di sekolah

### **Production Mode dengan Monitoring (Recommended)**
**Pilih [3] 🔄 PM2 Local Production**
- Server dengan monitoring otomatis
- Auto-restart kalau ada error
- Buka browser: `http://localhost:3000`
- Cocok untuk: Komputer dedicated untuk absensi

### **Production + Network Access (Best untuk 24/7)**
**Pilih [4] 🔄 PM2 Network Production**
- Gabungan monitoring + akses network
- Otomatis detect IP + auto-restart
- Cocok untuk: Server sekolah yang jalan 24/7

### **Akses dari Internet (Advanced)**
**Pilih [5] ☁️ Cloudflare Tunnel**
- Bisa diakses dari mana saja (internet)
- Perlu install cloudflared dulu
- Cocok untuk: Akses dari rumah, monitoring jarak jauh

---

## 🔧 Pilihan Maintenance

### **[6] 🔧 Setup Database Only**
- Install database tanpa start server
- Cocok untuk: First time setup, perbaikan database

### **[7] 🗑️ Reset Database (Fresh Start)**  
- **HATI-HATI!** Hapus semua data dan mulai dari nol
- Cocok untuk: Reset total, hapus data lama

### **[8] 📊 PM2 Management**
- Kelola server yang jalan dengan PM2
- Menu: Status, Logs, Monitor, Restart, Stop
- Cocok untuk: Monitoring, troubleshooting

---

## 📋 Menu Pilihan Lengkap

### [3] 🔄 PM2 Local Production (Recommended)
- **Port:** localhost:3000
- **Mode:** PM2 managed production
- **Features:** Auto-restart, monitoring, logs
- **Use Case:** Production local dengan reliability

### [4] 🔄 PM2 Network Production (Best for 24/7)
- **Port:** Auto-detect IP:3000
- **Mode:** PM2 managed network production  
- **Features:** Auto-restart, monitoring, network access
- **Use Case:** Production 24/7 dengan akses network

### [5] ☁️ Cloudflare Tunnel
- **Port:** Public internet via Cloudflare
- **Mode:** Production dengan tunnel
- **Requirements:** `cloudflared` installed
- **Use Case:** Akses dari internet tanpa port forwarding

### [6] 🔧 Setup Database
- **Action:** Install dependencies + setup database
- **Use Case:** First time setup atau reset database

### [8] 📊 PM2 Management
- **Actions:** Status, logs, monitor, restart, stop, delete
- **Use Case:** Manage running PM2 processes

---

## ❓ FAQ Launcher

<details>
<summary><strong>🤔 Pilihan mana yang paling mudah?</strong></summary>

**Untuk pemula:** Pilih [1] Local Development  
**Untuk sekolah:** Pilih [2] Local Network (bisa akses dari HP)  
**Untuk server sekolah:** Pilih [4] PM2 Network Production  
</details>

<details>
<summary><strong>📱 Bagaimana akses dari HP?</strong></summary>

1. Pilih [2] atau [4] di launcher
2. Tunggu sampai muncul IP address (contoh: `http://192.168.8.103:3000`)
3. Buka IP tersebut di browser HP dalam WiFi yang sama
</details>

<details>
<summary><strong>⚠️ Error "IP tidak terdeteksi"?</strong></summary>

Kalau IP detection gagal, akan fallback ke localhost. Cari IP manual:
- Windows: `ipconfig` 
- Linux/Mac: `ifconfig` atau `ip addr`
Lalu set manual: `ORIGIN=http://IP_ANDA:3000 pnpm start`
</details>

<details>
<summary><strong>🔧 Server tidak bisa diakses?</strong></summary>

1. Pilih [8] PM2 Management → [4] Restart
2. Atau jalankan ulang launcher dengan mode yang sama
3. Check firewall Windows/antivirus - pastikan port 3000 tidak diblok
</details>

<details>
<summary><strong>🗑️ Kapan pakai Reset Database?</strong></summary>

**Hati-hati!** Reset Database akan hapus semua data. Pakai kalau:
- Mau mulai fresh/bersih  
- Database corrupt/error
- Testing dengan data kosong

**Jangan lupa backup dulu** kalau ada data penting!
</details>

---

## 🛠️ Requirements

### **Semua Mode:**
- Node.js v18+ (auto-install di setup)
- pnpm package manager (auto-install)
- Windows 10+, Ubuntu 18+, atau macOS 10.15+

### **PM2 Mode:**
- PM2 (auto-installed if missing)
- Recommended untuk production/server sekolah

### **Cloudflare Tunnel:**
- cloudflared binary ([Download here](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/))
- Cloudflare account (gratis)

## 📖 Advanced Usage

### Manual Commands:
```bash
# Development
pnpm dev --port 5174

# Production Local  
pnpm build && pnpm start

# Network Production
export NODE_ENV=production
export ORIGIN=http://192.168.1.100:3000
pnpm start

# PM2 Commands
pnpm pm2:start              # Local production
pnpm pm2:start:network      # Network production
pm2 status                  # Check status
pm2 logs                    # View logs
pm2 monit                   # Real-time monitoring
pm2 restart absen-guru      # Restart app
pm2 stop absen-guru         # Stop app

# Database Setup Only
pnpm install && pnpm db:push && pnpm db:seed
```

### Environment Variables:
- `NODE_ENV`: production/development
- `ORIGIN`: URL for CSRF protection
- `SESSION_SECRET`: Session encryption key

## 🔍 Troubleshooting

### IP Detection Issues:
Jika auto IP detection gagal, set manual:
```bash
export ORIGIN=http://YOUR_IP:3000
pnpm start
```

### Cloudflare Tunnel:
Install cloudflared terlebih dahulu:
- Windows: Download dari Cloudflare website  
- Linux: `apt install cloudflared` atau `brew install cloudflared`
- Mac: `brew install cloudflared`

### **Port Conflicts:**
- Development: 5174
- Production: 3000
- Ubah di launcher script jika perlu

---

## 🎉 Tips Sukses

✅ **Pilih [2] atau [4]** kalau mau akses dari HP  
✅ **Gunakan PM2 mode** untuk server sekolah yang jalan 24/7  
✅ **Backup data dulu** sebelum reset database  
✅ **Catat IP address** yang muncul untuk akses dari device lain  
✅ **Test koneksi** dari HP sebelum deploy ke produksi  

---

## 📖 Dokumentasi Lainnya

- [📋 **README.md**](README.md) - Overview aplikasi dan panduan install
- [🌐 **NETWORK_SETUP.md**](NETWORK_SETUP.md) - Troubleshooting network access
- [🏭 **DEPLOYMENT_GUIDE.md**](DEPLOYMENT_GUIDE.md) - Deploy ke server production
- [📚 **DOCS_INDEX.md**](DOCS_INDEX.md) - Indeks semua dokumentasi

---

**Made with ❤️ for Indonesian Schools**