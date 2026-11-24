import { ValidationError } from "@/shared/domain/errors";
import { MAX_CATEGORY_NAME_LENGTH, type Category, type NewCategory } from "../domain/category";
import type { CategoryRepository } from "../domain/category-repository";

/** Membuat kategori kustom dari chip "+ Kategori baru" di form Tambah transaksi. */
export class CreateCategory {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(input: NewCategory): Promise<Category> {
    // Dicek juga di backend. Di sini supaya pesan muncul tanpa menunggu request.
    const name = input.name.trim().replace(/\s+/g, " ");
    if (!name) throw new ValidationError("Nama kategori wajib diisi", "name");
    if (name.length > MAX_CATEGORY_NAME_LENGTH) throw new ValidationError(`Nama kategori maksimal ${MAX_CATEGORY_NAME_LENGTH} karakter`, "name");
    return this.repository.create({ name, type: input.type });
  }
}
