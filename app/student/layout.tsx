import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar, type NavItem } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

const items: NavItem[] = [
  { href: "/student", label: "الرئيسية", icon: "dashboard", exact: true },
  { href: "/student/courses", label: "دوراتي", icon: "courses" },
  { href: "/student/certificates", label: "شهاداتي", icon: "certificates" },
  { href: "/student/profile", label: "الملف الشخصي", icon: "profile" },
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
