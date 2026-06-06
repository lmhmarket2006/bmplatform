import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  BarChart3,
  Settings,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { Sidebar, type NavItem } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

const items: NavItem[] = [
  { href: "/admin", label: "الرئيسية", icon: LayoutDashboard, exact: true },
  { href: "/admin/enrollments", label: "طلبات التسجيل", icon: ClipboardCheck },
  { href: "/admin/students", label: "الطلاب", icon: Users },
  { href: "/admin/courses", label: "الدورات", icon: BookOpen },
  { href: "/admin/instructors", label: "المدربون", icon: GraduationCap },
  { href: "/admin/reports", label: "التقارير", icon: BarChart3 },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="flex min-h-screen">
      <Sidebar items={items} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={session.user} roleLabel="التحكم" profileHref="/admin/settings" />
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
