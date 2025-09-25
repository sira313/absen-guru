# 🏫 Absen Guru - Sistem Absensi Sekolah Modern

> **Aplikasi web sederhana untuk mencatat kehadiran guru di sekolah. Bisa diakses dari HP, laptop, atau komputer. Gratis dan mudah digunakan!**

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-22+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20Mac-lightgrey)]()

**🎯 Setup 5 Menit | 📱 Multi Device | 💾 Siap Pakai**

</div>

---

## 🤔 Untuk Apa Aplikasi Ini?

**Absen Guru** adalah sistem untuk mencatat kehadiran guru di sekolah. Aplikasi ini dibuat khusus untuk:

- 🏫 **Sekolah kecil sampai menengah** yang butuh sistem absensi digital
- 👩‍🏫 **Guru dan staff** yang ingin absen lebih mudah dan modern  
- 👨‍💼 **Admin sekolah** yang perlu laporan kehadiran otomatis
- 💰 **Sekolah dengan budget terbatas** - aplikasi ini gratis selamanya!

## ✨ Apa Saja yang Bisa Dilakukan?

### 📋 **Absensi Harian**
- ✅ Guru bisa absen dari HP atau komputer
- ⏰ Otomatis catat jam masuk dan pulang
- 📊 Status lengkap: Hadir, Sakit, Izin, Terlambat, Dinas Luar
- 🗓️ Lihat riwayat absensi per hari/bulan

### 👥 **Kelola Data Guru**
- 👨‍🏫 Daftar semua guru dengan data lengkap
- 🔐 Login terpisah untuk Admin dan Guru
- 📝 Update profile dan data pribadi
- 🏷️ Berbagai jabatan dan status kepegawaian

### 📊 **Laporan Otomatis**
- 📈 Rekap absensi harian, mingguan, bulanan
- 📋 Export ke Excel untuk keperluan administrasi
- 💰 Laporan TPP (Tunjangan Profesi Pendidik)
- 📤 Download backup database

---

## 🚀 Cara Install (Super Mudah!)

### **Metode 1: Otomatis (Recommended)**

#### **Windows**
1. Download aplikasi
2. Double-click file `setup-windows.bat`
3. Tunggu sampai selesai (5-10 menit)
4. Buka browser, ketik: `http://localhost:3000`
5. Login dengan: **admin** / **admin123**

#### **Linux/Ubuntu**
1. Download aplikasi  
2. Jalankan: `./setup-linux.sh`
3. Tunggu sampai selesai
4. Buka browser, ketik: `http://localhost:3000`
5. Login dengan: **admin** / **admin123**

### **Metode 2: Manual** (untuk yang suka kontrol)
Lihat panduan lengkap: [📖 **FIRST_INSTALL.md**](FIRST_INSTALL.md)

---

## 🖥️ Cara Menjalankan

### **🎯 Launcher Universal (Termudah)**

Aplikasi punya launcher yang akan tanya mau dijalankan gimana:

#### **Windows**
```cmd
launcher.bat
```

#### **Linux/Mac**
```bash
./launcher.sh
```

**Menu yang tersedia:**
- **[1] Development** - Untuk testing (localhost:5174)
- **[2] Local Network** - Bisa diakses dari HP dalam WiFi yang sama 
- **[3] PM2 Local** - Production mode lokal dengan monitoring
- **[4] PM2 Network** - Production 24/7 dengan akses jaringan
- **[5] Cloudflare Tunnel** - Akses dari internet (advanced)
- **[6] Setup Database** - Install database saja
- **[7] Reset Database** - Mulai dari nol
- **[8] PM2 Management** - Kelola server

> 📖 **Detail lengkap:** [**LAUNCHER.md**](LAUNCHER.md)

### **🌐 Akses dari HP/Laptop Lain**

Pilih **opsi [2] atau [4]** di launcher, nanti akan dapat IP seperti: `http://192.168.1.100:3000`

Buka IP tersebut di browser HP/laptop lain dalam WiFi yang sama.

> 📖 **Panduan lengkap:** [**NETWORK_SETUP.md**](NETWORK_SETUP.md)

---

## 👤 Login Pertama Kali

