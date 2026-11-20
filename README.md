# Next Personal Finance

Web app pencatat pemasukan dan pengeluaran pribadi, dibangun dengan Next.js 16 (App Router) dan clean architecture. Kebutuhan produk lengkap ada di [`docs/PRD.md`](docs/PRD.md).

## Menjalankan

```bash
npm install
cp .env.example .env.local   # default DATA_SOURCE=mock, tidak butuh backend
npm run dev                  # http://localhost:3200
```

| Script | Fungsi |
|---|---|
| `npm run dev` | Development server di port 3200 |
| `npm run build` / `npm start` | Build dan jalankan production |
| `npm run lint` | ESLint, termasuk aturan batas antar layer |
| `npm run typecheck` | Cek tipe TypeScript |
| `npm test` | Unit test dengan Vitest |

## Menghubungkan ke backend API

Ubah `.env.local` seperti ini, lalu restart server. Tidak ada kode yang perlu diubah.

```env
DATA_SOURCE=api
API_BASE_URL=http://localhost:4000/api/v1
```

Kontrak endpoint dan format response yang diharapkan ada di PRD bagian 8.4. Request ke backend hanya dilakukan dari server (Server Component dan Server Action), jadi `API_BASE_URL` dan token tidak pernah terkirim ke browser.

## Struktur folder

```
src/
├── app/                         # Routing saja: page, layout, error, loading
│   └── (main)/                  # Grup halaman yang memakai navigasi utama
│       ├── dashboard/page.tsx
│       └── transactions/page.tsx
├── modules/
│   └── transaction/
│       ├── domain/              # Entity, aturan bisnis, interface repository
│       ├── application/         # Use case
│       ├── infrastructure/      # Repository HTTP & mock, DTO + mapper
│       └── presentation/        # Komponen, section async, Server Action
├── shared/
│   ├── config/env.ts            # Validasi env (server-only)
│   ├── domain/errors.ts         # DomainError, ValidationError
│   ├── infrastructure/http/     # HttpClient & HttpError
│   ├── lib/format.ts            # Format Rupiah dan tanggal
│   └── ui/                      # Komponen UI generik
└── di/container.ts              # Composition root: memilih mock atau API
```

## Menambah fitur baru (contoh: Budget)

1. Buat `src/modules/budget/domain/` berisi entity `Budget` dan interface `BudgetRepository`.
2. Buat use case di `application/`, misalnya `GetBudgetProgress`, beserta unit test-nya dengan repository in-memory.
3. Buat `InMemoryBudgetRepository` dan `HttpBudgetRepository` di `infrastructure/`, lengkap dengan schema DTO zod.
4. Daftarkan use case di `src/di/container.ts`.
5. Buat komponen dan section di `presentation/`, lalu page di `src/app/(main)/budgets/page.tsx`.

ESLint akan menolak import yang melanggar arah dependency, misalnya komponen yang meng-import repository HTTP secara langsung.
