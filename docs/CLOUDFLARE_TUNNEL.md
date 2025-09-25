# Cloudflare Tunnel Guide

## Overview

Panduan ini menjelaskan cara menggunakan Cloudflare Tunnel dengan sistem absen-guru untuk membuat aplikasi dapat diakses dari internet.

## Jenis Tunnel

### 1. Quick Tunnel 🚀
- **Gratis dan mudah**
- URL random yang berubah setiap restart
- Tidak perlu akun Cloudflare
- Cocok untuk testing dan demo

### 2. Named Tunnel 🏷️
- **Domain kustom** (contoh: absen.yourschool.sch.id)
- URL tetap dan persistent
- **Memerlukan akun Cloudflare gratis**
- Cocok untuk production

## Metode Deployment

### Interactive Mode (Opsi 5)
Jalankan tunnel secara interaktif dengan output langsung:
```bash
./launcher.sh
# Pilih opsi 5: ☁️ Cloudflare Tunnel
```

### Background Service Mode (Opsi 6)
Jalankan tunnel sebagai background service dengan PM2:
```bash
./launcher.sh  
# Pilih opsi 6: 🔄 PM2 + Cloudflare Tunnel
```

**Keuntungan Background Service:**
- ✅ Auto-restart jika crash
- ✅ Auto-start setelah reboot
- ✅ Monitoring dengan PM2
- ✅ Logs management
- ✅ Resource monitoring

## Setup Named Tunnel

### Prerequisites
1. **Akun Cloudflare gratis**: https://cloudflare.com
2. **Domain**: Domain yang sudah menggunakan Cloudflare DNS

### Step 1: Install cloudflared
Download dari: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

### Step 2: Login ke Cloudflare
```bash
cloudflared tunnel login
```
Browser akan terbuka, login dan pilih domain.

### Step 3: Buat Tunnel
```bash
cloudflared tunnel create absen-guru
```

### Step 4: Set DNS Record
```bash
cloudflared tunnel route dns absen-guru subdomain.yourdomain.com
```
Contoh:
```bash
cloudflared tunnel route dns absen-guru absen.sdn19periji.sch.id
```

### Step 5: Jalankan Launcher
```bash
./launcher.sh
# Pilih opsi 6: PM2 + Cloudflare Tunnel
# Pilih opsi 2: Named Tunnel Service
# Masukkan domain yang sudah di-setup
```

## PM2 Commands untuk Tunnel Services

### Status Services
```bash
pm2 status
```

### Logs
```bash
pm2 logs absen-guru-app      # Logs aplikasi
pm2 logs absen-guru-tunnel   # Logs tunnel
pm2 logs                     # Semua logs
```

### Management
```bash
pm2 restart all              # Restart semua
pm2 restart absen-guru-app   # Restart app saja
pm2 stop all                 # Stop semua
pm2 delete all               # Hapus semua dari PM2
```

### Auto-start Setup
```bash
pm2 save                     # Save konfigurasi
pm2 startup                  # Generate startup script
# Jalankan command yang ditampilkan (dengan sudo di Linux/Mac)
```

## Troubleshooting

### Tunnel tidak dapat diakses
1. **Cek status PM2**:
   ```bash
   pm2 status
   ```

2. **Cek logs tunnel**:
   ```bash
   pm2 logs absen-guru-tunnel
   ```

3. **Restart tunnel**:
   ```bash
   pm2 restart absen-guru-tunnel
   ```

### Domain tidak resolve
1. **Cek DNS record** di dashboard Cloudflare
2. **Verify tunnel route**:
   ```bash
   cloudflared tunnel route dns absen-guru yourdomain.com
   ```

### Aplikasi tidak respond
1. **Cek aplikasi**:
   ```bash
   pm2 logs absen-guru-app
   ```

2. **Restart aplikasi**:
   ```bash
   pm2 restart absen-guru-app
   ```

### Port conflicts
Jika port 3000 sudah digunakan:
```bash
pm2 stop all
pm2 delete all
# Restart launcher
```

## Quick Commands Reference

| Action | Command |
|--------|---------|
| Status semua | `pm2 status` |
| Logs app | `pm2 logs absen-guru-app` |
| Logs tunnel | `pm2 logs absen-guru-tunnel` |
| Restart semua | `pm2 restart all` |
| Stop semua | `pm2 stop all` |
| Delete semua | `pm2 delete all` |
| Save config | `pm2 save` |
| Setup startup | `pm2 startup` |

## Security Notes

### Quick Tunnel
- URL dapat diprediksi jika seseorang tahu pola
- Tidak ada autentikasi tambahan dari Cloudflare
- Cocok untuk testing internal

### Named Tunnel  
- Lebih aman dengan domain kontrolmu
- Bisa ditambahkan Cloudflare Access untuk extra security
- Rate limiting dan DDoS protection otomatis
- SSL/TLS certificate otomatis

## Tips Produksi

1. **Gunakan Named Tunnel** untuk production
2. **Setup PM2 auto-startup** untuk server reliability
3. **Monitor logs** secara berkala dengan `pm2 logs`
4. **Backup config** tunnel dengan `pm2 save`
5. **Set domain yang mudah diingat** untuk user
6. **Enable Cloudflare security features** (firewall, rate limiting)

---

**Need Help?** 
- Check launcher opsi 9: 📊 PM2 Management
- Review logs dengan `pm2 logs`
- Restart services dengan `pm2 restart all`