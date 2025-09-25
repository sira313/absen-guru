# 🚀 Panduan Deployment Production Absen-Guru

## 📋 Daftar Isi

1. [Deployment Otomatis](#-deployment-otomatis)
2. [Cloudflare Tunnel](#-cloudflare-tunnel)
3. [Management & Monitoring](#-management--monitoring)
4. [Quick Deploy](#-quick-deploy)
5. [Troubleshooting](#-troubleshooting)

## 🎯 Deployment Otomatis

### Windows

```cmd
.\deploy-production.bat
```

### Linux/macOS/WSL

```bash
./deploy-production.sh
```

### Contoh Penggunaan

#### Scenario 1: Local Network (LAN)
**Untuk sekolah yang ingin akses dari semua komputer di jaringan lokal:**

```
Pilih opsi: 1 (Local Network)
IP terdeteksi: 192.168.1.100
Port: 3000 (default)

Hasil: http://192.168.1.100:3000
```

Semua komputer di sekolah bisa akses via IP tersebut.

#### Scenario 2: Domain Sekolah
**Untuk sekolah yang punya domain sendiri:**

```
Pilih opsi: 2 (Domain/Subdomain)
Domain: absen.sdn19periji.sch.id
Port: 3000 (atau sesuai kebutuhan)

Hasil: https://absen.sdn19periji.sch.id
```

#### Scenario 3: Cloudflare Tunnel
**Untuk akses dari internet tanpa VPS:**

```
Pilih opsi: 3 (Cloudflare Tunnel)
Domain tunnel: https://absen-sdn19.your-tunnel.com

Hasil: https://absen-sdn19.your-tunnel.com
```

## ☁️ Cloudflare Tunnel

### Setup Cloudflare Tunnel

1. **Jalankan setup script:**
   ```bash
   ./setup-cloudflare-tunnel.sh
   ```

2. **Login ke Cloudflare:**
   - Browser akan terbuka untuk login
   - Pilih domain yang akan digunakan

3. **Konfigurasi tunnel:**
   ```
   Nama tunnel: absen-guru
   Domain: absen.sdn19periji.sch.id
   Target: localhost:3000
   ```

4. **Deploy aplikasi:**
   ```bash
   ./deploy-production.sh
   # Pilih opsi 3: Cloudflare Tunnel
   # Masukkan domain: https://absen.sdn19periji.sch.id
   ```

5. **Jalankan tunnel:**
   ```bash
   cloudflared tunnel run absen-guru
   ```

### Auto-Start Tunnel (Linux)

Script akan otomatis membuat systemd service:

```bash
# Start tunnel
sudo systemctl start cloudflared-absen-guru

# Enable auto-start
sudo systemctl enable cloudflared-absen-guru

# Check status
sudo systemctl status cloudflared-absen-guru
```

## 🔧 Management & Monitoring

### Jalankan Management Tool

```bash
./manage-deployment.sh
```

### Menu yang Tersedia

#### 1. Status & Info
- Lihat status aplikasi PM2
- Informasi versi dan konfigurasi
- Ukuran database
- Logs terbaru

#### 2. Update Aplikasi
- Pull changes dari Git (jika ada)
- Install dependencies terbaru
- Build ulang aplikasi
- Restart otomatis

#### 3. Ubah Origin/Domain
- Ganti domain aplikasi tanpa setup ulang
- Update konfigurasi PM2
- Restart aplikasi

#### 4. Backup Database
- Backup otomatis dengan timestamp
- Disimpan di folder `backups/`
- Aplikasi tetap jalan selama backup

#### 5. Restore Database
- Pilih dari daftar backup yang ada
- Backup current database sebelum restore
- Restart aplikasi setelah restore

#### 6. Reset Admin Password
- Reset password admin ke default: `admin123`
- Berguna jika lupa password

#### 7. Lihat Logs
- Live logs (real-time)
- Error logs saja
- Output logs saja
- All logs (kombinasi)

#### 8. Cleanup
- Hapus cache build
- Bersihkan PM2 logs
- Hapus backup lama (>30 hari)

#### 9-11. Control PM2
- Restart aplikasi
- Stop aplikasi
- Start aplikasi

## ⚡ Quick Deploy

### Deployment Cepat

Setelah deployment pertama, gunakan quick deploy untuk deploy ulang:

```bash
./quick-deploy.sh
```

**Fitur:**
- Gunakan konfigurasi tersimpan
- Skip install dependencies jika tidak berubah
- Build dan restart cepat
- Edit konfigurasi jika perlu

### Non-Interactive Mode

```bash
./quick-deploy.sh "https://absen.sdn19periji.sch.id" 3000
```

## 🔧 Troubleshooting

### Error: Port sudah digunakan

```bash
# Cek proses yang menggunakan port
netstat -tulpn | grep :3000

# Kill process jika perlu
sudo kill -9 [PID]

# Atau gunakan port lain
PORT=3001 ./deploy-production.sh
```

### Error: PM2 command not found

```bash
# Install PM2 global
npm install -g pm2

# Atau update npm
npm update -g npm
npm install -g pm2
```

### Error: pnpm command not found

```bash
# Install pnpm global
npm install -g pnpm

# Atau gunakan npm
npm install
npm run build
```

### Aplikasi tidak bisa diakses dari network

1. **Check firewall:**
   ```bash
   # Ubuntu/Debian
   sudo ufw allow 3000
   
   # CentOS/RHEL
   sudo firewall-cmd --add-port=3000/tcp --permanent
   sudo firewall-cmd --reload
   ```

2. **Check HOST binding:**
   - Pastikan `HOST=0.0.0.0` di config PM2
   - Jangan gunakan `127.0.0.1` untuk network access

3. **Check ORIGIN setting:**
   - ORIGIN harus sesuai dengan cara akses
   - Contoh: jika akses via IP, ORIGIN = `http://IP:PORT`

### Database error

```bash
# Reset database
rm absen.db
pnpm db:push
pnpm db:seed

# Atau restore dari backup
./manage-deployment.sh
# Pilih menu 5 (Restore Database)
```

### Cloudflare Tunnel tidak jalan

1. **Check tunnel status:**
   ```bash
   cloudflared tunnel list
   ```

2. **Check DNS record:**
   - Pastikan DNS record sudah ada di Cloudflare dashboard
   - Type: CNAME, Target: tunnel ID

3. **Check config file:**
   ```bash
   cat ~/.cloudflared/config.yml
   ```

4. **Run dengan debug:**
   ```bash
   cloudflared tunnel --config ~/.cloudflared/config.yml run --loglevel debug
   ```

## 📞 Support

Jika ada masalah:

1. Check logs: `./manage-deployment.sh` → Menu 7
2. Check status: `pm2 status`
3. Restart aplikasi: `pm2 restart absen-guru-production`
4. Buat issue di GitHub repository

## 🎯 Best Practices

1. **Backup rutin:**
   - Gunakan `./manage-deployment.sh` → Menu 4
   - Schedule backup otomatis dengan cron

2. **Monitor logs:**
   - Check error logs secara berkala
   - Setup log rotation jika perlu

3. **Update aplikasi:**
   - Gunakan `./manage-deployment.sh` → Menu 2
   - Test di environment staging dulu

4. **Keamanan:**
   - Ganti password admin default
   - Gunakan SESSION_SECRET yang kuat
   - Setup HTTPS di production

5. **Performance:**
   - Monitor memory usage dengan `pm2 monit`
   - Restart aplikasi jika memory tinggi
   - Cleanup cache secara berkala