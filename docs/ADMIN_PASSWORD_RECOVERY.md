# 🔐 Admin Password Recovery Guide

## Skenario: Admin Lupa Password

Jika admin lupa password, berikut adalah langkah-langkah untuk melakukan recovery:

## 🚨 Emergency Password Reset

### Langkah 1: Akses Server/Database
```bash
# Pastikan Anda memiliki akses ke server dan database
cd /path/to/absen-guru
```

### Langkah 2: Jalankan Script Reset
```bash
node scripts/reset-admin-password.js
```

### Langkah 3: Gunakan Kredensial Baru
Script akan memberikan:
- **Username**: `admin` 
- **Password**: `Admin20250921!` (dengan timestamp hari ini)
- **Login URL**: `http://localhost:5174/login`

### Langkah 4: Login dan Ubah Password
1. Login dengan kredensial temporary
2. Pergi ke Profile Settings
3. Ubah password ke password yang aman
4. Logout dan login kembali untuk testing

### Langkah 5: Cleanup Security
```bash
# Hapus script setelah digunakan
rm scripts/reset-admin-password.js
```

## 🛡️ Security Features

### Automatic Security Measures:
- **Timestamp-based Password**: Password menggunakan tanggal hari ini
- **All Admin Reset**: Reset semua admin account sekaligus
- **Audit Trail**: Update timestamp dicatat di database
- **Script Deletion**: Panduan menghapus script setelah use

### Manual Security Checklist:
- [ ] Login berhasil dengan password temporary
- [ ] Password diubah ke password yang kuat
- [ ] Script reset dihapus dari server
- [ ] Testing login dengan password baru
- [ ] Dokumentasikan incident (opsional)

## 🔧 Troubleshooting

### Error: "No admin users found"
```bash
# Check database dan user table
# Pastikan ada user dengan role='admin'
```

### Error: Database connection
```bash
# Pastikan database file exists
ls -la absen.db

# Restart application
npm run dev
```

### Password tidak work setelah reset
```bash
# Cek apakah database ter-update
# Jalankan script lagi jika perlu
```

## 🚀 Prevention Tips

1. **Multiple Admin Accounts**: Buat lebih dari satu admin account
2. **Document Passwords**: Simpan password admin di tempat yang aman
3. **Regular Backup**: Backup database secara berkala
4. **Recovery Plan**: Dokumentasikan prosedur recovery

## 📞 Emergency Contacts

Jika masalah persists:
1. Contact system administrator  
2. Check database backup
3. Contact developer support

---

**Last Updated**: September 21, 2025
**Script Version**: v1.0
**Security Level**: High