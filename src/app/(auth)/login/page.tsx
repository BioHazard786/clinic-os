import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  description: "Sign in to your Clinic OS account.",
  title: "Sign In — Clinic OS",
};

export default function LoginPage() {
  return <LoginForm />;
}
