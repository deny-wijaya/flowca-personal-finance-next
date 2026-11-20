# Flowca UI Kit — paket ekspor desain

Paket ini berisi semua yang dibutuhkan untuk mengimplementasikan UI Flowca di Next.js
dengan hasil yang identik dengan desain. Panduan lengkap ada di dokumen PRD
"PRD — Implementasi UI Flowca (Next.js)".

## Isi

```
flowca-ui-kit/
├── README.md
├── tokens/
│   ├── tokens.css           # SATU sumber nilai visual (primitive + semantic + @theme Tailwind v4 + keyframes)
│   ├── base.css             # reset, fokus, .fc-press (hover/press retro), .fc-field, .fc-num, .fc-pixel
│   ├── tailwind.config.ts   # hanya untuk Tailwind v3 (menunjuk ke variabel di tokens.css)
│   └── tokens.json          # nilai mentah untuk tooling (Storybook, Figma, dokumentasi)
└── design/
    ├── canvas.json          # daftar artboard, ukuran, dan urutan
    └── *.dc.html            # sumber tiap layar: HTML + style inline + logika interaksi simulasi
```

## Cara pakai singkat

1. Salin `tokens/tokens.css` dan `tokens/base.css` ke `src/presentation/styles/`.
2. Di `app/globals.css`:

   ```css
   @import "tailwindcss";
   @import "../src/presentation/styles/tokens.css";
   @import "../src/presentation/styles/base.css";
   ```

3. Muat font di `app/layout.tsx` dengan `next/font/google` dan ekspos sebagai
   `--font-pixelify` dan `--font-space-grotesk` (token sudah menunjuk ke dua variabel ini).
4. Taruh folder `design/` di root repo (bukan di `public/`) sebagai referensi.

## Tentang file `*.dc.html`

- File ini adalah **sumber referensi**, bukan halaman yang bisa dibuka langsung di browser:
  markup memakai tag template (`<x-dc>`, `<sc-if>`, `<sc-for>`, `{{ nilai }}`) yang dirender
  oleh editor desain.
- Yang dipakai saat implementasi: struktur elemen, nilai style inline (sudah dipetakan ke
  token), teks/copy, dan logika di blok `<script type="text/x-dc">` (state dan handler).
- Logika di dalamnya adalah **simulasi** (login, OAuth, AI, baca nota). Implementasi asli
  ditulis ulang di lapisan application/infrastructure.

## Pemetaan layar

| File desain | Rute | Viewport |
| --- | --- | --- |
| Main.dc.html | /login | mobile |
| Register.dc.html | /register | mobile |
| ForgotPassword.dc.html | /forgot-password | mobile |
| ResetPassword.dc.html | /reset-password | mobile |
| Onboarding.dc.html | /onboarding | mobile |
| AuthCallback.dc.html | /auth/callback | mobile |
| ProfileMenu.dc.html | /dashboard | mobile |
| Transactions.dc.html | /transactions | mobile |
| Budget.dc.html | /budget | mobile |
| AddTransaction.dc.html | /transactions/new | mobile |
| QuickAdd.dc.html | /quick-add | mobile |
| DesktopLogin.dc.html | /login | desktop ≥1024px |
| DesktopHome.dc.html | /dashboard | desktop ≥1024px |
| DesktopTransactions.dc.html | /transactions | desktop ≥1024px |
| GoogleStates.dc.html | (spesifikasi komponen GoogleButton) | — |
