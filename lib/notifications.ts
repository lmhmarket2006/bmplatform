import { prisma } from "./prisma";
import { sendEmail, emailButton } from "./email";
import type { NotifType } from "@prisma/client";

interface CreateNotificationArgs {
  userId: string;
  title: string;
  message: string;
  type?: NotifType;
  link?: string;
  /** أرسل نسخة بريد إلكتروني للمستخدم أيضاً */
  email?: boolean;
}

function appUrl(link?: string) {
  const base =
    process.env.AUTH_URL?.replace(/\/$/, "") || "http://localhost:3000";
  if (!link) return base;
  return link.startsWith("http") ? link : `${base}${link}`;
}

function emailBody(message: string, link?: string) {
  const button = link ? emailButton("فتح المنصة", appUrl(link)) : "";
  return `<p>${message}</p>${button}`;
}

/** ينشئ إشعاراً داخل المنصة لمستخدم واحد (مع بريد اختياري). */
export async function createNotification({
  userId,
  title,
  message,
  type = "GENERAL",
  link,
  email,
}: CreateNotificationArgs) {
  const notification = await prisma.notification.create({
    data: { userId, title, message, type, link },
  });

  if (email) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    if (user?.email) {
      await sendEmail({
        to: user.email,
        subject: title,
        html: emailBody(message, link),
      });
    }
  }

  return notification;
}

/** ينشئ إشعاراً لمجموعة مستخدمين (مع بريد اختياري). */
export async function createNotificationForMany(
  userIds: string[],
  data: Omit<CreateNotificationArgs, "userId">
) {
  if (userIds.length === 0) return;

  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      title: data.title,
      message: data.message,
      type: data.type ?? "GENERAL",
      link: data.link,
    })),
  });

  if (data.email) {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { email: true },
    });
    await Promise.all(
      users
        .filter((u) => u.email)
        .map((u) =>
          sendEmail({
            to: u.email,
            subject: data.title,
            html: emailBody(data.message, data.link),
          })
        )
    );
  }
}
