import { apiRequest } from "./api";

export type WalletTransaction = {
  _id: string;
  amount: number;
  type: "credit" | "debit";
  reason: string;
  createdAt: string;
  updatedAt: string;
};

export type WalletBalanceResponse = {
  balance: number;
};

export async function getWalletBalance(): Promise<number> {
  const response =
    await apiRequest<WalletBalanceResponse>(
      "/wallet/balance",
    );

  return response.balance;
}

export async function getWalletTransactions(): Promise<
  WalletTransaction[]
> {
  return apiRequest<WalletTransaction[]>(
    "/wallet/transactions",
  );
}