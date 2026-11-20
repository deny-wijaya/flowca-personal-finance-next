# PRD: Next Personal Finance

| | |
|---|---|
| **Produk** | Next Personal Finance (web app pencatat keuangan pribadi) |
| **Status** | Draft |
| **Pemilik** | Deny Wijaya |
| **Dibuat** | 2026-11-13 |
| **Versi** | 1.0 |
| **Repo** | `next-personal-finance` (Next.js 16.4, App Router) |

---

## 1. Ringkasan

**Satu kalimat:** Web app untuk mencatat pemasukan dan pengeluaran harian, lalu melihat arus kas bulanan dan pengeluaran per kategori dalam satu dashboard.

Banyak orang tahu gajinya berapa, tetapi tidak tahu ke mana uangnya habis di akhir bulan. Pencatatan biasanya dilakukan di catatan HP atau spreadsheet, sehingga ringkasan per kategori harus dihitung manual dan jarang dilakukan. Next Personal Finance memberi form pencatatan yang cepat dan dashboard yang langsung menghitung total pemasukan, total pengeluaran, arus kas bersih, dan pengeluaran per kategori untuk bulan berjalan.

Frontend dibangun dengan Next.js dan clean architecture. Saat ini data berasal dari repository mock di memori server, dan aplikasi sudah disiapkan untuk berpindah ke backend REST API hanya dengan mengganti `DATA_SOURCE=api` dan `API_BASE_URL` di `.env.local`.

**Fakta singkat**

- **Pengguna utama:** karyawan muda dan freelancer yang ingin mengontrol pengeluaran bulanan.
- **Masalah:** tidak ada gambaran cepat ke mana uang habis setiap bulan.
- **Metrik utama (North Star):** jumlah pengguna yang mencatat transaksi minimal 4 hari dalam seminggu.
- **Target rilis MVP:** akhir Desember 2026 (lihat bagian 10).

---

## 2. Masalah

### 2.1 Masalah utama

Pengguna tidak punya cara cepat untuk mencatat transaksi dan melihat ringkasan bulanan. Akibatnya, mereka baru sadar boros ketika saldo rekening sudah menipis di tanggal 20-an.

### 2.2 Kondisi sekarang

- Mencatat di aplikasi catatan HP, lalu menjumlahkan manual di akhir bulan.
- Memakai spreadsheet. Ini fleksibel, tetapi lambat diisi dari HP dan rumus sering rusak.
- Memakai aplikasi keuangan yang terlalu banyak fitur (investasi, sinkronisasi bank), sehingga ditinggalkan setelah seminggu.

### 2.3 Dampak

- Pengguna tidak bisa menjawab pertanyaan sederhana seperti "bulan ini habis berapa untuk makan?".
- Target menabung sulit tercapai karena pengeluaran tidak terpantau.

---

## 3. Tujuan

### 3.1 Tujuan produk

1. Pengguna bisa mencatat satu transaksi dalam waktu kurang dari 15 detik.
2. Pengguna bisa melihat arus kas bulan berjalan tanpa menghitung manual.
3. Frontend bisa dihubungkan ke backend API tanpa menulis ulang logika bisnis maupun UI.

### 3.2 Tujuan pengguna

1. Tahu total pemasukan, pengeluaran, dan sisa uang bulan ini.
2. Tahu kategori pengeluaran terbesar.
3. Bisa menetapkan batas belanja per kategori (fase 2).

### 3.3 Bukan tujuan

- Sinkronisasi otomatis dengan rekening bank atau e-wallet.
- Fitur investasi, saham, atau kripto.
- Aplikasi mobile native. Versi web harus nyaman dibuka dari browser HP.

---

## 4. Persona

### Persona utama: Rina, karyawan kantoran (26 tahun)

- Gaji tetap sekitar Rp 12.500.000 per bulan, tinggal di kos di Jakarta.
- Sering bayar makan dan transportasi online lewat e-wallet.
- **Kebutuhan:** tahu sisa uang sebelum gajian berikutnya.
- **Kendala:** malas membuka spreadsheet, lupa mencatat kalau prosesnya lebih dari beberapa ketukan.
- **Kutipan:** "Aku cuma mau tahu bulan ini habis berapa buat makan sama Gojek."

### Persona kedua: Bima, freelancer web developer (29 tahun)

- Pemasukan tidak tetap, dari 2 sampai 4 klien per bulan.
- **Kebutuhan:** membedakan pemasukan freelance dan pengeluaran rutin, serta melihat arus kas bersih per bulan.
- **Kendala:** pemasukan yang tidak rutin membuat sulit memperkirakan sisa uang.

