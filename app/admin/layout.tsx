import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar, type NavItem } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

const items: NavItem[] = [
  { href: "/admin", label: "الرئيسية", icon: "dashboard", exact: true },
  { href: "/admin/enrollments", label: "طلبات التسجيل", icon: "enrollments" },
  { href: "/admin/students", label: "الطلاب", icon: "users" },
  { href: "/admin/courses", label: "الدورات", icon: "courses" },
  { href: "/admin/instructors", label: "المدربون", icon: "instructors" },
  { href: "/admin/reports", label: "التقارير", icon: "reports" },
  { href: "/admin/settings", label: "الإعدادات", icon: "settings" },
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
