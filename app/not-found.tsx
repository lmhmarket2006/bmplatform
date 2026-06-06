import Link from "next/link";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center p-6">
      <div className="text-center">
        <span className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-brand-gradient">
          <Camera className="h-8 w-8 text-white" />
        </span>
        <h1 className="text-6xl font-extrabold text-gradient">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          عذراً، الصفحة التي تبحث عنها غير موجودة.
        </p>
        <Button asChild variant="gradient" className="mt-8">
          <Link href="/">العودة للرئيسية</Link>
        </Button>
      </div>
    </div>
  );
}
