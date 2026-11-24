import { z } from "zod";
import { ACCOUNT_KINDS, type Account } from "../domain/account";

/** Bentuk AccountDto sesuai kontrak backend (API-CONTRACT.md bagian 4.8). */
export const accountDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(ACCOUNT_KINDS),
  opening_balance: z.number().int(),
  balance: z.number().int(),
});

export function toAccount(dto: z.infer<typeof accountDtoSchema>): Account {
  return { id: dto.id, name: dto.name, kind: dto.kind, openingBalance: dto.opening_balance, balance: dto.balance };
}
