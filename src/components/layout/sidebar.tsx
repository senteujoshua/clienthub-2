"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  Building2,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";

interface SidebarUser {
  userId: string;
  name: string;
  email: string;
  role: string;
}

interface SidebarProps {
  user: SidebarUser;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/documents", label: "Documents", icon: FileText },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 shrink-0 flex flex-col h-full bg-[#1B2632]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-[#FFB162] flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-[#1B2632]" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">ClientHub</p>
          <p className="text-xs text-[#C9C1B1]">Management Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#FFB162] text-[#1B2632]"
                  : "text-[#C9C1B1] hover:bg-[#2C3B4D] hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-[#2C3B4D] flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-[#FFB162]">
              {getInitials(user.name)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user.name}
            </p>
            <p className="text-xs text-[#C9C1B1] truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#C9C1B1] hover:bg-[#2C3B4D] hover:text-white transition-all duration-150 mt-1"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
