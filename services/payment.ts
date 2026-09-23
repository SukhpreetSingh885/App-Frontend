import { apiRequest } from "./api";

export interface CreatePaymentResponse {
  paymentId: string;
  paymentIntentId: string;
  clientSecret: string;
}

export async function createPayment(
  courseId: string,
): Promise<CreatePaymentResponse> {
  return apiRequest<CreatePaymentResponse>(
    "/payments",
    {
      method: "POST",
      body: JSON.stringify({ courseId }),
    },
  );
}
