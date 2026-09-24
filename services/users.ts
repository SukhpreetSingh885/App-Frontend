import { apiRequest } from "./api";
import type { StoredUser } from "./auth.storage";

export type ProfileUser = StoredUser & {
  countryCode?: string;
  mobile?: string;
  phoneNumber?: string;
};

export function getMyProfile() {
  return apiRequest<ProfileUser>(
    "/users/me",
  );
}

export function updateMyProfile(
  name: string,
) {
  return apiRequest<ProfileUser>(
    "/users/me",
    {
      method: "PATCH",
      body: JSON.stringify({
        name,
      }),
    },
  );
}

export function sendEmailChangeOtp(
  email: string,
) {
  return apiRequest<{
    message: string;
  }>(
    "/users/me/email/send-otp",
    {
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    },
  );
}

export function verifyEmailChangeOtp(
  email: string,
  otp: string,
) {
  return apiRequest<{
    message: string;
    email: string;
  }>(
    "/users/me/email/verify",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        otp,
      }),
    },
  );
}