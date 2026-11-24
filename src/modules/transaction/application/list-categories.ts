import type { Category } from "../domain/category";
import type { CategoryRepository } from "../domain/category-repository";
import type { TransactionType } from "../domain/transaction";

/** Batas per halaman saat mengambil kategori. Biasanya semua kategori muat di satu halaman. */
const CATEGORY_PAGE_LIMIT = 100;

/**
 * Semua kategori yang boleh dipakai user (bawaan + kustom), untuk chip di form Tambah transaksi
 * dan filter Kategori di menu Transaksi. Endpoint-nya memakai pagination, jadi halaman diikuti
 * sampai `nextCursor` habis.
 */
export class ListCategories {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(type?: TransactionType): Promise<Category[]> {
    const all: Category[] = [];
    let cursor: string | undefined;
    do {
      const page = await this.repository.list({ type }, { limit: CATEGORY_PAGE_LIMIT, cursor });
      all.push(...page.items);
      cursor = page.nextCursor ?? undefined;
    } while (cursor);
    return all;
  }
}
