import { z } from "zod";
import type { Category } from "../domain/category";
import { TRANSACTION_TYPES } from "../domain/transaction";

/** Bentuk CategoryDto sesuai kontrak backend (API-CONTRACT.md bagian 4.6). */
export const categoryDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(TRANSACTION_TYPES),
  is_default: z.boolean(),
});

export function toCategory(dto: z.infer<typeof categoryDtoSchema>): Category {
  return { id: dto.id, name: dto.name, type: dto.type, isDefault: dto.is_default };
}
