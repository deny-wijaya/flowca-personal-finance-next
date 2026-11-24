import { ValidationError } from "@/shared/domain/errors";
import type { Page, PageRequest } from "@/shared/domain/pagination";
import type { HttpClient } from "@/shared/infrastructure/http/http-client";
import { HttpError } from "@/shared/infrastructure/http/http-error";
import type { Account, AccountRepository, NewAccount } from "../domain/account";
import { accountDtoSchema, toAccount } from "./account-dto";

/** Akun dari backend: GET dan POST /accounts. */
export class HttpAccountRepository implements AccountRepository {
  constructor(private readonly http: HttpClient) {}

  async list(page: PageRequest): Promise<Page<Account>> {
    const result = await this.http.requestPage("/accounts", {
      query: { limit: page.limit, cursor: page.cursor },
      schema: accountDtoSchema,
    });
    return { items: result.items.map(toAccount), nextCursor: result.nextCursor };
  }

  async create(input: NewAccount): Promise<Account> {
    try {
      const dto = await this.http.request("/accounts", {
        method: "POST",
        body: { name: input.name, kind: input.kind, opening_balance: input.openingBalance },
        schema: accountDtoSchema,
      });
      return toAccount(dto);
    } catch (error) {
      // 409 ACCOUNT_ALREADY_EXISTS dan 400 dari aturan nama/saldo ditampilkan di bawah field yang salah.
      if (error instanceof HttpError && (error.status === 409 || error.status === 400)) {
        throw new ValidationError(error.message, fieldOf(error.details) ?? "name");
      }
      throw error;
    }
  }
}

/** Nama field pertama di details.fieldErrors, diubah ke camelCase ("opening_balance" -> "openingBalance"). */
function fieldOf(details: unknown): string | undefined {
  const fieldErrors = (details as { fieldErrors?: Record<string, unknown> } | undefined)?.fieldErrors;
  const field = fieldErrors ? Object.keys(fieldErrors)[0] : undefined;
  return field?.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}
