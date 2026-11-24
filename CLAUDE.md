@AGENTS.md

## Kontrak arsitektur

Baca `docs/ARCHITECTURE.md` sebelum menambah file, folder, atau modul baru. Aturannya dijaga oleh `eslint.config.mjs` dan `src/architecture.test.ts`.

- Jangan melonggarkan, menghapus, atau memberi pengecualian pada aturan di `eslint.config.mjs` dan `src/architecture.test.ts` untuk meloloskan perubahan. Kalau aturan memang perlu berubah, tanyakan ke user dulu, lalu ubah `docs/ARCHITECTURE.md` di commit yang sama.
- Jangan pakai `// eslint-disable`, `@ts-ignore`, atau `@ts-expect-error` untuk aturan arsitektur.
- Jangan membuat folder baru di luar struktur yang dikunci (misalnya `src/utils/`, `src/hooks/`, atau `modules/<fitur>/services/`). Helper generik masuk ke `src/shared/lib/`, hook UI masuk ke `presentation/components/` modul pemiliknya.
- Nilai visual hanya dari `src/shared/ui/styles/tokens.css`. Kalau butuh nilai baru, tambahkan token dulu, jangan menulis hex atau `px` di komponen.

## Git

- Jangan pernah memakai `git config --global`. Identitas commit repo ini disimpan di `.git/config` (email `denyekayana@gmail.com`).
- Jangan melewati pre-push hook dengan `--no-verify`.

## Sebelum selesai

Jalankan `npm run verify` (typecheck, lint, test, build) dan pastikan semuanya lolos.

## Cek UI langsung di browser

Setiap perubahan yang menyentuh UI (screen, komponen, layout, style, atau apa pun yang dilihat dan diklik user) wajib dibuka di browser sebelum dilaporkan selesai. `npm run verify` dan curl tidak cukup, karena keduanya tidak menjalankan klik, dropdown, atau redirect di sisi browser.

- Pakai browser yang tersedia di sesi (built-in browser atau Claude in Chrome), dan muat skill browser-nya dulu sebelum langkah pertama.
- Buka halaman yang berubah di dua lebar layar: desktop (minimal 1024px) dan HP (sekitar 390px).
- Jalankan alur yang berubah sampai selesai, misalnya buka menu, isi form, klik tombol, dan pastikan redirect-nya benar.
- Bandingkan tampilannya dengan file desain yang sesuai di `design/*.dc.html`.
- Laporkan apa yang terlihat, termasuk masalah yang ditemukan. Kalau browser tidak tersedia, tulis dengan jelas bahwa UI belum dicek di browser.
