import { redirect } from "next/navigation";
import { LayoutDashboard, BookOpen, Award, User } from "lucide-react";
import { auth } from "@/lib/auth";
import { Sidebar, type NavItem } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

const items: NavItem[] = [
  { href: "/student", label: "الرئيسية", icon: LayoutDashboard, exact: true },
  { href: "/student/courses", label: "دوراتي", icon: BookOpen },
  { href: "/student/certificates", label: "شهاداتي", icon: Award },
  { href: "/student/profile", label: "الملف الشخصي", icon: User },
];

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/student");
  if (session.user.role !== "STUDENT") redirect("/");

  return (
    <div className="flex min-h-screen">
      <Sidebar items={items} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={session.user} roleLabel="الطالب" profileHref="/student/profile" />
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
