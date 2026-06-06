import Link from "next/link";
import { redirect } from "next/navigation";
import { Award, ExternalLink } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login");
  }

  const certificates = await prisma.certificate.findMany({
    where: { studentId: user.id },
    orderBy: { issuedAt: "desc" },
    include: { course: { select: { title: true } } },
  });

  return (
    <div>
      <PageHeader
        title="شهاداتي"
        description="الشهادات التي حصلت عليها بإكمال الدورات"
      />

      {certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="لا توجد شهادات بعد"
          description="أكمل دورة بالكامل للحصول على شهادتك المعتمدة."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              <div className="bg-brand-gradient p-6 text-center text-white">
                <Award className="mx-auto mb-2 h-10 w-10" />
                <p className="text-sm opacity-80">شهادة إتمام</p>
              </div>
              <CardContent className="p-5">
                <h3 className="line-clamp-2 font-bold">{c.course.title}</h3>
                <p className="mt-1 font-mono text-xs text-muted-foreground" dir="ltr">
                  {c.number}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {format(c.issuedAt, "d MMMM yyyy", { locale: ar })}
                </p>
                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                  <Link href={`/student/certificates/${c.id}`}>
                    <ExternalLink className="h-4 w-4" /> عرض الشهادة
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
