import { ValidationError } from "@/shared/domain/errors";
import type { Page, PageRequest } from "@/shared/domain/pagination";
import { DEFAULT_CATEGORIES, type Category, type NewCategory } from "../domain/category";
import type { CategoryRepository } from "../domain/category-repository";
import type { TransactionType } from "../domain/transaction";

/** Kategori tanpa backend (DATA_SOURCE=mock dan unit test). Meniru aturan backend untuk nama dobel. */
export class InMemoryCategoryRepository implements CategoryRepository {
  private categories: Category[] = DEFAULT_CATEGORIES.map((category) => ({ ...category, isDefault: true }));

  async list(filter: { type?: TransactionType }, page: PageRequest): Promise<Page<Category>> {
    const rows = this.categories.filter((category) => !filter.type || category.type === filter.type);
    const start = page.cursor ? Number(page.cursor) : 0;
    const end = start + page.limit;
    return { items: rows.slice(start, end), nextCursor: end < rows.length ? String(end) : null };
  }

  async create(input: NewCategory): Promise<Category> {
    const taken = this.categories.some((category) => category.type === input.type && category.name.toLowerCase() === input.name.toLowerCase());
    if (taken) throw new ValidationError(`Kategori ${input.name} sudah ada`, "name");
    const category: Category = { ...input, id: `cat_${crypto.randomUUID()}`, isDefault: false };
    this.categories.push(category);
    return category;
  }

  /** Untuk InMemoryTransactionRepository: kategori dari id (pengganti JOIN di backend). */
  find(id: string): Category | undefined {
    return this.categories.find((category) => category.id === id);
  }
}
