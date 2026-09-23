import { apiRequest } from "./api";
import type { StoredUser } from "./auth.storage";

export type AuthResponse = {
  accessToken: string;
  user: StoredUser;
};

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  mobile: string;
  countryCode: string;
  referralCode?: string;
}) {
  return apiRequest<AuthResponse>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export async function loginUser(data: {
  identifier: string;
  password: string;
}) {
  return apiRequest<AuthResponse>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}