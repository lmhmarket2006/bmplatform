import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/components/shared/profile-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div>
      <PageHeader title="الإعدادات" description="إدارة حسابك الشخصي" />
      <ProfileForm
        initial={{
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
        }}
      />
    </div>
  );
}
