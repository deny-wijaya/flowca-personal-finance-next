import { ValidationError } from "@/shared/domain/errors";
import type { Page, PageRequest } from "@/shared/domain/pagination";
import type { HttpClient } from "@/shared/infrastructure/http/http-client";
import { HttpError } from "@/shared/infrastructure/http/http-error";
import type { Category, NewCategory } from "../domain/category";
import type { CategoryRepository } from "../domain/category-repository";
import type { TransactionType } from "../domain/transaction";
import { categoryDtoSchema, toCategory } from "./category-dto";

/** Kategori dari backend: GET dan POST /categories. */
export class HttpCategoryRepository implements CategoryRepository {
  constructor(private readonly http: HttpClient) {}

  async list(filter: { type?: TransactionType }, page: PageRequest): Promise<Page<Category>> {
    const result = await this.http.requestPage("/categories", {
      query: { type: filter.type, limit: page.limit, cursor: page.cursor },
      schema: categoryDtoSchema,
    });
    return { items: result.items.map(toCategory), nextCursor: result.nextCursor };
  }

  async create(input: NewCategory): Promise<Category> {
    try {
      const dto = await this.http.request("/categories", { method: "POST", body: input, schema: categoryDtoSchema });
      return toCategory(dto);
    } catch (error) {
      // 409 CATEGORY_ALREADY_EXISTS dan 400 nama tidak valid ditampilkan di bawah kotak isian nama.
      if (error instanceof HttpError && (error.status === 409 || error.status === 400)) throw new ValidationError(error.message, "name");
      throw error;
    }
  }
}
