# 🚀 Panduan Instalasi Pertama

## Default Credentials

Setelah instalasi pertama, gunakan kredensial default berikut:

### 👑 Administrator
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Administrator dengan akses penuh

### 👨‍🏫 Guru Sample (Optional)
- **Username**: `guru1`, `guru2`, `guru3`
- **Password**: `guru123`
- **Role**: Guru dengan akses terbatas

## ⚠️ PENTING - Keamanan

1. **WAJIB ganti password default** setelah login pertama
2. **Hapus akun guru sample** jika tidak dibutuhkan
3. **Buat akun guru baru** sesuai kebutuhan sekolah
4. **Backup database** secara berkala

## 🔐 Cara Mengganti Password

1. Login dengan akun admin (`admin` / `admin123`)
2. Masuk ke menu **Profile Settings**
3. Ganti password di section **Change Password**
4. Logout dan login kembali dengan password baru

## 👥 Mengelola User

1. Login sebagai admin
2. Masuk ke **Kelola User**
3. Tambah guru baru atau edit guru yang sudah ada
4. Set role, jabatan, dan data guru dengan benar

## 🌐 Universal Deployment

### ✅ **Konfigurasi Universal (Recommended)**

Aplikasi ini sudah dikonfigurasi untuk **deployment universal** tanpa perlu setting IP spesifik:

- ✅ **Local development** (localhost)
- ✅ **Local network** (192.168.x.x, 10.x.x.x)  
- ✅ **VPS/Cloud** (any public IP)
- ✅ **Domain name** (example.com)

### 🛠️ **Quick Deployment**

1. **Build aplikasi**: `pnpm build`
2. **Run aplikasi**: `node build`
3. **Done!** Akses via browser di port 3000

### 📝 **Environment Configuration**

```bash
# Copy template ke .env
cp .env.example .env

# Edit .env dan ubah minimal ini:
SESSION_SECRET="your-super-secure-secret-key-2024"
```

**Tidak perlu set ORIGIN** - otomatis terdeteksi! 🎉

### 🚀 **PM2 Deployment** (Production)

```bash
# Install PM2
npm install -g pm2

# Start aplikasi
pm2 start ecosystem.config.js

# Monitor
pm2 monit
```

### 🔧 **Manual Environment Variables** (Optional)

Jika ada masalah khusus, bisa set manual:
```bash
# Contoh untuk IP spesifik
ORIGIN=http://202.10.48.25:3000 node build

# Atau untuk domain
ORIGIN=https://sekolah.example.com node build
```

## 📱 Akses Mobile

Aplikasi ini sudah mendukung **Progressive Web App (PWA)**:
- Akses via browser mobile
- Install sebagai app di home screen
- Bekerja offline (terbatas)

---

**🏫 Sistem Absensi Guru - Ready for Universal Deployment**