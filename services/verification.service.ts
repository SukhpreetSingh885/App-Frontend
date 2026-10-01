import { apiRequest } from "./api";

export function sendEmailOtp(
  email: string,
  name?: string,
) {
  return apiRequest<{ message: string }>(
    "/verification/email/send",
    {
      method: "POST",
      body: JSON.stringify({ email, name }),
    },
  );
}

export function verifyEmailOtp(
  email: string,
  otp: string,
) {
  return apiRequest<{
    verified: boolean;
    message: string;
  }>(
    "/verification/email/verify",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        otp,
      }),
    },
  );
}
