import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/shared/page-header";
import { ProfileForm } from "@/components/shared/profile-form";

export const dynamic = "force-dynamic";

export default async function InstructorProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div>
      <PageHeader title="الملف الشخصي" description="معلوماتك التي تظهر للطلاب" />
      <ProfileForm
        showBio
        initial={{
          name: user.name,
          email: user.email,
          phone: user.phone,
          bio: user.bio,
          avatar: user.avatar,
        }}
      />
    </div>
  );
}
