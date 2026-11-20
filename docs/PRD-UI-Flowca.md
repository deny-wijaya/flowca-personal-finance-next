# PRD — Implementasi UI Flowca (Next.js)

Nov 19, 2026 · @Deny

## Ringkasan

Tujuannya: mengimplementasikan seluruh UI Flowca (14 layar: 11 mobile 390px + 3 desktop 1440px, plus satu lembar spesifikasi tombol Google) di project Next.js yang sudah memakai clean architecture, dengan hasil yang identik secara visual dengan file desain. Lingkup PRD ini hanya lapisan **presentation dan style**; domain, use case, repository, dan autentikasi asli dikerjakan terpisah.

Definisi "identik": setiap layar cocok dengan gambar ekspor artboard dari canvas desain (sumber markup: `*.dc.html`) dengan toleransi perbedaan piksel ≤ 0,5% pada lebar 390px dan 1440px.

Sumber kebenaran:

- **Nilai visual**: `tokens.css` (hasil ekspor). Tidak ada nilai warna, ukuran, border, atau bayangan yang ditulis langsung di komponen.
- **Struktur dan perilaku layar**: file `*.dc.html` (HTML + style inline + logika interaksi simulasi).
- **Daftar layar**: `canvas.json`.

## Asumsi & stack

Boilerplate diasumsikan memakai stack di bawah. Kalau ada yang berbeda, hanya baris terkait yang perlu disesuaikan; arsitektur style tetap sama.

| Area | Pilihan | Catatan |
| --- | --- | --- |
| Framework | Next.js App Router, React, TypeScript strict | Server Component default; komponen interaktif diberi `"use client"` |
| Styling | Tailwind CSS v4 (konfigurasi via `@theme` di CSS) | Untuk Tailwind v3 pakai `tailwind.config.ts` dari ekspor |
| Varian komponen | `class-variance-authority` + `clsx` + `tailwind-merge` | Satu helper `cn()` |
| Font | `next/font/google`: Pixelify Sans, Space Grotesk | Dimuat sekali di root layout, diekspos sebagai CSS variable |
| Ikon | Komponen `Icon` sendiri dari path SVG desain | Tanpa library ikon, supaya garis 2,4px dan ujung kotak tetap sama |
| Uji visual | Playwright `toHaveScreenshot` | Pembanding = PNG ekspor artboard dari canvas |
| Katalog komponen | Storybook (opsional tapi disarankan) | Satu story per varian dan state |

Struktur folder **mengikuti boilerplate yang sudah ada**; PRD ini sengaja tidak menetapkan path. Saat eksekusi, setiap jenis file (token CSS, primitive, komposit, screen, mapper view model, test visual) ditempatkan di folder yang setara di boilerplate. Yang wajib dijaga hanya batas lapisannya: kode UI tidak mengimpor lapisan infrastructure secara langsung.

## Arsitektur style

Style diatur dalam enam lapisan yang hanya boleh bergantung ke atas. Akibatnya, mengganti satu warna cukup di `tokens.css`, dan screen tidak pernah tahu nilai hex apa pun.

&#91;embedded content: arsitektur style · 6 lapisan\]

Aturan ketergantungan:

- **Primitive** hanya mengenal token/utility dan props. Tidak tahu soal transaksi, user, atau rute.
- **Komposit** menggabungkan primitive untuk satu pola yang berulang dan menerima data sudah berbentuk tampilan (string terformat, warna semantik), bukan entity domain.
- **Screen** adalah komponen murni: input = view model, output = markup + callback. Tidak ada `fetch`, tidak ada akses repository.
- **Rute** (`page.tsx`) satu-satunya tempat yang memanggil use case dan memetakan hasilnya ke view model.
- Format tampilan (Rupiah, tanggal Indonesia, tanda +/−) dibuat di **mapper view model**, bukan di dalam JSX.

## Design tokens

