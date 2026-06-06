"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Bell, LogOut, User as UserIcon, Home } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

interface TopbarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  roleLabel: string;
  profileHref: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export function Topbar({ user, roleLabel, profileHref }: TopbarProps) {
  const { data } = useQuery<{ items: NotificationItem[]; unread: number }>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) return { items: [], unread: 0 };
      return res.json();
    },
    refetchInterval: 30000,
  });

  const unread = data?.unread ?? 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-5 backdrop-blur">
      <div>
        <span className="text-sm text-muted-foreground">لوحة {roleLabel}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* الإشعارات */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative grid h-10 w-10 place-items-center rounded-lg hover:bg-secondary">
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {data?.items?.length ? (
              data.items.slice(0, 6).map((n) => (
                <DropdownMenuItem key={n.id} asChild>
                  <Link href={n.link || "#"} className="flex flex-col items-start gap-0.5">
                    <span className="font-semibold">{n.title}</span>
                    <span className="line-clamp-2 text-xs text-muted-foreground">
                      {n.message}
                    </span>
                  </Link>
                </DropdownMenuItem>
              ))
            ) : (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                لا توجد إشعارات
              </p>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* قائمة المستخدم */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 pl-2 hover:bg-secondary">
            <Avatar className="h-9 w-9">
              {user.image && <AvatarImage src={user.image} />}
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium sm:block">
              {user.name}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span>{user.name}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={profileHref}>
                <UserIcon className="h-4 w-4" /> الملف الشخصي
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/">
                <Home className="h-4 w-4" /> الموقع الرئيسي
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-red-400"
            >
              <LogOut className="h-4 w-4" /> تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