---

## 5. User Story dan Kebutuhan Fungsional

Kolom **Status boilerplate** menunjukkan apa yang sudah tersedia di kode saat PRD ini dibuat.

### Epic A: Pencatatan transaksi (P0)

#### A1. Mencatat transaksi baru

```
Sebagai pengguna,
saya ingin mencatat pemasukan atau pengeluaran beserta kategori, nominal, tanggal, dan catatan,
supaya semua uang masuk dan keluar tercatat di satu tempat.
```

**Kriteria penerimaan**

- [x] Form tersedia di menu **Transaksi**, kartu **Tambah transaksi**.
- [x] Pilihan kategori berubah sesuai jenis transaksi. Pengeluaran menampilkan Makan & Minum, Transportasi, Tagihan, Belanja, Hiburan, Kesehatan, Lainnya. Pemasukan menampilkan Gaji, Bonus, Freelance, Investasi, Lainnya.
- [x] Nominal harus bilangan bulat lebih dari 0 dan maksimal Rp 1.000.000.000.000.
- [x] Tanggal tidak boleh di masa depan.
- [x] Catatan opsional, maksimal 200 karakter.
- [x] Jika validasi gagal, pesan error tampil di bawah field terkait dan isian sebelumnya tidak hilang.
- [x] Jika berhasil, muncul pesan "Transaksi berhasil disimpan." dan daftar transaksi serta dashboard langsung ter-update.
- [x] Jika backend tidak bisa dihubungi, muncul pesan "Server sedang bermasalah, coba lagi nanti."

**Prioritas:** P0 · **Status boilerplate:** Selesai

#### A2. Melihat daftar transaksi bulan ini

```
Sebagai pengguna,
saya ingin melihat daftar transaksi bulan berjalan dari yang terbaru,
supaya saya bisa mengecek apa saja yang sudah tercatat.
```

**Kriteria penerimaan**

- [x] Daftar tampil di menu **Transaksi**, kartu **Transaksi bulan ini**, beserta jumlah transaksinya.
- [x] Transaksi diurutkan dari tanggal terbaru.
- [x] Pemasukan ditampilkan hijau dengan tanda `+`, pengeluaran merah dengan tanda `−`, dalam format Rupiah (contoh: `−Rp 64.000`).
- [x] Jika belum ada data, tampil teks "Belum ada transaksi di periode ini."

**Prioritas:** P0 · **Status boilerplate:** Selesai

#### A3. Mengubah dan menghapus transaksi

```
Sebagai pengguna,
saya ingin mengubah atau menghapus transaksi yang salah input,
supaya ringkasan bulanan tetap akurat.
```

**Kriteria penerimaan**

- [ ] Setiap baris transaksi punya aksi **Ubah** dan **Hapus**.
- [ ] Hapus meminta konfirmasi sebelum dijalankan.
- [ ] Setelah diubah atau dihapus, dashboard ikut ter-update.

**Prioritas:** P1 · **Status boilerplate:** Belum

#### A4. Filter dan pencarian transaksi

```
Sebagai pengguna,
saya ingin memfilter transaksi berdasarkan bulan, jenis, dan kategori,
supaya saya bisa melihat riwayat bulan sebelumnya.
```

**Kriteria penerimaan**

- [ ] Filter bulan, jenis, dan kategori tersedia di menu **Transaksi** dan tersimpan di URL (`?month=2026-10&type=expense`), sehingga link bisa dibagikan dan tombol back berfungsi.
- [ ] Pencarian teks berdasarkan catatan.

**Prioritas:** P1 · **Status boilerplate:** Belum (repository sudah mendukung filter `from`, `to`, `type`)

### Epic B: Dashboard (P0)

#### B1. Ringkasan arus kas bulanan

```
Sebagai pengguna,
saya ingin melihat total pemasukan, pengeluaran, dan arus kas bersih bulan ini,
supaya saya tahu sisa uang sebelum gajian berikutnya.
```

**Kriteria penerimaan**

- [x] Tiga kartu tampil di menu **Dashboard**: Pemasukan, Pengeluaran, Arus kas bersih.
- [x] Arus kas bersih = total pemasukan − total pengeluaran. Warnanya hijau jika ≥ 0 dan merah jika negatif.
- [x] Hanya transaksi di bulan berjalan yang dihitung (tanggal 1 sampai hari terakhir bulan).
- [x] Saat data sedang dimuat, tampil skeleton. Jika gagal dimuat, tampil kotak "Data gagal dimuat" dengan tombol **Coba lagi**.

