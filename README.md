# 🏫 Absen Guru v2.0.0 - Sistem Absensi Guru Modern

**Aplikasi web untuk mengelola absensi guru di sekolah.** Mudah digunakan, dapat diakses dari semua perangkat, dan siap pakai!

<div align="center">

![SvelteKit](https://img.shields.io/badge/SvelteKit-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![DaisyUI](https://img.shields.io/badge/DaisyUI-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node.js-v22+-brightgreen.svg)](https://nodejs.org/)
[![pnpm Version](https://img.shields.io/badge/pnpm-9.12+-blue.svg)](https://pnpm.io/)

**🎯 Instalasi 5 Menit | 📱 Akses Multi-Device | 💾 Siap Pakai**

</div>

## 🌟 Mengapa Pilih Absen Guru?

| ✅ **Kelebihan** | 🔥 **Fitur Unggulan** |
|----------------|-------------------|
| 🚀 **Install 5 menit** | Setup otomatis Windows/Linux |
| 📱 **Multi-device** | Akses dari HP, laptop, PC |
| 💾 **Siap pakai** | Database + akun admin sudah ada |
| 🔒 **Aman** | Login terpisah admin & guru |
| 📊 **Laporan otomatis** | Export Excel, TPP, bulanan |
| 🌐 **Tidak perlu internet** | Bisa offline, data tersimpan lokal |
| 🆓 **Gratis selamanya** | Open source, tidak ada biaya |
| 💪 **24/7 with PM2** | Server otomatis restart jika error |

> **💡 Perfect untuk:** Sekolah kecil sampai menengah yang butuh sistem absensi sederhana tapi lengkap!

## 🎯 Apa yang Bisa Dilakukan?

### � **Absensi Harian**
- ✅ **Catat kehadiran guru** dengan status: Hadir, Sakit, Izin, Terlambat, Dinas Luar
- 🎭 **Absen upacara Senin** - Otomatis tracking kehadiran upacara bendera
- 📱 **Akses dari HP atau komputer** - Bisa absen dari mana saja
- 🕒 **Validasi waktu otomatis** - Sistem tahu status berdasarkan jam absen

### 👥 **Kelola Data Guru**
- 👨‍🏫 **Daftar semua guru** dengan data lengkap (NIP, jabatan, kontak)
- 🔐 **Login terpisah untuk Admin dan Guru** - Keamanan terjaga
- 🏛️ **Berbagai jabatan**: Kepala Sekolah, Guru Kelas, Guru Penjaskes, dll
- 📋 **Profile lengkap** setiap guru terintegrasi dengan absensi

### � **Laporan Otomatis**
- � **Laporan bulanan** - Rekap kehadiran per bulan dengan chart
- 💰 **Laporan TPP** - Khusus untuk perhitungan tunjangan PNS/PPPK  
- � **Export ke Excel** - Download laporan dalam format Excel rapi
- 🏫 **Data sekolah otomatis** - Kepala sekolah dan info sekolah ter-update

### 📱 **Seperti Aplikasi Mobile**
- � **Install di HP** - Seperti aplikasi asli dari Play Store
- 💾 **Bekerja offline** - Tetap bisa buka meski internet lemot
- ⚡ **Update otomatis** - Selalu dapat fitur terbaru
- 🌙 **Dark mode** - Nyaman untuk mata di malam hari

### ⚙️ **Pengaturan Sekolah**
- 🏫 **Data sekolah lengkap** - NPSN, alamat, nomor telepon
- 👤 **Pilih kepala sekolah** - Otomatis dari daftar guru
- � **Backup database** - Aman dari kehilangan data
- 🔧 **Setting fleksibel** - Sesuaikan dengan kebutuhan sekolah

---

## 🚀 Cara Install (Super Mudah!)

> **💡 Tips:** Pilih salah satu cara di bawah. Cara 1 paling mudah untuk pemula!

### � **Cara 1: Instalasi Otomatis** (Direkomendasikan)

**Untuk Windows:**
1. Download aplikasi dari GitHub
2. Klik 2x file `setup-windows.bat` 
3. Tunggu sampai selesai
4. Aplikasi siap digunakan!

**Untuk Linux/Ubuntu/VPS:**
1. Download aplikasi 
2. Jalankan: `./setup-linux.sh`
3. Tunggu sampai selesai
4. Aplikasi siap digunakan!

### 🎯 **Cara 2: Instalasi Manual** (Untuk yang suka kontrol)

**Yang dibutuhkan:**
- Komputer Windows/Mac/Linux
- Internet untuk download
- 10-15 menit waktu

**Langkah-langkah:**

1. **Install Node.js** (jika belum ada)
   - Download dari: https://nodejs.org
   - Pilih versi LTS (yang paling kiri)
   - Install seperti aplikasi biasa

2. **Download aplikasi ini**
   ```bash
   git clone https://github.com/sira313/absen-guru.git
   cd absen-guru
   ```

3. **Install dan build**
   ```bash
   npm install -g pnpm   # Install pnpm dulu
   pnpm install         # Install dependencies  
   pnpm build          # Build aplikasi
   ```

---

## 🌐 Cara Menjalankan

### 🏠 **Mode 1: Hanya di Komputer Ini**
```bash
pnpm start
# Buka: http://localhost:3000
```

### 📱 **Mode 2: Akses dari HP/Laptop Lain** (Paling Populer)

**Windows:**
```cmd
start-network.bat
```

**Linux/Mac:**  
```bash
./start-network.sh
```

**Manual:**
```bash
# Ganti 192.168.1.100 dengan IP komputer Anda
ORIGIN=http://192.168.1.100:3000 pnpm start
```

### 🚀 **Mode 3: Server 24/7 dengan PM2**

**Install PM2:**
```bash
npm install -g pm2
```

**Jalankan aplikasi:**
```bash
# Pilihan 1: Hanya lokal
pnpm pm2:start

# Pilihan 2: Akses network (HP/laptop lain bisa akses)
pnpm pm2:start:network  

# Pilihan 3: Mode production (server/hosting)
pnpm pm2:start:prod
```

**Kelola PM2:**
```bash
pnpm pm2:status     # Lihat status
pnpm pm2:logs       # Lihat log
pnpm pm2:stop       # Stop aplikasi
pnpm pm2:restart    # Restart aplikasi
pnpm pm2:monit      # Monitor real-time
```

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

---

## 🔐 Login Pertama Kali

**Setelah aplikasi jalan, buka browser dan masuk dengan:**

### 👑 **Admin (Pengelola Sistem)**
```
Username: admin  
Password: admin123
```
*Admin bisa kelola semua data guru, laporan, dan pengaturan*

### 👨‍🏫 **Guru (Contoh - Opsional)**
```
Username: guru1, guru2, atau guru3
Password: guru123  
```
*Guru hanya bisa absen dan lihat data pribadi*

### ⚠️ **PENTING - Keamanan:**

1. ✅ **Ganti password admin** setelah login pertama!
2. ✅ **Hapus akun guru contoh** jika tidak diperlukan
3. ✅ **Buat akun guru baru** dengan data asli
4. ✅ **Backup database** secara berkala

---

## 🗄️ Database Siap Pakai

**Aplikasi sudah include database lengkap:**

- ✅ **Database sudah ada** (`absen.db`) - tidak perlu setup database
- ✅ **Admin dan guru contoh** sudah dibuatkan
- ✅ **Struktur tabel lengkap** - langsung bisa digunakan  
- ✅ **Data sample** untuk testing fitur

**Tidak perlu jalankan command database apapun - langsung pakai!**

---

## 📱 Cara Mengakses dari HP/Tablet

1. **Pastikan HP dan komputer terhubung WiFi yang sama**
2. **Jalankan aplikasi dengan mode network**:
   - Windows: `start-network.bat`
   - Linux/Mac: `./start-network.sh`
   - PM2: `pnpm pm2:start:network`

3. **Lihat IP address yang muncul**, contoh: `http://192.168.1.100:3000`
4. **Buka browser di HP**, ketik IP tersebut
5. **Login dengan akun admin/guru**
6. **Install ke homescreen** (PWA): Klik menu browser → "Tambah ke layar utama"

**Tips PWA (Progressive Web App):**
- Setelah di-install, aplikasi muncul seperti app asli
- Bisa dibuka tanpa browser
- Bekerja offline (terbatas)
- Update otomatis
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

````bash
Untuk production dengan domain dan HTTPS:

```env
# Contoh untuk domain
ORIGIN=https://yourdomain.com

# Contoh untuk VPS dengan IP
ORIGIN=http://your-server-ip:3000

# Contoh untuk subdomain
ORIGIN=https://absen-guru.example.com
````

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

````

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
````

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

---

## 🆘 Troubleshooting & FAQ

### ❓ **Pertanyaan Sering Ditanya**

**Q: Aplikasi tidak bisa dibuka dari HP?**
A: Pastikan:
- HP dan komputer terhubung WiFi yang sama
- Jalankan dengan mode network (`start-network.bat` atau `pnpm pm2:start:network`)
- Coba matikan Windows Firewall sementara
- Gunakan IP yang muncul di terminal, bukan localhost

**Q: Lupa password admin?**
A: Jalankan: `node scripts/reset-admin-password.js` lalu restart aplikasi

**Q: Database error atau corrupt?**
A: Reset database:
```bash
rm absen.db          # Hapus database lama
pnpm db:push        # Buat struktur baru  
pnpm db:seed        # Isi data sample
```

**Q: Aplikasi lemot atau crash?**
A: 
- Restart aplikasi: `pnpm pm2:restart` 
- Cek log error: `pnpm pm2:logs`
- Pastikan RAM cukup (minimal 1GB free)

**Q: Tidak bisa export Excel?**
A: Pastikan ada data absensi, lalu coba refresh browser

**Q: Aplikasi tidak update setelah git pull?**
A: Jalankan: `pnpm install && pnpm build` lalu restart

### 🔧 **Masalah Umum**

**Port 3000 sudah digunakan:**
```bash
# Lihat proses yang pakai port 3000
netstat -ano | findstr :3000
# Kill prosesnya atau ganti port di .env
```

**Tidak bisa install di Windows:**
- Pastikan Windows PowerShell/CMD run as Administrator
- Install Git for Windows dulu
- Install Node.js dari website resmi

**PM2 error di Windows:**
```bash
# Install ulang PM2
npm uninstall -g pm2
npm install -g pm2@latest
```

### 📞 **Butuh Bantuan?**

1. **Cek log error**: `pnpm pm2:logs` 
2. **Restart aplikasi**: `pnpm pm2:restart`
3. **Reset database**: Hapus `absen.db` → `pnpm db:push` → `pnpm db:seed`
4. **Reinstall**: Hapus `node_modules` → `pnpm install`
5. **Buat issue** di GitHub dengan detail error

---

## 📄 Lisensi

Projekt ini menggunakan lisensi [MIT](LICENSE) - bebas digunakan untuk komersial maupun personal.

## 🙏 Acknowledgments

- Tim pengembang SvelteKit untuk framework yang luar biasa
- Komunitas Tailwind CSS dan DaisyUI  
- Seluruh kontributor open source yang membuat ini mungkin

---

<div align="center">

**Dibuat dengan ❤️ untuk komunitas pendidikan Indonesia**

[⭐ Star di GitHub](https://github.com/sira313/absen-guru) • [🐛 Laporkan Bug](https://github.com/sira313/absen-guru/issues) • [📖 Dokumentasi](https://github.com/sira313/absen-guru/wiki)

</div>
