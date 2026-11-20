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
├── app/                         # Routing saja: page memanggil use case lalu memetakan ke view model
│   ├── (auth)/                  # /login, /register, /forgot-password, /reset-password, /auth/callback, /onboarding
│   └── (app)/                   # AppShell: /dashboard, /transactions(/new), /budget, /quick-add, dll.
├── modules/
│   ├── transaction/             # domain, application, infrastructure, presentation
│   ├── account/  budget/        # saldo per akun & anggaran per kategori (masih in-memory)
│   ├── auth/                    # autentikasi tiruan (mode prototipe) di balik port AuthGateway
│   ├── quick-add/               # Catat cepat: parser tiruan di balik port QuickEntryParser
│   └── dashboard/               # presentation saja (menggabungkan modul lain)
│       └── presentation/
│           ├── screens/         # Komponen murni: input view model, output markup
│           ├── components/      # Komposit milik modul (TransactionRow, BudgetRow, DraftCard, ...)
│           └── view-models/     # Mapper + format tampilan (Rupiah, tanggal, tanda +/−), dengan unit test
├── shared/
│   ├── ui/styles/               # tokens.css (satu-satunya sumber nilai visual) + base.css
│   ├── ui/primitives/           # Button, TextField, Card, Chip, Badge, Icon, Koko, PixelProgress, Dialog, ...
│   ├── ui/layout/               # AppShell, BottomNav, Sidebar, MonthSwitcher, StatCard, PrototypeBanner
│   ├── lib/                     # cn(), format.ts, month.ts
│   ├── config/env.ts            # Validasi env (server-only)
│   └── infrastructure/http/     # HttpClient & HttpError
└── di/container.ts              # Composition root: memilih mock atau API
design/                          # Sumber desain Flowca (*.dc.html, canvas.json) sebagai referensi
```

## Aturan UI

- Nilai warna, ukuran huruf, border, radius, dan bayangan hanya dari `src/shared/ui/styles/tokens.css`. ESLint menolak hex dan nilai arbitrer `px` di `className` / `cva`.
- Varian visual lewat props `cva` (`tone`, `size`); `className` dari luar hanya untuk layout.
- Format angka & tanggal dibuat di mapper `view-models/`, bukan di JSX. Warna kategori dari `categoryTone()`, status anggaran dari `budgetTone()`.
- Screen tidak boleh import `@/di/container` atau infrastructure (dicek ESLint).

## Menambah fitur baru (contoh: Budget)

1. Buat `src/modules/budget/domain/` berisi entity `Budget` dan interface `BudgetRepository`.
2. Buat use case di `application/`, misalnya `GetBudgetProgress`, beserta unit test-nya dengan repository in-memory.
3. Buat `InMemoryBudgetRepository` dan `HttpBudgetRepository` di `infrastructure/`, lengkap dengan schema DTO zod.
4. Daftarkan use case di `src/di/container.ts`.
5. Buat komponen dan section di `presentation/`, lalu page di `src/app/(main)/budgets/page.tsx`.

ESLint akan menolak import yang melanggar arah dependency, misalnya komponen yang meng-import repository HTTP secara langsung.