**Prioritas:** P0 · **Status boilerplate:** Selesai

#### B2. Pengeluaran per kategori

**Kriteria penerimaan**

- [x] Kartu **Pengeluaran per kategori** di menu **Dashboard** menampilkan nominal dan persentase tiap kategori, diurutkan dari yang terbesar, dengan bar visual.
- [x] Kartu **5 transaksi terakhir** tampil di sebelahnya.
- [ ] (P2) Grafik tren pengeluaran 6 bulan terakhir.

**Prioritas:** P0 · **Status boilerplate:** Selesai untuk P0

### Epic C: Akun dan autentikasi (P1)

#### C1. Login dan data per pengguna

```
Sebagai pengguna,
saya ingin login dengan email dan password,
supaya data keuangan saya hanya bisa dilihat oleh saya.
```

**Kriteria penerimaan**

- [ ] Halaman **Login** dan **Daftar**.
- [ ] Token dari backend disimpan di cookie `httpOnly`, `secure`, `sameSite=lax`. Token tidak pernah disimpan di `localStorage`.
- [ ] `HttpClient` mengirim header `Authorization: Bearer <token>` di setiap request (titik integrasinya sudah ada: `getAccessToken` di `src/di/container.ts`).
- [ ] Halaman di grup `(main)` mengarahkan ke **Login** jika belum login.
- [ ] Jika API membalas `401`, pengguna diarahkan ke **Login**.

**Prioritas:** P1 · **Status boilerplate:** Titik integrasi token sudah ada, fitur belum

### Epic D: Anggaran dan dompet (P2)

- **D1. Anggaran per kategori.** Pengguna menetapkan batas bulanan per kategori, misalnya Makan & Minum Rp 2.000.000. Dashboard menampilkan progress dan peringatan saat pemakaian ≥ 80%.
- **D2. Dompet atau akun.** Transaksi bisa ditandai berasal dari dompet tertentu (BCA, GoPay, Tunai), dan saldo tiap dompet tampil di dashboard.
- **D3. Kategori kustom.** Pengguna bisa menambah kategori sendiri. Saat ini kategori masih daftar tetap di domain.
- **D4. Export CSV** untuk transaksi per bulan.

---

## 6. Metrik Keberhasilan

| Metrik | Definisi | Target 3 bulan setelah rilis |
|---|---|---|
| **North Star:** pengguna aktif mingguan yang mencatat | Pengguna yang mencatat transaksi di ≥ 4 hari berbeda dalam 7 hari | 40% dari pengguna terdaftar |
| Waktu mencatat | Median waktu dari membuka form sampai transaksi tersimpan | < 15 detik |
| Retensi minggu ke-4 | Pengguna yang masih mencatat di minggu ke-4 sejak daftar | ≥ 30% |
| Error simpan | Persentase submit form yang gagal karena error server | < 1% |
| Performa | LCP halaman Dashboard di koneksi 4G | < 2,5 detik |

Metrik perilaku baru bisa diukur setelah Epic C (login) selesai dan analytics dipasang. Selama mode mock, yang diukur hanya metrik performa dan error.

---

## 7. Ruang Lingkup

### 7.1 Termasuk MVP

- Pencatatan transaksi (A1), daftar transaksi bulan berjalan (A2).
- Dashboard ringkasan dan pengeluaran per kategori (B1, B2).
- Koneksi ke backend REST API melalui env (`DATA_SOURCE=api`).
- Ubah/hapus transaksi (A3), filter (A4), login (C1).

### 7.2 Tidak termasuk MVP

- Anggaran, dompet, kategori kustom, export CSV (Epic D, fase 2).
- Multi-mata uang. Semua nominal dalam Rupiah tanpa desimal.
- Mode offline dan PWA.
- Notifikasi email atau push.

---

## 8. Pertimbangan Teknis

### 8.1 Stack

| Bagian | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js 16.4 (App Router, Cache Components, React Compiler) | Default `create-next-app` terbaru, Server Component dan Server Action mengurangi kode client |
| Bahasa | TypeScript strict | Kontrak antar layer tercek saat build |
| Styling | Tailwind CSS 4 | Bawaan template, cepat untuk prototipe |
| Validasi | Zod 4 | Validasi input form dan validasi response API |
| Test | Vitest 5 | Cepat untuk unit test domain, use case, dan repository |

### 8.2 Clean architecture

