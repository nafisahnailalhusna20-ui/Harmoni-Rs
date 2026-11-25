# HARMONI Healthcare

### Hospital Information System

HARMONI Healthcare merupakan aplikasi **Sistem Informasi Rumah Sakit (Hospital Information System)** yang dikembangkan untuk membantu proses pengelolaan layanan kesehatan secara digital.

Aplikasi ini dirancang untuk menghubungkan pasien, dokter, administrator, dan bagian farmasi dalam satu sistem yang terintegrasi. Dengan adanya HARMONI, proses administrasi, konsultasi, pencatatan rekam medis, serta pengelolaan resep obat dapat dilakukan dengan lebih terstruktur.

---

## Tentang Proyek

HARMONI Healthcare dikembangkan sebagai proyek akhir individu untuk menerapkan konsep Sistem Informasi dalam bidang pelayanan kesehatan.

Sistem ini memiliki beberapa peran pengguna dengan hak akses yang berbeda, sehingga setiap pengguna dapat menjalankan fungsi sesuai tanggung jawabnya.

### Tujuan Pengembangan

- Mendigitalisasi proses pelayanan rumah sakit.
- Mempermudah pengelolaan data pasien dan dokter.
- Membantu proses pendaftaran dan pengelolaan janji temu.
- Menyediakan pencatatan rekam medis secara terstruktur.
- Mendukung pengelolaan resep dan informasi obat.
- Meningkatkan keteraturan administrasi rumah sakit.

---

## Teknologi yang Digunakan

| Teknologi      | Kegunaan                              |
| -------------- | ------------------------------------- |
| Next.js        | Framework pengembangan aplikasi web   |
| React          | Pembuatan antarmuka pengguna          |
| JavaScript JSX | Bahasa dan format penulisan komponen  |
| Tailwind CSS   | Pengaturan dan styling antarmuka      |
| PostgreSQL     | Sistem manajemen basis data           |
| pgAdmin 4      | Pengelolaan dan administrasi database |
| Node.js        | Lingkungan untuk menjalankan aplikasi |

---

## Fitur Sistem

### 1. Pasien

- Registrasi dan login akun.
- Melihat daftar dokter dan informasi poli.
- Membuat dan mengelola janji temu.
- Melihat riwayat pemeriksaan.
- Melihat diagnosis dan catatan dokter.
- Melihat informasi resep obat.
- Mencari informasi obat.
- Mengelola profil dan mengganti password.

### 2. Dokter

- Melihat janji temu yang telah disetujui.
- Mengelola jadwal praktik.
- Mencatat hasil pemeriksaan pasien.
- Memberikan diagnosis dan tindakan.
- Menambahkan catatan pemeriksaan.
- Menuliskan resep obat.
- Melihat riwayat rekam medis pasien.
- Mencari informasi obat.

### 3. Administrator

- Mengelola akun pengguna.
- Mengelola data dokter dan pasien.
- Mengelola data poli.
- Mengelola informasi obat.
- Mengelola janji temu.
- Mengelola data dan kebutuhan administrasi rumah sakit.

### 4. Farmasi

- Melihat resep obat yang masuk.
- Memproses resep berdasarkan status.
- Mengelola penyiapan obat.
- Memantau ketersediaan stok obat.

---

## Struktur Database

HARMONI Healthcare menggunakan PostgreSQL sebagai basis data utama.

Database menyimpan data yang berkaitan dengan:

- Pengguna dan hak akses.
- Data poli.
- Jadwal praktik dokter.
- Janji temu pasien.
- Rekam medis.
- Resep dan detail resep.
- Data serta stok obat.

File `hospital_db.sql` digunakan untuk menyimpan struktur database dan query yang diperlukan dalam proses pengelolaan basis data.

---

## Cara Menjalankan Proyek

### 1. Clone Repository

```bash
git clone https://github.com/nafisahnailalhusna20-ui/Harmoni-Rs.git
```

Masuk ke folder proyek:

```bash
cd Harmoni-Rs2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment

Buat file `.env.local` pada folder utama proyek.

Sesuaikan konfigurasi berikut dengan database PostgreSQL yang digunakan:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/nama_database
JWT_SECRET=isi_dengan_secret_key_kamu
```

Pastikan konfigurasi database dan secret key sudah sesuai dengan lingkungan lokal.

### 4. Siapkan Database

- Buka PostgreSQL melalui pgAdmin 4.
- Buat database sesuai konfigurasi.
- Jalankan file SQL proyek untuk membuat struktur tabel.
- Pastikan database sudah terhubung dengan aplikasi.

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Buka browser dan akses:

```text
http://localhost:3000
```

---

## Pengembangan

Proyek ini dikembangkan menggunakan Next.js dengan pendekatan komponen React dan JSX.

Pengembangan dilakukan secara bertahap, meliputi pembuatan antarmuka, pengelolaan autentikasi, integrasi database, pengembangan API, serta implementasi fitur berdasarkan kebutuhan setiap role pengguna.

---

## Status Proyek

**HARMONI Healthcare — Individual Final Project**

Proyek ini dikembangkan sebagai implementasi sistem informasi rumah sakit berbasis web dengan menggunakan Next.js dan PostgreSQL.

---

© 2026 HARMONI Healthcare
