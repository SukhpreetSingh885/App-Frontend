import { apiRequest } from "./api";

export type WithdrawalStatus =
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "rejected";

export type PayoutMethod = "upi" | "bank";

export type WithdrawalSettings = {
  withdrawalsEnabled: boolean;
  minimumWithdrawalAmount: number;
};

export type Withdrawal = {
  _id: string;
  amount: number;
  status: WithdrawalStatus;
  payoutMethod: PayoutMethod;
  payoutDestination?: string;
  accountHolderName?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
};

export type CreateWithdrawalInput =
  | {
      amount: number;
      payoutMethod: "upi";
      upiId: string;
    }
  | {
      amount: number;
      payoutMethod: "bank";
      accountHolderName: string;
      bankAccountNumber: string;
      ifscCode: string;
    };

export function getWithdrawalSettings() {
  return apiRequest<WithdrawalSettings>(
    "/withdrawals/settings",
  );
}

export function getMyWithdrawals() {
  return apiRequest<Withdrawal[]>(
    "/withdrawals/me",
  );
}

export function createWithdrawal(
  input: CreateWithdrawalInput,
) {
  return apiRequest<Withdrawal>("/withdrawals", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
