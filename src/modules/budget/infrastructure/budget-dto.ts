import { z } from "zod";
import type { Budget } from "../domain/budget";

/** Bentuk BudgetDto sesuai kontrak backend (API-CONTRACT.md bagian 4.10). */
export const budgetDtoSchema = z.object({
  category_id: z.string(),
  category: z.string(),
  amount: z.number().int(),
});

export function toBudget(dto: z.infer<typeof budgetDtoSchema>): Budget {
  return { categoryId: dto.category_id, category: dto.category, limit: dto.amount };
}
