import Link from "next/link";
import { AtSign, Send, Globe, Mail, Phone } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="space-y-4 md:col-span-2">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            أكاديمية بيت المصوّر — وجهتك لتعلّم التصوير الفوتوغرافي والفيديو
            والإضاءة والمونتاج باحترافية على يد نخبة من المدربين.
          </p>
          <div className="flex gap-3">
            {[AtSign, Send, Globe].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-10 w-10 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary-light"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-bold">روابط سريعة</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li><Link href="/courses" className="hover:text-primary-light">الدورات</Link></li>
            <li><Link href="/about" className="hover:text-primary-light">من نحن</Link></li>
            <li><Link href="/contact" className="hover:text-primary-light">تواصل معنا</Link></li>
            <li><Link href="/register" className="hover:text-primary-light">إنشاء حساب</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-bold">تواصل معنا</h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> info@baitalmusawwir.com
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> 920000000
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} بيت المصوّر. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}
