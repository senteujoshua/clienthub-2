"use client";

import { useState } from "react";
import { Menu, Building2 } from "lucide-react";
import { Sidebar } from "./sidebar";

interface AppShellProps {
  user: { userId: string; name: string; email: string; role: string };
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile, static on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-30 lg:static lg:z-auto lg:translate-x-0 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar user={user} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 px-4 h-14 bg-[#1B2632] lg:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFB162] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-[#1B2632]" />
            </div>
            <span className="text-sm font-bold text-white">ClientHub</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-[#EEE9DF]">{children}</main>
      </div>
    </div>
  );
}
