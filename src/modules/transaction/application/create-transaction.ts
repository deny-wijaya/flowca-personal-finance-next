import { assertValidNewTransaction, type NewTransaction, type Transaction } from "../domain/transaction";
import type { TransactionRepository } from "../domain/transaction-repository";

export class CreateTransaction {
  constructor(
    private readonly repository: TransactionRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(input: NewTransaction): Promise<Transaction> {
    const normalized: NewTransaction = { ...input, note: input.note?.trim() || undefined };
    assertValidNewTransaction(normalized, this.now());
    return this.repository.create(normalized);
  }
}