Semua nilai di bawah sudah ada di `tokens.css` (paket ekspor). Komponen memakai nama **semantic** atau utility Tailwind-nya, tidak pernah hex.

### Warna

| Token semantic | Nilai | Utility | Dipakai untuk |
| --- | --- | --- | --- |
| `--surface-page` | #FFF6E5 | `bg-cream` | Latar halaman |
| `--surface-card` | #FFFDF8 | `bg-paper` | Kartu, sheet, sidebar, nav |
| `--surface-field` | #FFFFFF | `bg-field` | Isi input |
| `--text-primary` / `--border-strong` | #1F1B2D | `text-ink`, `border-ink` | Teks utama, semua outline, bayangan |
| `--text-secondary` | #4A4458 | `text-ink-600` | Teks pendukung (kontras 8,6:1) |
| `--text-danger` / `--text-expense` | #B42318 | `text-danger` | Error, nominal pengeluaran |
| `--text-income` | #1E6B40 | `text-income` | Nominal pemasukan |
| `--action-login` | #FF7A6B | `bg-coral` | Tombol Masuk, status lewat batas |
| `--action-create` | #FFA94D | `bg-orange` | Tambah/Catat cepat, Simpan |
| `--action-info` | #5BC8D6 | `bg-cyan` | Kirim link, Lanjut, saldo, bubble user |
| `--action-reset` | #FF9EC7 | `bg-pink` | Simpan password, kartu sisa anggaran |
| `--focus-ring` | #2A8FA0 | `outline-focus` | Outline fokus keyboard 3px |
| `--border-dashed` / `--border-divider` | #B9AFA0 / #E3DACB | `border-sand-400/200` | Pemisah putus-putus |

Tint kategori: Makanan `orange-100`, Transportasi `cyan-100`, Tagihan `pink-100`, Belanja `coral-100`, Hiburan `lilac-100`, pemasukan `green-100`, Lainnya `sand-100`. Simpan pemetaan ini di satu konstanta `categoryTone`, bukan tersebar di komponen.

### Tipografi

| Peran | Font | Ukuran / tebal | Contoh |
| --- | --- | --- | --- |
| Display | Pixelify Sans | 52 / 700 | Tagline login desktop |
| Judul halaman | Pixelify Sans | 36 desktop, 26–28 mobile / 700 | "Transaksi", "Masuk" |
| Judul seksi | Pixelify Sans | 20–22 / 700 | "Transaksi terbaru" |
| Label tombol utama | Pixelify Sans | 20–22 / 700 | "Masuk", "Simpan password" |
| Nominal besar | Space Grotesk + `tabular-nums` | 28–34 / 700 | Saldo, input jumlah |
| Body | Space Grotesk | 15–16 / 400–500 | Paragraf, input |
| Label & meta | Space Grotesk | 12–14 / 600–700 | Label field, meta transaksi |
| Mikro | Space Grotesk | 11 / 600–700 | Badge, pita prototipe |

Aturan keras: Pixelify Sans **tidak dipakai di bawah 20px** (kecuali huruf tunggal di tile kategori dan badge "AI") dan **tidak pernah untuk angka**. Huruf C-nya terbaca seperti O di ukuran kecil.

### Bentuk

| Token | Nilai | Dipakai untuk |
| --- | --- | --- |
| `border` (3px) | `--fc-border` | Tombol, kartu, sheet, nav |
| `border-thin` (2px) | `--fc-border-thin` | Input, chip, tile ikon, badge |
| `rounded-lg` 10px | `--fc-radius-lg` | Tombol, input |
| `rounded-xl` 12px / `rounded-2xl` 14px |  | Kartu kecil / kartu utama |
| `rounded-3xl` 16px / `rounded-sheet` 22px |  | Kartu login desktop / bottom sheet |
| `shadow-hard-1` 3/3/0 |  | Tombol kecil, bubble chat |
| `shadow-hard-2` 4/4/0 |  | Tombol utama, list card |
| `shadow-hard-3` 5/5/0 |  | Hover tombol, kartu desktop |
| `shadow-hard-4` 6/6/0 / `shadow-hard-5` 8/8/0 |  | Kartu hero / kartu login desktop |

