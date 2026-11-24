import { ValidationError } from "@/shared/domain/errors";
import { MAX_ACCOUNT_NAME_LENGTH, type Account, type NewAccount } from "../domain/account";

/** Membuat akun dari menu Akun atau dari langkah terakhir onboarding. */
export class CreateAccount {
  constructor(private readonly repository: { create(input: NewAccount): Promise<Account> }) {}

  async execute(input: NewAccount): Promise<Account> {
    // Dicek juga di backend. Di sini supaya pesan muncul tanpa menunggu request.
    const name = input.name.trim().replace(/\s+/g, " ");
    if (!name) throw new ValidationError("Nama akun wajib diisi", "name");
    if (name.length > MAX_ACCOUNT_NAME_LENGTH) throw new ValidationError(`Nama akun maksimal ${MAX_ACCOUNT_NAME_LENGTH} karakter`, "name");
    return this.repository.create({ ...input, name });
  }
}
