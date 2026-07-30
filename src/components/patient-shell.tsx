"use client";

import { Navbar } from "@/components/navbar";

interface PatientUser {
  email: string;
  image: string | null | undefined;
  name: string;
  role: string;
}

export function PatientShell({
  user,
  children,
}: {
  user: PatientUser;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar user={user} />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