Ukuran kontrol: target sentuh minimal 44px; input 48px; tombol utama 54–56px; chip 40–44px. Breakpoint desktop: 1024px.

### Gerak

Semua animasi memakai `steps()` agar terasa 8-bit: spinner `animate-pixel-spin` (0,9s, 8 langkah), gelombang suara `animate-pixel-wave`, titik mengetik `animate-pixel-blink`, Koko melompat `animate-pixel-hop`. Interaksi tombol lewat kelas `.fc-press` (80ms). `prefers-reduced-motion` mematikan semuanya.

## Katalog komponen

Setiap komponen punya satu file varian (`*.variants.ts` dengan `cva`), menerima `className` untuk penyesuaian layout saja (margin, lebar), dan meneruskan `ref`. Varian visual tidak boleh dioper lewat `className`.

### Primitive

| Komponen | Varian / props utama | State wajib | Aksesibilitas |
| --- | --- | --- | --- |
| `Button` | `tone`: coral, orange, cyan, pink, paper, white · `size`: md 48, lg 54, xl 56 · `font`: display, body · `asChild` untuk `<a>`/`Link` | hover, active (press), disabled, loading (spinner + label) | `<button>` asli; `aria-busy` saat loading |
| `IconButton` | `size` 40/44/48 · `tone` | sama dengan Button | `aria-label` wajib (dipaksa lewat tipe) |
| `TextField` | `label`, `hint`, `error`, `prefix` (mis. "Rp"), `size` | focus glow cyan, error border merah | `<label for>`, `aria-invalid`, `aria-describedby` ke hint/error |
| `PasswordField` | turunan TextField + tombol lihat/sembunyikan | shown/hidden | tombol `aria-pressed` + label berubah |
| `MoneyInput` | turunan TextField, format ribuan id-ID, `tone` prefix | kosong, terisi, error | `inputMode="numeric"` |
| `Checkbox` | `label` | checked | input asli, `accent-color: ink`, target 44px |
| `Card` | `elevation`: flat, 2, 3, 4, 5 · `tone`: paper, cyan, pink, orange-100 · `border`: solid, dashed | — | elemen semantik via `as` (section, li) |
| `Chip` | `selected` · `shape`: pill, tile | selected = latar ink / orange-100 | `role="radio"` atau `aria-pressed` sesuai konteks |
| `Badge` | `tone`: safe, warn, over, ai, neutral | — | teks selalu ada, warna bukan satu-satunya penanda |
| `Icon` | `name` (home, list, pie, chart, wallet, gear, mic, cam, plus, send, x, search, chevron, eye, eye-off, check, retry, logout, user, card) · `size` | — | `aria-hidden` default |
| `GoogleLogo` | — | — | `aria-hidden` |
| `Koko` | `size` · `animate`: none, hop | — | `aria-hidden`; path SVG disalin apa adanya |
| `PixelProgress` | `segments` (10/20) · `value` · `tone`: safe, warn, over, ink | — | `role="progressbar"` + `aria-valuenow` |
| `Spinner` | `size` | — | `aria-hidden`, status diumumkan oleh parent |
| `Sheet` / `Dialog` | `side`: bottom (mobile) / right (desktop) | open, closing | fokus terkunci, `Esc` menutup, `aria-modal` |
| `Notice` | `tone`: success, error, info, note, prototype | — | `role="status"` atau `role="alert"` |

### Komposit

