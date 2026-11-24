/**
 * Standar pagination untuk data daftar dari backend (API-CONTRACT.md bagian 1).
 * Isi `cursor` dibuat oleh backend dan tidak boleh dibaca frontend, jadi di sini hanya berupa string.
 */
export const DEFAULT_PAGE_LIMIT = 20;

/** Permintaan satu halaman. Tanpa `cursor` berarti halaman pertama. */
export type PageRequest = { limit: number; cursor?: string };

/** Satu halaman hasil. `nextCursor` bernilai null kalau tidak ada halaman berikutnya. */
export type Page<TItem> = { items: TItem[]; nextCursor: string | null };
