import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Camera, GraduationCap, Award } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* اللوحة الجانبية للهوية */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-gradient p-12 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative z-10">
          <Logo />
        </div>
        <div className="relative z-10 space-y-6 text-white">
          <h2 className="text-4xl font-extrabold leading-snug">
            ابدأ رحلتك في عالم
            <br />
            التصوير الاحترافي
          </h2>
          <p className="max-w-md text-white/80">
            انضم لآلاف الطلاب وتعلّم التصوير الفوتوغرافي والفيديو والإضاءة
            والمونتاج بأسلوب عملي وممتع.
          </p>
          <ul className="space-y-3">
            {[
              { icon: Camera, text: "دورات احترافية بجودة عالية" },
              { icon: GraduationCap, text: "مدربون خبراء في المجال" },
              { icon: Award, text: "شهادات معتمدة عند الإتمام" },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/15">
                  <item.icon className="h-5 w-5" />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-sm text-white/60">
          © {new Date().getFullYear()} بيت المصوّر. جميع الحقوق محفوظة.
        </p>
      </div>

      {/* منطقة النموذج */}
      <div className="flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          {children}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary-light">
              ← العودة للصفحة الرئيسية
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
