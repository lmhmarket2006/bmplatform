"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/courses", label: "الدورات" },
  { href: "/about", label: "من نحن" },
  { href: "/contact", label: "تواصل معنا" },
];

const roleHome: Record<string, string> = {
  ADMIN: "/admin",
  INSTRUCTOR: "/instructor",
  STUDENT: "/student",
};

export function Navbar() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const dashboard = session?.user?.role
    ? roleHome[session.user.role]
    : "/student";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 glass">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {status === "loading" ? (
            <div className="h-9 w-24 rounded-lg skeleton" />
          ) : session?.user ? (
            <>
              <Button asChild variant="gradient" size="sm">
                <Link href={dashboard}>
                  <LayoutDashboard className="h-4 w-4" />
                  لوحتي
                </Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">دخول</Link>
              </Button>
              <Button asChild variant="gradient" size="sm">
                <Link href="/register">إنشاء حساب</Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="القائمة"
            className="grid h-10 w-10 place-items-center"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* قائمة الجوال */}
      <div
        className={cn(
          "overflow-hidden border-t border-border/60 transition-all md:hidden",
          open ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="container flex flex-col gap-1 py-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-2">
            {session?.user ? (
              <Button asChild variant="gradient" className="flex-1">
                <Link href={dashboard}>لوحتي</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/login">دخول</Link>
                </Button>
                <Button asChild variant="gradient" className="flex-1">
                  <Link href="/register">إنشاء حساب</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
