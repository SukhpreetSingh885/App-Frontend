import { apiRequest } from "./api";

export type NotificationData = {
  courseId?: string;
  enrollmentId?: string;
  referralUsageId?: string;
  amount?: number;
  [key: string]: unknown;
};

export type NotificationRecord = {
  _id: string;
  recipientId: string;
  recipientType: "student";
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: NotificationData;
  createdAt: string;
  updatedAt: string;
};

export function getNotifications() {
  return apiRequest<NotificationRecord[]>(
    "/notifications",
  );
}

export async function getUnreadNotificationCount() {
  const response = await apiRequest<{
    unreadCount: number;
  }>("/notifications/unread-count");

  return response.unreadCount;
}

export function markNotificationAsRead(
  notificationId: string,
) {
  return apiRequest<NotificationRecord>(
    `/notifications/${notificationId}/read`,
    { method: "PATCH" },
  );
}

export function markAllNotificationsAsRead() {
  return apiRequest<{ modifiedCount: number }>(
    "/notifications/read-all",
    { method: "PATCH" },
  );
}