Setelah install, login dengan:

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123` |
| **Guru** | `guru1` | `guru123` |

> ⚠️ **PENTING:** Ganti password default setelah login pertama!

**Lupa password admin?** Lihat: [**docs/ADMIN_PASSWORD_RECOVERY.md**](docs/ADMIN_PASSWORD_RECOVERY.md)

---

## 📚 Dokumentasi Lengkap

### **🚀 Panduan Setup**
- [📖 **FIRST_INSTALL.md**](FIRST_INSTALL.md) - Panduan install step-by-step
- [🚀 **LAUNCHER.md**](LAUNCHER.md) - Cara menggunakan launcher
- [🌐 **NETWORK_SETUP.md**](NETWORK_SETUP.md) - Setup akses dari jaringan
- [🏭 **DEPLOYMENT_GUIDE.md**](DEPLOYMENT_GUIDE.md) - Deploy ke server/hosting

### **📋 Panduan Penggunaan**
- [✅ **PRODUCTION_READY.md**](PRODUCTION_READY.md) - Siapkan untuk produksi
- [📊 **docs/EXPORT_DATABASE_CHANGES.md**](docs/EXPORT_DATABASE_CHANGES.md) - Cara export/backup data
- [🔐 **docs/ADMIN_PASSWORD_RECOVERY.md**](docs/ADMIN_PASSWORD_RECOVERY.md) - Reset password admin

### **🔧 Info Teknis**  
- [🧹 **docs/CLEANUP_SUMMARY.md**](docs/CLEANUP_SUMMARY.md) - Log perubahan sistem
- [⚙️ **.github/copilot-instructions.md**](.github/copilot-instructions.md) - Panduan development

---

## ❓ FAQ (Pertanyaan Sering Ditanya)

<details>
<summary><strong>🤔 Apakah aplikasi ini gratis?</strong></summary>

**Ya, selamanya gratis!** Aplikasi ini open source dengan lisensi MIT. Tidak ada biaya langganan atau fitur berbayar.
</details>

<details>
<summary><strong>📱 Bisa diakses dari HP?</strong></summary>

**Bisa!** Pilih mode network di launcher, nanti dapat IP address yang bisa dibuka di browser HP dalam WiFi yang sama.
</details>

<details>
<summary><strong>🌐 Perlu internet?</strong></summary>

**Tidak perlu internet untuk operasional harian.** Data tersimpan di komputer lokal. Internet hanya perlu saat install pertama kali.
</details>

<details>
<summary><strong>💾 Bagaimana backup data?</strong></summary>

Login sebagai admin → Pengaturan → Export Database. File backup akan terdownload ke komputer.
</details>

<details>
<summary><strong>🔧 Bagaimana update aplikasi?</strong></summary>

Download versi terbaru, backup data dulu, lalu install ulang. Data bisa di-import kembali.
</details>

<details>
<summary><strong>⚠️ Server error/tidak bisa diakses?</strong></summary>

1. Buka launcher → pilih [8] PM2 Management → [4] Restart
2. Atau jalankan ulang launcher → pilih mode yang sama
3. Cek panduan: [NETWORK_SETUP.md](NETWORK_SETUP.md)
</details>

---

## 📞 Butuh Bantuan?

- 📋 **Laporan Bug:** [GitHub Issues](https://github.com/sira313/absen-guru/issues)
- 📖 **Dokumentasi:** Lihat file `*.md` di repository ini
- 💡 **Saran Fitur:** Buat issue dengan label "enhancement"

---

## 🛠️ Info Teknis (untuk Developer)

### **Tech Stack**
- **Frontend:** SvelteKit + TailwindCSS + DaisyUI
- **Backend:** Node.js + SvelteKit SSR
- **Database:** SQLite + Drizzle ORM
- **Process Manager:** PM2
- **PWA:** Service Worker + Manifest

### **Minimum Requirements**
- **OS:** Windows 10+, Ubuntu 18+, macOS 10.15+
- **RAM:** 512MB available
- **Storage:** 100MB free space
- **Node.js:** v18+ (otomatis terinstall)

### **Development**
```bash
git clone https://github.com/sira313/absen-guru.git
cd absen-guru
pnpm install
pnpm dev
```

---

## 📄 License

MIT License - Lihat [LICENSE](LICENSE) untuk detail lengkap.

**Made with ❤️ for Indonesian Schools**

---

<div align="center">

**⭐ Kalau aplikasi ini berguna, jangan lupa kasih star di GitHub!**

[![GitHub stars](https://img.shields.io/github/stars/sira313/absen-guru?style=social)](https://github.com/sira313/absen-guru/stargazers)

</div>