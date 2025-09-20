# Absen Guru

Sistem absensi untuk guru berbasis web menggunakan SvelteKit.

## Fitur

- 📝 **Absensi Harian**: Guru dapat absen setiap hari dengan waktu real-time
- 📊 **Dashboard Admin**: Rekapitulasi dan laporan absensi lengkap
- 👥 **Multi User**: Sistem role admin dan guru
- 📱 **Responsive**: Dapat diakses dari desktop dan mobile
- 🔒 **Secure**: Authentication dan authorization yang aman
- 💾 **SQLite Database**: Database ringan dan portable
- 🌐 **Cross Platform**: Berjalan di Windows, Linux, dan Raspberry Pi

## Tech Stack

- **Frontend**: Svelte + SvelteKit + DaisyUI 5.1.13 + TailwindCSS 4.0 (alpha)
- **Backend**: Node.js + SvelteKit API Routes
- **Database**: SQLite + better-sqlite3
- **Authentication**: Lucia Auth
- **Package Manager**: pnpm
- **Deployment**: Node.js Adapter (lintas platform)

## Quick Start

### Windows

1. Pastikan Node.js 18+ sudah terinstall
2. Clone repository ini
3. Jalankan setup script:
   ```bash
   setup-windows.bat
   ```
4. Edit file `.env` sesuai kebutuhan
5. Jalankan aplikasi:
   ```bash
   pnpm dev
   ```

### Linux / Raspberry Pi

1. Clone repository ini
2. Jalankan setup script:
   ```bash
   chmod +x setup-linux.sh
   ./setup-linux.sh
   ```
3. Edit file `.env` sesuai kebutuhan
4. Start service:
   ```bash
   sudo systemctl start absen-guru
   ```

## Manual Setup

1. **Install pnpm (if not already installed)**
   ```bash
   npm install -g pnpm
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env file
   ```

4. **Initialize Database**
   ```bash
   pnpm db:seed
   ```

5. **Build & Run**
   ```bash
   pnpm build
   pnpm start
   ```

## Default Login

Setelah setup, gunakan akun berikut untuk login:

**Admin:**
- Username: `admin`
- Password: `admin123`

**Guru (contoh):**
- Username: `guru1`
- Password: `guru123`

**⚠️ Penting:** Ubah password default setelah login pertama!

## Struktur Project

```
src/
├── lib/
│   └── server/
│       ├── database.js      # Database setup & queries
│       ├── auth.js          # Authentication setup
│       ├── users.js         # User management
│       └── attendance.js    # Attendance logic
├── routes/
│   ├── login/              # Login page
│   ├── guru/               # Guru dashboard
│   ├── admin/              # Admin dashboard
│   └── +layout.svelte      # Main layout
└── app.css                 # Global styles
```

## Konfigurasi

Edit file `.env` untuk mengatur:

- `PORT`: Port aplikasi (default: 3000)
- `HOST`: Host binding (default: 0.0.0.0 untuk akses network)
- `ATTENDANCE_HOUR`: Jam wajib absen (default: 08)
- `ATTENDANCE_GRACE_MINUTES`: Toleransi terlambat dalam menit (default: 15)

## Database

Database SQLite akan dibuat otomatis di folder `data/absen.db`. 

Struktur tabel:
- `users`: Data pengguna (admin/guru)
- `user_sessions`: Session authentication
- `attendance`: Record absensi
- `app_settings`: Pengaturan aplikasi

## Deployment Production

### Sebagai Service (Linux)

Setup script akan membuat systemd service. Kontrol dengan:

```bash
sudo systemctl start absen-guru    # Start
sudo systemctl stop absen-guru     # Stop
sudo systemctl restart absen-guru  # Restart
sudo systemctl status absen-guru   # Status
sudo journalctl -u absen-guru -f   # Logs
```

### Manual (Windows/Linux)

```bash
pnpm build
NODE_ENV=production node build/index.js
```

## Development

```bash
pnpm dev          # Development server
pnpm build        # Build production
pnpm preview      # Preview production build
pnpm db:seed      # Seed database
```

## Network Access

Aplikasi akan bind ke `0.0.0.0:3000` sehingga dapat diakses dari:

- Local: `http://localhost:3000`
- Network: `http://[IP-ADDRESS]:3000`
- Raspberry Pi: `http://[PI-IP]:3000`

## Troubleshooting

### Database Issues
- Pastikan folder `data/` ada dan writable
- Jalankan `pnpm db:seed` untuk inisialisasi

### Permission Issues (Linux)
- Pastikan user memiliki akses ke folder project
- Untuk systemd service, sesuaikan `User=` di service file

### Network Access Issues
- Check firewall settings
- Pastikan port 3000 tidak diblokir
- Untuk Raspberry Pi, pastikan WiFi/Ethernet terkonfigurasi

## License

MIT License