import { redirect } from "next/navigation";
import { LayoutDashboard, BookOpen, User } from "lucide-react";
import { auth } from "@/lib/auth";
import { Sidebar, type NavItem } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

const items: NavItem[] = [
  { href: "/instructor", label: "الرئيسية", icon: LayoutDashboard, exact: true },
  { href: "/instructor/courses", label: "دوراتي", icon: BookOpen },
  { href: "/instructor/profile", label: "الملف الشخصي", icon: User },
];

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/instructor");
  if (session.user.role !== "INSTRUCTOR") redirect("/");

  return (
    <div className="flex min-h-screen">
      <Sidebar items={items} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={session.user} roleLabel="المدرّب" profileHref="/instructor/profile" />
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