Kode dikelompokkan per fitur (module), lalu tiap module dibagi menjadi 4 layer. Arah dependency hanya boleh ke dalam, dan aturan ini dipaksa oleh ESLint (`no-restricted-imports` di `eslint.config.mjs`).

```
presentation  ──►  application  ──►  domain  ◄──  infrastructure
(page, form,       (use case)        (entity,      (HTTP / mock
 server action)                       aturan,       repository)
                                      interface)
            ▲                                            │
            └──────────── di/container.ts ◄──────────────┘
                     (memilih implementasi sesuai env)
```

| Layer | Folder | Boleh import | Isi |
|---|---|---|---|
| Domain | `modules/<fitur>/domain` | tidak ada (murni TypeScript) | Entity `Transaction`, aturan `assertValidNewTransaction`, interface `TransactionRepository` |
| Application | `modules/<fitur>/application` | domain | Use case: `ListTransactions`, `CreateTransaction`, `GetMonthlySummary` |
| Infrastructure | `modules/<fitur>/infrastructure`, `shared/infrastructure` | domain, shared | `HttpTransactionRepository`, `InMemoryTransactionRepository`, DTO + mapper, `HttpClient` |
| Presentation | `modules/<fitur>/presentation`, `app/` | application (lewat container), domain (tipe & konstanta) | Server Component, Client Component, Server Action |
| Composition root | `di/container.ts` | semua | Satu-satunya tempat yang memilih mock atau API |

### 8.3 Alur data

- **Membaca data:** Page (Server Component) → section async di `presentation/sections.tsx` → `container.listTransactions().execute()` → repository → backend API. Browser tidak pernah memanggil backend secara langsung, jadi `API_BASE_URL` dan token tetap di server.
- **Menulis data:** Form (Client Component, `useActionState`) → Server Action `createTransactionAction` → validasi zod → use case → repository → `revalidatePath('/dashboard')` dan `revalidatePath('/transactions')`.
- **Caching:** data keuangan bersifat per pengguna, jadi tidak memakai `"use cache"`. Setiap section memanggil `connection()` dan dibungkus `<Suspense>`, sehingga kerangka halaman tampil instan dan data di-stream.

### 8.4 Kontrak API (usulan untuk backend)

Base URL diatur lewat `API_BASE_URL`, contohnya `http://localhost:4000/api/v1`. Semua response memakai envelope berikut.

**Sukses**

```json
{ "data": { } }
```

**Error**

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Kategori tidak dikenal", "details": {} } }
```

**Endpoint MVP**

| Method | Path | Query / Body | Response `data` |
|---|---|---|---|
| `GET` | `/transactions` | `from`, `to` (ISO 8601), `type` (`income` / `expense`), semuanya opsional | `TransactionDto[]` |
| `POST` | `/transactions` | `{ type, amount, category, note, occurred_at }` | `TransactionDto` (status `201`) |
| `PATCH` | `/transactions/:id` | field yang diubah | `TransactionDto` (fase A3) |
| `DELETE` | `/transactions/:id` | - | status `204` (fase A3) |
| `POST` | `/auth/login` | `{ email, password }` | `{ access_token, expires_in }` (fase C1) |

**`TransactionDto`**

```json
{
  "id": "trx_01HF...",
  "type": "expense",
  "amount": 64000,
  "category": "Transportasi",
  "note": "Gojek ke kantor",
  "occurred_at": "2026-11-06T02:00:00.000Z"
}
```

Response yang tidak sesuai schema ditolak dengan `HttpError` kode `INVALID_RESPONSE`, sehingga perubahan kontrak di backend langsung ketahuan dan tidak diam-diam merusak UI. Jika backend memakai format lain, yang perlu diubah hanya `transaction-dto.ts`.

### 8.5 Konfigurasi env

| Variabel | Wajib | Default | Keterangan |
|---|---|---|---|
| `DATA_SOURCE` | Tidak | `mock` | `mock` memakai data contoh di memori, `api` memakai backend |
| `API_BASE_URL` | Ya jika `DATA_SOURCE=api` | - | Hanya dibaca di server, sengaja tanpa prefix `NEXT_PUBLIC_` |
| `API_TIMEOUT_MS` | Tidak | `10000` | Batas waktu request ke API |

Env divalidasi dengan zod di `src/shared/config/env.ts` saat server start. Konfigurasi yang salah menghentikan server dengan pesan yang jelas.

### 8.6 Keamanan

- Modul yang membaca env dan container ditandai `import "server-only"`, sehingga build gagal jika tidak sengaja di-import dari Client Component.
- Semua input Server Action divalidasi ulang di server (zod), lalu dicek lagi oleh aturan domain.
- Token auth (fase C1) disimpan di cookie `httpOnly`, tidak di `localStorage`.
- Pesan error 5xx dari backend tidak diteruskan mentah ke pengguna.

### 8.7 Kualitas

- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` wajib lolos sebelum merge.
- Unit test minimal untuk setiap use case dan setiap repository HTTP (memakai `fetch` palsu).