| Komponen | Isi | Catatan |
| --- | --- | --- |
| `AppShell` | `BottomNav` di bawah 1024px, `Sidebar` di atasnya, slot panel kanan | Dipakai di layout rute terproteksi |
| `BottomNav` | 4 item + tombol tengah Catat cepat (64px, naik 26px, badge AI) | Item aktif: kotak coral di belakang ikon, `aria-current="page"` |
| `Sidebar` | Logo, tombol Catat cepat + `kbd` N, 6 item nav, kartu profil | Tombol Catat cepat membuka `QuickAddPanel` |
| `PrototypeBanner` | Pita gelap "MODE PROTOTIPE · …" | Dirender hanya saat `NEXT_PUBLIC_AUTH_MODE=mock` |
| `AuthCard` | Kartu login/daftar: judul, GoogleButton, divider, form | Dipakai mobile dan desktop |
| `GoogleButton` | 6 state: idle, hover, focus, loading, success, error (lihat `GoogleStates.dc.html`) | State dikendalikan dari luar lewat prop `status` |
| `StatCard`, `MonthSwitcher`, `SummaryStrip` | Ringkasan saldo dan bulan | Angka selalu `fc-num` |
| `TransactionRow` / `TransactionTable` | Tile kategori, nama, meta, nominal bertanda | Menerima view model terformat, bukan entity |
| `BudgetRow` | Nama, detail, badge status, PixelProgress, catatan | Status dihitung di mapper, bukan di JSX |
| `ChatBubble`, `TypingBubble`, `DraftCard`, `VoiceRecorder`, `ReceiptDropzone` | Komponen Catat cepat | `DraftCard` selalu butuh konfirmasi sebelum simpan |
| `ProfileMenu` | Dropdown avatar: profil, Pengaturan, Akun keuangan, Keluar | `role="menu"`, tutup dengan Esc/klik luar |

### Pola implementasi

```ts
// button.variants.ts
import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "fc-press inline-flex items-center justify-center gap-2.5 rounded-lg border-3 border-ink text-ink font-bold shadow-hard-2",
  {
    variants: {
      tone: {
        coral: "bg-coral",
        orange: "bg-orange",
        cyan: "bg-cyan",
        pink: "bg-pink",
        paper: "bg-paper",
        white: "bg-field",
      },
      size: { md: "h-12 px-4 text-15", lg: "h-[54px] px-5 text-16", xl: "h-14 px-5 text-16" },
      font: { display: "font-display text-20", body: "font-body" },
      block: { true: "w-full" },
    },
    defaultVariants: { tone: "coral", size: "lg", font: "display" },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
```

Pola yang sama untuk semua primitive: kelas dasar = bentuk retro (border 3px tinta, radius, bayangan keras), varian = warna dan ukuran saja.

## Layar & rute

Satu rute = satu screen; screen memilih layout mobile atau desktop sendiri. Rute desktop memakai URL yang sama dengan mobile.

| Rute | Screen | Desain mobile | Desain desktop | Komponen kunci |
| --- | --- | --- | --- | --- |
| /login | LoginScreen | Main.dc.html | DesktopLogin.dc.html | AuthCard, GoogleButton, PasswordField |
| /register | RegisterScreen | Register.dc.html | (ikuti pola DesktopLogin) | AuthCard, meter kekuatan password |
| /forgot-password | ForgotPasswordScreen | ForgotPassword.dc.html | (kartu tengah) | 2 state: form → terkirim, cooldown 30 dtk |
| /reset-password | ResetPasswordScreen | ResetPassword.dc.html | (kartu tengah) | checklist syarat, state kedaluwarsa |
| /auth/callback | AuthCallbackScreen | AuthCallback.dc.html | (kartu tengah) | checklist 3 langkah, 4 hasil |
| /onboarding | OnboardingScreen | Onboarding.dc.html | (kartu tengah) | progres 4 segmen, tombol Lewati |
| /dashboard | DashboardScreen | ProfileMenu.dc.html | DesktopHome.dc.html | StatCard, TransactionRow, BudgetRow, ProfileMenu |
| /transactions | TransactionsScreen | Transactions.dc.html | DesktopTransactions.dc.html | list bergrup per hari (mobile), TransactionTable + aksi massal (desktop) |
| /transactions/new | AddTransactionScreen | AddTransaction.dc.html | Sheet kanan | MoneyInput, Chip kategori, Sheet |
| /budget | BudgetScreen | Budget.dc.html | (belum didesain) | PixelProgress 20 & 10 segmen, BudgetRow |
| /quick-add | QuickAddScreen | QuickAdd.dc.html | Panel kanan di DesktopHome | ChatBubble, DraftCard, VoiceRecorder |

