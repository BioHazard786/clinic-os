"use client";

import { Navbar } from "@/components/navbar";

interface DashboardUser {
  email: string;
  image: string | null | undefined;
  name: string;
  role: string;
}

export function DashboardShell({
  user,
  children,
}: {
  user: DashboardUser;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar user={user} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
