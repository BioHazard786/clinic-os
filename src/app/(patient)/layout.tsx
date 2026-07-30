import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PatientShell } from "@/components/patient-shell";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  description:
    "Book appointments, manage your schedule, and check in for visits.",
  title: "My Clinic — Clinic OS",
};

export default async function PatientLayout({
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

  if (session.user.role !== "patient") {
    redirect("/dashboard");
  }

  return (
    <PatientShell
      user={{
        email: session.user.email,
        image: session.user.image,
        name: session.user.name,
        role: session.user.role ?? "patient",
      }}
    >
      {children}
    </PatientShell>
  );
}
