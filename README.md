# 🏫 Absen Guru v1.0.0

Sistem manajemen absensi guru modern berbasis web untuk institusi pendidikan. Dibangun dengan SvelteKit, TailwindCSS v4, dan DaisyUI untuk memberikan pengalaman pengguna yang optimal.

<div align="center">

![SvelteKit](https://img.shields.io/badge/SvelteKit-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![DaisyUI](https://img.shields.io/badge/DaisyUI-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node.js-v18+-brightgreen.svg)](https://nodejs.org/)

</div>

## ✨ Fitur Utama

### 📊 **Manajemen Absensi Cerdas**
- ✅ Absensi harian dengan berbagai status (Hadir, Sakit, Izin, Terlambat, Dinas Luar)
- 🎭 **Sistem upacara otomatis** - Khusus untuk hari Senin dengan tracking terpisah
- 📅 Kalender absensi interaktif
- 🔄 Logika absensi cerdas dengan validasi otomatis

### 👥 **Manajemen User & Jabatan**
- 🔐 Sistem autentikasi berbasis role (Admin, Guru)
- �‍🏫 Manajemen profil guru lengkap dengan jabatan
- 🏛️ Jabatan tersedia: Kepala Sekolah, Guru Kelas, Guru Penjaskes, Guru Agama, Administrator
- 📋 Data personil terintegrasi dengan sistem absensi

### � **Laporan Komprehensif**
- 📊 Laporan bulanan dengan analisis kehadiran
- 🏆 **Laporan TPP (Tambahan Penghasilan Pegawai)** dengan filter PNS/PPPK
- 📑 Export Excel dengan format yang rapi dan data lengkap
- � Integrasi data kepala sekolah otomatis dari database
- � Filter berdasarkan tipe pegawai dan periode

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

### 💾 **Instalasi One-Click** (Recommended)

**Windows:**
```cmd
# Download dan jalankan setup otomatis
setup-windows.bat
```

**Linux/macOS:**
```bash
# Download dan jalankan setup otomatis  
./setup-linux.sh
```

### 🔧 **Manual Installation**

### Windows

1. **Clone repository:**
   ```bash
   git clone https://github.com/username/absen-guru.git
   cd absen-guru
   ```

2. **Jalankan setup otomatis:**
   ```cmd
   setup-windows.bat
   ```

3. **Akses aplikasi:**
   - Development: http://localhost:5173
   - Production: http://localhost:3000

### Linux/Ubuntu/Raspberry Pi

1. **Clone repository:**
   ```bash
   git clone https://github.com/username/absen-guru.git
   cd absen-guru
   ```

2. **Jalankan setup otomatis:**
   ```bash
   chmod +x setup-linux.sh
   ./setup-linux.sh
   ```

3. **Akses aplikasi:**
   - Development: http://localhost:5173
   - Production: http://localhost:3000

### Manual Installation

Jika Anda ingin install manual:

1. **Prerequisites:**
   ```bash
   # Install Node.js 18+ dan pnpm
   npm install -g pnpm
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Setup database:**
   ```bash
   pnpm run db:push    # Membuat schema database
   pnpm run db:seed    # Menambahkan data awal
   ```

4. **Build dan jalankan:**
   ```bash
   # Development
   pnpm dev

   # Production
   pnpm build
   pnpm start
   # atau manual: node build/index.js
   ```

## � Default Credentials

### 👑 **Administrator**
```
Username: admin
Password: admin123
Role: Full access
```

### 👨‍🏫 **Sample Guru (Optional)**
```
Username: guru1, guru2, guru3
Password: guru123
Role: Teacher access
```

### ⚠️ **PENTING - Keamanan**
1. **WAJIB ganti password** setelah login pertama
2. **Hapus akun guru sample** jika tidak dibutuhkan
3. **Backup database** secara berkala
4. **Gunakan HTTPS** di production

📖 **Panduan lengkap:** [FIRST_INSTALL.md](FIRST_INSTALL.md)

> ⚠️ **Penting:** Segera ubah password default setelah login pertama!

> 📝 **Note:** Aplikasi menggunakan adapter-node, jadi untuk production gunakan `pnpm start` bukan `pnpm preview`
## 📖 Panduan Penggunaan

### Untuk Administrator

1. **Setup Awal:**
   - Login sebagai admin
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

# Session Secret (WAJIB diubah untuk production)
SESSION_SECRET="your-super-secret-key-change-this"

# Server Configuration (opsional)
PORT=3000
HOST=0.0.0.0
```

### Database Schema

Sistem menggunakan SQLite dengan tabel utama:
- `users` - Data guru dan admin
- `attendance` - Record absensi harian
- `settings` - Konfigurasi aplikasi

## 🔧 Development

### Scripts Tersedia

```bash
# Development dengan hot reload
pnpm dev

# Build untuk production
pnpm build

# Start production server
pnpm start

# Preview build hasil
pnpm preview

# Type checking
pnpm check

# Linting
pnpm lint

# Code formatting
pnpm format

# Database operations
pnpm db:push     # Apply schema changes
pnpm db:studio   # Open database GUI
pnpm db:seed     # Seed initial data

# One-command setup
pnpm setup       # Install + db:push + db:seed
```

### Database Management

```bash
# Reset admin password
node scripts/reset-admin-password.js

# Setup school settings
node scripts/setup-school-settings.js
```

## 🚀 Deployment

### Production Server

1. **Build aplikasi:**
   ```bash
   pnpm build
   ```

2. **Jalankan dengan PM2:**
   ```bash
   npm install -g pm2
   pm2 start build/index.js --name absen-guru
   pm2 startup
   pm2 save
   ```

3. **Atau dengan systemd** (Linux):
   ```bash
   # Setup script sudah membuat service file
   sudo systemctl start absen-guru
   sudo systemctl enable absen-guru
   ```

### Nginx Proxy (Opsional)

Konfigurasi nginx untuk reverse proxy:

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

[⭐ Star di GitHub](https://github.com/username/absen-guru) • [🐛 Laporkan Bug](https://github.com/username/absen-guru/issues) • [📖 Dokumentasi](https://github.com/username/absen-guru/wiki)

</div>