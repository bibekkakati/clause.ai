export const NOTIFICATION_TYPES = ["OTP"] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
