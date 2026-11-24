import { z } from "zod";
import { ValidationError } from "@/shared/domain/errors";
import type { Page, PageRequest } from "@/shared/domain/pagination";
import type { HttpClient } from "@/shared/infrastructure/http/http-client";
import { HttpError } from "@/shared/infrastructure/http/http-error";
import type { Budget, BudgetRepository } from "../domain/budget";
import { budgetDtoSchema, toBudget } from "./budget-dto";

/** Anggaran dari backend: GET /budgets, PUT dan DELETE /budgets/:category_id. */
export class HttpBudgetRepository implements BudgetRepository {
  constructor(private readonly http: HttpClient) {}

  async list(page: PageRequest): Promise<Page<Budget>> {
    const result = await this.http.requestPage("/budgets", { query: { limit: page.limit, cursor: page.cursor }, schema: budgetDtoSchema });
    return { items: result.items.map(toBudget), nextCursor: result.nextCursor };
  }

  async set(categoryId: string, limit: number): Promise<Budget> {
    try {
      const dto = await this.http.request(`/budgets/${encodeURIComponent(categoryId)}`, { method: "PUT", body: { amount: limit }, schema: budgetDtoSchema });
      return toBudget(dto);
    } catch (error) {
      // 400 (nominal atau kategori pemasukan) dan 404 (kategori tidak ditemukan) ditampilkan di form anggaran.
      if (error instanceof HttpError && (error.status === 400 || error.status === 404)) {
        throw new ValidationError(error.message, error.status === 400 && isAmountError(error.details) ? "amount" : "categoryId");
      }
      throw error;
    }
  }

  async delete(categoryId: string): Promise<void> {
    try {
      // DELETE dibalas 204 tanpa body, jadi memakai requestNoContent, bukan request.
      await this.http.requestNoContent(`/budgets/${encodeURIComponent(categoryId)}`, { method: "DELETE" });
    } catch (error) {
      // Sudah terhapus (misalnya dari perangkat lain): hasil akhirnya sama, jadi tidak dianggap gagal.
      if (error instanceof HttpError && error.status === 404) return;
      throw error;
    }
  }
}

function isAmountError(details: unknown): boolean {
  return z.object({ fieldErrors: z.object({ amount: z.array(z.string()) }) }).safeParse(details).success;
}
