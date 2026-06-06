import { prisma } from "./prisma";
import type { NotifType } from "@prisma/client";

interface CreateNotificationArgs {
  userId: string;
  title: string;
  message: string;
  type?: NotifType;
  link?: string;
}

/** ينشئ إشعاراً داخل المنصة لمستخدم واحد. */
export async function createNotification({
  userId,
  title,
  message,
  type = "GENERAL",
  link,
}: CreateNotificationArgs) {
  return prisma.notification.create({
    data: { userId, title, message, type, link },
  });
}

/** ينشئ إشعاراً لمجموعة مستخدمين. */
export async function createNotificationForMany(
  userIds: string[],
  data: Omit<CreateNotificationArgs, "userId">
) {
  if (userIds.length === 0) return;
  return prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      title: data.title,
      message: data.message,
      type: data.type ?? "GENERAL",
      link: data.link,
    })),
  });
}
