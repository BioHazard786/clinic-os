import type { Metadata } from "next";
import { SignupForm } from "@/components/signup-form";

export const metadata: Metadata = {
  description: "Create a new Clinic OS account.",
  title: "Sign Up — Clinic OS",
};

export default function RegisterPage() {
  return <SignupForm />;
}