---

## 9. Desain dan UX

- Navigasi atas berisi **Dashboard** dan **Transaksi**. Menu aktif ditandai warna gelap.
- Layout responsif. Di HP, kartu ringkasan tersusun vertikal dan form tampil di atas daftar.
- Nominal memakai format `id-ID` (`Rp 12.500.000`) dan angka tabular agar sejajar.
- Warna hijau untuk pemasukan, merah untuk pengeluaran. Informasi tidak hanya bergantung pada warna karena ada tanda `+` dan `−`.
- Mendukung dark mode mengikuti pengaturan sistem.
- Aksesibilitas: setiap input punya label, pesan status form memakai `role="status"`, menu aktif memakai `aria-current="page"`. Target WCAG 2.1 AA.

---

## 10. Timeline

| Fase | Periode | Isi | Status |
|---|---|---|---|
| 0. Boilerplate | 13 Nov 2026 | Struktur clean architecture, A1, A2, B1, B2 dengan data mock, test, kontrak API | Selesai |
| 1. Integrasi API | 16-27 Nov 2026 | Backend menyediakan `GET`/`POST /transactions`, frontend pindah ke `DATA_SOURCE=api` | Belum |
| 2. Lengkapi MVP | 30 Nov - 18 Des 2026 | A3 ubah/hapus, A4 filter, C1 login | Belum |
| 3. Rilis MVP | 21-31 Des 2026 | Deploy, pasang analytics dan error tracker | Belum |
| 4. Fase 2 | Jan 2027 | Epic D: anggaran, dompet, kategori kustom, export CSV | Belum |

---

## 11. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Kontrak API backend berbeda dari usulan | Integrasi tertunda | Kontrak di bagian 8.4 disepakati dulu. Perbedaan format cukup ditangani di file DTO/mapper |
| Perbedaan zona waktu server dan pengguna | Transaksi jam 00.00-07.00 WIB bisa masuk tanggal sebelumnya | Sepakati zona waktu (lihat pertanyaan terbuka). Kirim tanggal dengan offset atau sebagai `YYYY-MM-DD` |
| Data mock hilang saat server restart | Data uji hilang | Hanya untuk development. Pakai `DATA_SOURCE=api` untuk data yang perlu disimpan |
| Pengguna berhenti mencatat setelah minggu pertama | North Star tidak tercapai | Form dibuat sesingkat mungkin. Pertimbangkan pengingat harian di fase 2 |
| Next.js 16 masih sering berubah | Perlu penyesuaian API | Ikuti dokumentasi di `node_modules/next/dist/docs` dan catatan di `AGENTS.md` |

---

## 12. Dependensi dan Asumsi

**Dependensi**

- Backend REST API yang mengikuti kontrak di bagian 8.4, dibangun di repo `express-personal-finance` (Fase 0 selesai, data masih in-memory).
- Layanan auth di backend untuk fase C1.

**Asumsi**

- Semua nominal dalam Rupiah dan berupa bilangan bulat.
- Satu pengguna hanya melihat datanya sendiri. Belum ada fitur berbagi dompet dengan pasangan atau keluarga.
- Aplikasi dipakai terutama dari browser HP.

---

## 13. Pertanyaan Terbuka

1. Zona waktu acuan: apakah semua tanggal dihitung dalam WIB (`Asia/Jakarta`), atau mengikuti zona waktu perangkat pengguna?
2. Apakah backend akan menyimpan kategori sebagai teks (seperti sekarang) atau sebagai `category_id` yang mengacu ke tabel kategori? Pilihan ini memengaruhi D3 (kategori kustom).
3. Apakah `GET /transactions` perlu pagination sejak MVP? Untuk 1 bulan data pribadi, jumlahnya diperkirakan di bawah 300 baris.
4. Metode login: email + password saja, atau juga Google login?
5. Di mana aplikasi akan di-deploy (Vercel, VPS, atau lainnya)? Ini memengaruhi strategi cache dan env.

---

## 14. Persetujuan

- [ ] Kontrak API disetujui oleh pengembang backend
- [ ] Ruang lingkup MVP disetujui oleh pemilik produk
- [ ] Timeline disepakati
