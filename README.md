# 🏫 Absen Guru v2.0.0 - Production Ready

Sistem manajemen absensi guru modern berbasis web untuk institusi pendidikan. Dibangun dengan SvelteKit, TailwindCSS v4, dan DaisyUI dengan dukungan PWA untuk pengalaman seperti aplikasi native.

<div align="center">

![SvelteKit](https://img.shields.io/badge/SvelteKit-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![DaisyUI](https://img.shields.io/badge/DaisyUI-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node.js-v22+-brightgreen.svg)](https://nodejs.org/)
[![pnpm Version](https://img.shields.io/badge/pnpm-9.12+-blue.svg)](https://pnpm.io/)

</div>

## ✨ Fitur Utama

### 📱 **Progressive Web App (PWA)**

- 🚀 Install langsung ke device sebagai aplikasi native
- 💾 Offline-first capabilities dengan service worker
- ⚡ Auto-update dan caching otomatis
- 📲 Push notifications untuk reminder
- 🎯 App shortcuts dan native-like experience

### 📊 **Manajemen Absensi Cerdas**

- ✅ Absensi harian dengan berbagai status (Hadir, Sakit, Izin, Terlambat, Dinas Luar)
- 🎭 **Sistem upacara otomatis** - Khusus untuk hari Senin dengan tracking terpisah
- 📅 Kalender absensi interaktif dengan pagination
- 🔄 Logika absensi cerdas dengan validasi otomatis

### 👥 **Manajemen User & Jabatan**

- 🔐 Sistem autentikasi berbasis role (Admin, Guru)
- 👨‍🏫 Manajemen profil guru lengkap dengan jabatan
- 🏛️ Jabatan tersedia: Kepala Sekolah, Guru Kelas, Guru Penjaskes, Guru Agama, Administrator
- 📋 Data personil terintegrasi dengan sistem absensi

### 📈 **Laporan Komprehensif**

- 📊 Laporan bulanan dengan analisis kehadiran
- 🏆 **Laporan TPP (Tambahan Penghasilan Pegawai)** dengan filter PNS/PPPK
- 📑 Export Excel dengan format yang rapi dan data lengkap
- 👤 Integrasi data kepala sekolah otomatis dari database
- 🔍 Filter berdasarkan tipe pegawai dan periode

### 🏢 **Pengaturan Sekolah**

- 🏫 Manajemen data sekolah (NPSN, alamat, kontak)
- 👤 **Pemilihan kepala sekolah otomatis** dari database user
- 🔧 Konfigurasi sistem yang fleksibel
- 🗄️ Backup dan restore database

### 🎨 **Antarmuka Modern**

- 📱 Responsive design untuk desktop dan mobile
- 🌙 Dark mode support dengan DaisyUI themes
- 🎭 Animasi smooth dan transisi yang elegan
- ♿ Accessibility compliant (A11y standards)
- 🚀 Performance optimized dengan SvelteKit

### 📱 **Progressive Web App (PWA)**

- 💾 **Installable** - Install di home screen perangkat mobile
- ⚡ **Offline capable** - Bekerja tanpa koneksi internet (terbatas)
- 🔄 **Auto-update** - Update otomatis tanpa download manual
- 📞 **Native-like experience** - Seperti aplikasi native

## 🚀 Quick Start

### 💾 **Instalasi & Setup** (Recommended)

**1. Clone dan Install:**
```bash
git clone https://github.com/sira313/absen-guru.git
cd absen-guru
pnpm install && pnpm build
```

**2. Pilih Mode Akses:**

#### **🏠 Local Development**
```bash
pnpm dev
# Akses: http://localhost:5173
```

#### **🌐 Network Access (Multi-Device)**

**Windows:**
```cmd
# Auto-detect IP dan start server
start-network.bat
```

**Linux/macOS:**
```bash  
# Auto-detect IP dan start server
./start-network.sh
```

**Manual (All OS):**
```bash
# Ganti IP dengan IP komputer Anda
ORIGIN=http://192.168.1.100:3000 pnpm start
```

#### **🚀 Production Deployment**
```bash
NODE_ENV=production ORIGIN=https://yourdomain.com pnpm start
```

### 📋 **Setup Otomatis (Full Installation)**

**Windows:**
```cmd
setup-windows.bat
```

**Linux/macOS/VPS:**
```bash
./setup-linux.sh
```

### 🔧 **Manual Installation**

#### Prerequisites

- **Node.js v22.19.0 LTS** atau lebih baru ([Download](https://nodejs.org/en/blog/release/v22.19.0))
- **pnpm v9.12+** package manager ([Install Guide](https://pnpm.io/installation))

```bash
# Install Node.js (jika belum ada)
# Download dari https://nodejs.org/

# Install pnpm terbaru menggunakan npm
npm install -g pnpm@latest

# Atau menggunakan Corepack (built-in dengan Node.js v22+)
corepack enable pnpm
corepack use pnpm@latest

# Atau install via curl (Linux/macOS)
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

#### Installation Steps

### Windows

1. **Clone repository:**

   ```bash
   git clone https://github.com/sira313/absen-guru.git
   cd absen-guru
   ```

2. **Setup aplikasi:**

   ```cmd
   # Install dependencies
   pnpm install

   # Setup database (sudah ada absen.db default)
   # Database sudah siap, tidak perlu db:push atau seed

   # Build untuk production
   pnpm build

   # Run production server with NODE_ENV
   NODE_ENV=production pnpm start
   # Atau gunakan: NODE_ENV=production node build
   ```

3. **Akses aplikasi:**
   - Production: http://localhost:3000

### Linux/Ubuntu/VPS

1. **Clone repository:**

   ```bash
   git clone https://github.com/sira313/absen-guru.git
   cd absen-guru
   ```

2. **Setup aplikasi:**

   ```bash
   # Install dependencies
   pnpm install

   # Setup database (sudah ada absen.db default)
   # Database sudah siap, tidak perlu db:push atau seed

   # Build untuk production
   pnpm build

   # Run production server with NODE_ENV
   NODE_ENV=production pnpm start
   # Atau: NODE_ENV=production node build
   ```

3. **Akses aplikasi:**
   - Production: http://localhost:3000
   - Mobile/Network: http://YOUR_IP:3000

### 🌐 **Environment Configuration**

**Aplikasi ini mendukung berbagai mode deployment dengan konfigurasi environment variables:**

#### **1. Local Development** 
```bash
# Development dengan hot reload (localhost only)
pnpm dev
# Akses: http://localhost:5173
```

#### **2. Network Testing** 
```bash
# Testing di network local (akses via IP address)
ORIGIN=http://192.168.x.x:3000 pnpm start
# Akses: http://192.168.x.x:3000 (ganti dengan IP Anda)
```

#### **3. Production Deployment**
```bash
# Production server
NODE_ENV=production ORIGIN=https://yourdomain.com pnpm start
# Atau dengan IP: NODE_ENV=production ORIGIN=http://your-ip:3000 pnpm start
```

**Quick Deploy untuk Testing:**

```bash
# Clone dan setup
git clone https://github.com/sira313/absen-guru.git
cd absen-guru
pnpm install && pnpm build

# Network testing (ganti IP sesuai dengan IP komputer Anda)
ORIGIN=http://192.168.1.100:3000 pnpm start
```

**PM2 Production Deploy:**

```bash
# Install PM2
npm install -g pm2

# Start dengan PM2
pm2 start ecosystem.config.js

# Monitor
pm2 monit
```

## � Default Credentials

### 👑 **Administrator**

```
Username: admin
Password: admin123
Role: Full access
```

## 🔐 Default Login

### � **Administrator**

```
Username: admin
Password: admin123
Role: Full admin access
```

### �👨‍🏫 **Sample Guru (Optional)**

```
Username: guru1, guru2, guru3
Password: guru123
Role: Teacher access
```

### ⚠️ **PENTING - Keamanan Production**

1. **WAJIB ganti password default** setelah login pertama
2. **Hapus akun guru sample** jika tidak dibutuhkan
3. **Setup environment variables** untuk production
4. **Backup database** secara berkala
5. **Gunakan HTTPS** di production dengan reverse proxy

📖 **Panduan lengkap:** [FIRST_INSTALL.md](FIRST_INSTALL.md)

> ⚠️ **Penting:** Segera ubah password default setelah login pertama!

## �️ Database Ready

**Database `absen.db` sudah tersedia** dengan schema dan data sample:

- ✅ Tables sudah dibuat dengan migrasi Drizzle
- ✅ Default admin dan guru sample sudah ada
- ✅ Tidak perlu jalankan `db:push` atau `seed`
- ✅ Langsung `pnpm build` → `node build` → ready to use!

**Database includes:**

- 👤 Admin account: `admin/admin123`
- 👨‍🏫 Sample teachers: `guru1,guru2,guru3/guru123`
- 📋 Complete schema with positions, attendance, etc.

## 📖 Panduan Penggunaan

### Untuk Administrator

1. **Setup Awal:**
   - Login sebagai admin (`admin/admin123`)
   - Pergi ke menu "Pengaturan" → lengkapi data sekolah
   - Tambahkan user guru di menu "Kelola User"
   - Pastikan ada user dengan jabatan "Kepala Sekolah" untuk laporan

2. **Manajemen User:**
   - Buat akun untuk setiap guru
   - Set jabatan yang sesuai (Guru Kelas, Guru Penjaskes, dll)
   - Atur tipe pegawai (PNS, CPNS, PPPK) untuk laporan TPP

3. **Laporan:**
   - Menu "Laporan" untuk melihat statistik bulanan
   - Export ke Excel untuk dokumentasi resmi
   - Filter laporan TPP berdasarkan status pegawai

### Untuk Guru

1. **Absensi Harian:**
   - Login dengan akun yang diberikan admin
   - Klik tombol absensi sesuai status kehadiran
   - Untuk hari Senin, sistem akan otomatis menanyakan status upacara

2. **Riwayat:**
   - Cek riwayat absensi di menu "Riwayat"
   - Lihat statistik kehadiran personal

## 🏗️ Arsitektur Teknologi

### Frontend

- **SvelteKit** - Framework web modern dengan SSR
- **TailwindCSS v4** - Utility-first CSS framework
- **DaisyUI 5.1.13** - Component library untuk UI yang konsisten
- **Lucide Svelte** - Icon library yang elegan

### Backend

- **SQLite** - Database ringan dan portable
- **Drizzle ORM** - Type-safe ORM untuk TypeScript
- **SvelteKit API Routes** - Server-side API handling

### Fitur Khusus

- **ExcelJS** - Generate laporan Excel dengan formatting lengkap
- **Zod** - Schema validation untuk data integrity
- **bcrypt** - Password hashing untuk keamanan
- **date-fns** - Date manipulation dan formatting

## 📁 Struktur Project

```
absen-guru/
├── src/
│   ├── lib/
│   │   └── server/           # Server-side logic
│   │       ├── auth.js       # Autentikasi
│   │       ├── attendance.js # Logic absensi
│   │       ├── db.js         # Database helpers
│   │       ├── excel-generator.js # Export Excel
│   │       ├── schema.js     # Database schema
│   │       └── users.js      # User management
│   └── routes/
│       ├── admin/            # Admin pages
│       │   ├── laporan/      # Laporan & export
│       │   ├── pengaturan/   # Settings
│       │   └── users/        # User management
│       ├── guru/             # Teacher pages
│       │   └── riwayat/      # Attendance history
│       ├── login/            # Authentication
│       └── profile/          # User profile
├── scripts/
│   ├── seed.js              # Database seeding
│   ├── setup-school-settings.js
│   └── reset-admin-password.js
├── static/                  # Static assets
├── setup-windows.bat        # Windows installer
├── setup-linux.sh          # Linux installer
└── package.json
```

## ⚙️ Konfigurasi

### Environment Variables

Buat file `.env` dengan konfigurasi berikut:

```env
# Database
DATABASE_URL="file:./absen.db"
DB_FILE_NAME=file:absen.db

# Server Configuration (opsional)
PORT=3000
HOST=0.0.0.0

# Production only - set ORIGIN untuk CSRF protection
# ORIGIN=https://yourdomain.com
```

### Database Schema

Sistem menggunakan SQLite dengan tabel utama:

- `users` - Data guru dan admin
- `attendance` - Record absensi harian
- `settings` - Konfigurasi aplikasi

## 🔧 Development

### Scripts Tersedia

```bash
# Development
pnpm dev                    # Development dengan hot reload (localhost:5173)
pnpm preview               # Preview build hasil

# Production  
pnpm build                 # Build untuk production
pnpm start                 # Start production server (localhost:3000)
pnpm start:prod           # Start dengan NODE_ENV=production
pnpm start:network        # Info untuk network access

# Network Access (Auto IP Detection)
./start-network.sh        # Linux/macOS - auto detect IP
start-network.bat         # Windows - auto detect IP  

# Manual Network Setup
ORIGIN=http://192.168.1.100:3000 pnpm start   # Manual IP setup

# Development Tools
pnpm check                # Type checking
pnpm lint                 # Linting
pnpm format              # Code formatting  

# Database
pnpm db:push             # Apply schema changes
pnpm db:studio          # Open database GUI  
pnpm db:seed            # Seed initial data

# Setup
pnpm setup              # One-command: install + db:push + db:seed
```

### Database Management

```bash
# Reset admin password
node scripts/reset-admin-password.js

# Setup school settings
node scripts/setup-school-settings.js
```

## 🚀 Deployment

### 🔐 **Secure CSRF Configuration** (v2.0.0)

Aplikasi menggunakan **proper CSRF protection** dengan konfigurasi yang aman:

- ✅ **Development** - Auto-detect localhost ports (5173, 5174, 3000)
- ✅ **Production** - Menggunakan `ORIGIN` environment variable untuk security

**🚨 WAJIB untuk Production:**
Set environment variable `ORIGIN` sesuai domain/IP server Anda:

```bash
Untuk production dengan domain dan HTTPS:

```env
# Contoh untuk domain
ORIGIN=https://yourdomain.com

# Contoh untuk VPS dengan IP
ORIGIN=http://your-server-ip:3000

# Contoh untuk subdomain
ORIGIN=https://absen-guru.example.com
```

## 🔧 **Environment Variables Guide**

### **NODE_ENV Configuration**

⚠️ **PENTING**: `NODE_ENV` tidak boleh di-set di file `.env` (tidak didukung Vite). Gunakan command line atau environment variables.

```bash
# ❌ SALAH - di file .env
NODE_ENV=production

# ✅ BENAR - via command line
NODE_ENV=production pnpm start
```

### **CSRF & Network Access**

Aplikasi menggunakan CSRF protection yang berbeda berdasarkan environment:

#### **Development Mode** (default)
```bash
pnpm dev
# - CSRF checks disabled
# - Akses: localhost only
```

#### **Network Testing Mode** 
```bash
ORIGIN=http://192.168.x.x:3000 pnpm start  
# - CSRF allows network origin
# - NODE_ENV masih development
# - Akses: localhost + network IP
```

#### **Production Mode**
```bash  
NODE_ENV=production ORIGIN=https://yourdomain.com pnpm start
# - CSRF strict mode
# - Only specified origin allowed
# - Optimized performance
```

### **Troubleshooting Network Access**

**Masalah**: Login gagal dengan error 403 Forbidden

**Solusi**:
1. **Pastikan ORIGIN di-set dengan benar**:
   ```bash
   # Ganti dengan IP komputer Anda
   ORIGIN=http://192.168.1.100:3000 pnpm start
   ```

2. **Cek IP address komputer**:
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac  
   ifconfig
   ```

3. **Pastikan port tidak terblokir firewall**

📖 **Untuk panduan lengkap network setup dan troubleshooting, lihat: [NETWORK_SETUP.md](./NETWORK_SETUP.md)**
```

### 📦 **VPS Deployment dengan PM2**

**1. Clone dan Setup di VPS:**

```bash
# Login ke VPS
ssh root@your-vps-ip

# Clone repository
git clone https://github.com/sira313/absen-guru.git
cd absen-guru

# Install dependencies dan build
pnpm install
pnpm build
```

**2. Setup PM2:**

```bash
# Install PM2 global
npm install -g pm2

# Start dengan ecosystem config
pm2 start ecosystem.config.js

# Auto-start saat reboot
pm2 startup
pm2 save

# Monitor aplikasi
pm2 status
pm2 logs absen-guru
```

**3. Akses Aplikasi:**

- URL: `http://your-vps-ip:3000`
- Login: admin / admin123

### 🔧 **Local/Development Server**

**1. Development mode:**

```bash
pnpm dev
# Akses: http://localhost:5173
```

**2. Production mode:**

```bash
pnpm build
pnpm start
# Akses: http://localhost:3000
```

### 🌐 **Nginx Reverse Proxy** (Opsional)

Untuk production dengan domain dan HTTPS:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add: Amazing feature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📝 Changelog

### v2.0.0 (2025-09-22)

- 🌐 **Universal CSRF Configuration** - Otomatis bekerja di semua environment (localhost, LAN, VPS, domain)
- 🚀 **PM2 ES Module Support** - Production deployment dengan ecosystem.config.js yang proper
- 🔧 **Node.js v22+ Support** - Update ke Node.js LTS terbaru dengan performa optimal
- 📦 **pnpm v9.12+ Support** - Package manager terbaru dengan caching yang lebih baik
- 🐛 **Frontend JavaScript Fix** - Resolve "Illegal invocation" error di admin settings
- 🗄️ **Database Refresh** - Fresh sample data dengan schema terbaru
- 📚 **Documentation Update** - Panduan deployment VPS dan troubleshooting lengkap
- ⚡ **Performance Improvements** - Optimasi konfigurasi untuk production deployment

### v1.0.0 (2025-09-21)

- ✨ Initial release
- 🎭 Sistem absensi dengan logic upacara Senin
- 👥 Manajemen user dengan jabatan
- 📊 Laporan Excel dengan integrasi data kepala sekolah
- ♿ A11y compliance
- 🏗️ Setup scripts untuk Windows dan Linux

## 🐛 Bug Reports & Feature Requests

Laporkan bug atau request fitur melalui [GitHub Issues](https://github.com/sira313/absen-guru/issues).

## 📄 Lisensi

Projekt ini menggunakan lisensi [MIT](LICENSE).

## 🙏 Acknowledgments

- Tim pengembang SvelteKit untuk framework yang luar biasa
- Komunitas Tailwind CSS dan DaisyUI
- Seluruh kontributor open source

---

<div align="center">

**Dibuat dengan ❤️ untuk komunitas pendidikan Indonesia**

[⭐ Star di GitHub](https://github.com/sira313/absen-guru) • [🐛 Laporkan Bug](https://github.com/sira313/absen-guru/issues) • [📖 Dokumentasi](https://github.com/sira313/absen-guru/wiki)

</div>
