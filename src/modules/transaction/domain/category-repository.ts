import type { Page, PageRequest } from "@/shared/domain/pagination";
import type { Category, NewCategory } from "./category";
import type { TransactionType } from "./transaction";

/** Kontrak penyimpanan kategori. Implementasinya HTTP (GET/POST /categories) dan in-memory (mock). */
export interface CategoryRepository {
  /** Kategori bawaan lalu kategori kustom milik user yang login, satu halaman. */
  list(filter: { type?: TransactionType }, page: PageRequest): Promise<Page<Category>>;
  /** Melempar ValidationError di field "name" kalau nama sudah ada untuk jenis yang sama. */
  create(input: NewCategory): Promise<Category>;
}
