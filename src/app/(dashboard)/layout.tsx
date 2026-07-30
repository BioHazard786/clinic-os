import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard-shell";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  description:
    "Manage today's appointments, review patient history, and complete consultations.",
  title: "Doctor Dashboard — Clinic OS",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "doctor") {
    redirect("/my-appointments");
  }

  return (
    <DashboardShell
      user={{
        email: session.user.email,
        image: session.user.image,
        name: session.user.name,
        role: session.user.role ?? "patient",
      }}
    >
      {children}
    </DashboardShell>
  );
}
