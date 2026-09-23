import { apiRequest } from "./api";

export type ReferralCode = {
  code: string;
  link: string;
};

export type MyReferralsResponse = {
  rewardAmount: number;
  codes: ReferralCode[];
};

export function getMyReferralCodes() {
  return apiRequest<MyReferralsResponse>(
    "/referrals/my-codes",
  );
}