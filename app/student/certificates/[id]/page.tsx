import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Award, ArrowRight, Camera } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/shared/print-button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function CertificateViewPage({
  params,
}: {
  params: { id: string };
}) {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login");
  }

  const cert = await prisma.certificate.findUnique({
    where: { id: params.id },
    include: {
      course: { select: { title: true, instructor: { select: { name: true } } } },
      student: { select: { name: true, id: true } },
    },
  });

  if (!cert) notFound();
  if (cert.student.id !== user.id) redirect("/student/certificates");

  return (
    <div>
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/student/certificates"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" /> رجوع
        </Link>
        <PrintButton />
      </div>

      {/* الشهادة */}
      <div className="mx-auto max-w-3xl rounded-2xl border-4 border-primary/40 bg-gradient-to-br from-[#12121A] to-[#1A1A2E] p-10 text-center shadow-2xl print:border-primary print:bg-white print:text-black">
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-xl bg-brand-gradient">
            <Camera className="h-7 w-7 text-white" />
          </span>
          <div className="text-right">
            <p className="text-xl font-extrabold">بيت المصوّر</p>
            <p className="text-xs text-muted-foreground print:text-gray-600">
              أكاديمية التصوير
            </p>
          </div>
        </div>

        <div className="mb-2 flex justify-center">
          <Award className="h-12 w-12 text-accent-light" />
        </div>

        <h1 className="text-2xl font-extrabold text-gradient print:text-primary">
          شهادة إتمام دورة
        </h1>
        <p className="mt-6 text-muted-foreground print:text-gray-600">
          تشهد أكاديمية بيت المصوّر بأن
        </p>
        <p className="mt-2 text-3xl font-extrabold">{cert.student.name}</p>
        <p className="mt-4 text-muted-foreground print:text-gray-600">
          قد أتمّ بنجاح دورة
        </p>
        <p className="mt-2 text-xl font-bold text-primary-light print:text-primary">
          {cert.course.title}
        </p>

        <div className="mt-10 flex items-center justify-between text-sm">
          <div className="text-right">
            <p className="text-muted-foreground print:text-gray-600">المدرّب</p>
            <p className="font-bold">{cert.course.instructor.name}</p>
          </div>
          <div className="text-left">
            <p className="text-muted-foreground print:text-gray-600">التاريخ</p>
            <p className="font-bold">
              {format(cert.issuedAt, "d MMMM yyyy", { locale: ar })}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-4 print:border-gray-300">
          <p className="font-mono text-xs text-muted-foreground print:text-gray-600" dir="ltr">
            رقم التحقق: {cert.number}
          </p>
        </div>
      </div>
    </div>
  );
}