Belum didesain dan di luar PRD ini: /insights, /accounts, /settings, Anggaran desktop. Untuk sementara tampilkan `EmptyState` bergaya sama (Koko + judul + satu kalimat).

Catatan perilaku responsif:

- Di bawah 1024px, `/quick-add` adalah halaman penuh dan dibuka dari tombol tengah BottomNav. Di 1024px ke atas, ia menjadi `Sheet side="right"` di dalam AppShell; rute `/quick-add` di desktop membuka dashboard dengan panel terbuka.
- `/transactions/new` di mobile adalah bottom sheet penuh; di desktop panel kanan 400px.
- Pita `PrototypeBanner` tampil di semua layar auth dan Catat cepat selama mode mock aktif.

## Aturan kode style

| Lakukan | Jangan |
| --- | --- |
| Pakai utility dari token: `bg-paper border-3 border-ink shadow-hard-2` | Hex atau nilai arbitrer: `bg-[#FFFDF8]`, `shadow-[4px_4px_0_#1F1B2D]` |
| Varian lewat props `cva` (`tone="orange"`) | Mengubah warna/ukuran komponen lewat `className` dari luar |
| `className` dari luar hanya untuk layout (margin, grid placement, lebar) | Menimpa border, radius, atau bayangan per halaman |
| Format angka & tanggal di mapper (`formatRupiah`, `signedAmount`) | `toLocaleString` atau logika tanda +/− di dalam JSX |
| Warna status dari fungsi tunggal (`budgetTone(ratio)`, `categoryTone(cat)`) | Ternary warna tersebar di banyak komponen |
| Satu sumber ikon (`<Icon name="mic" />`) | Menyalin `<svg>` inline di setiap layar |
| Hover/press via `.fc-press`; fokus via `:focus-visible` global | Membuat ulang transisi hover di tiap tombol |
| Gap/flex/grid untuk jarak antar elemen | Margin acak di anak elemen |
| `<button>`, `<a>`, `<label>` asli; `aria-*` di primitive | `div onClick`; ikon tanpa `aria-label` |
| Server Component default; `"use client"` hanya di komponen interaktif terkecil | Menandai seluruh screen sebagai client karena satu tombol |

Penegakan otomatis:

- ESLint `no-restricted-syntax` / plugin `tailwindcss` untuk menolak kelas arbitrer berisi `#` dan `px` di folder komponen UI.
- Stylelint di `*.css`: hex hanya boleh di `tokens.css`.
- `prettier-plugin-tailwindcss` untuk urutan kelas yang konsisten.
- Review checklist PR: tidak ada hex baru, setiap komponen baru punya story, screenshot test diperbarui.

## Verifikasi fidelitas

File `*.dc.html` tidak bisa dibuka langsung di browser (memakai template editor desain), jadi pembandingnya adalah **gambar ekspor artboard** dari canvas. Verifikasi berjalan dua tahap: cocokkan dulu ke desain, lalu kunci hasilnya supaya tidak bergeser.

