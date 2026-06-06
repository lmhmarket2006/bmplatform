import { prisma } from "./prisma";

/** يولّد رقم شهادة فريد. */
export function generateCertificateNumber() {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BM-${year}-${rand}`;
}

/** يُصدر شهادة للطالب في دورة إن لم تكن موجودة. */
export async function issueCertificateIfNeeded(
  studentId: string,
  courseId: string
) {
  const existing = await prisma.certificate.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });
  if (existing) return existing;

  let number = generateCertificateNumber();
  // ضمان التفرّد
  while (await prisma.certificate.findUnique({ where: { number } })) {
    number = generateCertificateNumber();
  }

  return prisma.certificate.create({
    data: { studentId, courseId, number },
  });
}