1. **Siapkan baseline desain.** Ekspor setiap artboard sebagai PNG dari canvas dan simpan di folder test visual yang sudah ada di boilerplate, satu file per rute dan viewport.
2. **Samakan data.** Buat fixture berisi data persis seperti di desain: user Rani Putri, 7 transaksi November 2026, anggaran 5 kategori, tanggal "hari ini" dikunci ke 19 November 2026.
3. **Render deterministik.** Playwright dengan viewport 390×844 dan 1440×900, `animations: "disabled"`, tunggu `document.fonts.ready`, mode mock aktif.
4. **Bandingkan ke desain.** Test fidelitas menghitung selisih piksel (pixelmatch) antara screenshot rute dan PNG desain. Target ≤ 0,5% piksel berbeda; selisih kecil dari anti-aliasing font antar renderer masih wajar, selisih posisi atau warna tidak.
5. **Kunci setelah lolos.** Setelah layar lolos dan disetujui, simpan snapshot dengan `toHaveScreenshot()` sebagai regression test. Mulai saat ini, PR yang mengubah tampilan wajib memperbarui snapshot secara sadar.

Checklist manual per layar (sebelum tandai selesai):

- [ ] Semua state di desain ada: kosong, terisi, error, loading, sukses
- [ ] Fokus keyboard terlihat di setiap elemen interaktif, urutan Tab masuk akal
- [ ] Target sentuh ≥ 44px, teks lolos kontras 4,5:1
- [ ] Tidak ada hex atau nilai arbitrer baru di diff
- [ ] Layout tetap utuh di 360px, 390px, 1024px, 1440px
- [ ] Pita prototipe tampil hanya di mode mock

Storybook dipakai untuk primitive dan komposit: satu story per varian dan state, plus Chromatic atau `@storybook/test-runner` dengan snapshot bila tim menginginkan uji visual di level komponen.

## Fase pengerjaan

Dikerjakan berurutan; fase berikutnya mulai setelah kriteria selesai fase sebelumnya terpenuhi. Mengerjakan satu layar per PR (dengan screenshot test-nya) jauh lebih akurat daripada mengonversi semuanya sekaligus.

1. **Fondasi.** Pasang `tokens.css` + `base.css`, font via `next/font`, `cn()`, `format.ts`, aturan ESLint/Stylelint, Playwright + baseline PNG desain. Selesai bila: halaman internal `/dev/tokens` menampilkan seluruh palet, skala huruf, dan bayangan sesuai desain.
2. **Primitive.** Semua komponen di tabel Primitive beserta story-nya. Selesai bila: setiap varian dan state punya story, dan tidak ada hex di komponen primitive.
3. **Komposit + AppShell.** BottomNav, Sidebar, AuthCard, GoogleButton (6 state), TransactionRow/Table, BudgetRow, komponen chat. Selesai bila: `GoogleStates.dc.html` cocok dengan story GoogleButton.
4. **Layar auth.** Login (mobile + desktop), Register, Lupa & Reset password, Callback, Onboarding, masih dengan mode mock. Selesai bila: lolos verifikasi fidelitas di 390px (dan 1440px untuk login).
5. **Layar inti.** Dashboard, Transaksi, Anggaran, Tambah transaksi, mobile + desktop sesuai desain. Selesai bila: semua lolos verifikasi fidelitas dan filter/sort/pilih massal berfungsi dengan data fixture.
6. **Catat cepat.** Halaman mobile + panel desktop, alur draf → konfirmasi → simpan dengan parser tiruan di balik interface use case. Selesai bila: semua state (mengetik, mendengarkan, membaca nota, draf, tersimpan, nominal tidak terbaca) tampil sesuai desain.
7. **Penguatan.** Audit aksesibilitas, `prefers-reduced-motion`, cek 360px, kunci snapshot regresi. Selesai bila: checklist manual terpenuhi untuk semua layar.

Pertanyaan terbuka:

- Boilerplate memakai Tailwind v3 atau v4? Menentukan apakah `tailwind.config.ts` dari paket ekspor dipakai.
- Anggaran desktop, Insight, Akun, dan Pengaturan belum punya desain; perlu didesain sebelum fase 5 selesai atau ditunda ke iterasi berikutnya.
