"use client";

import { IconStethoscope } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type SubmitEvent,
  useCallback,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { signIn, signUp } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const DOCTOR_INVITE_CODE = "CLINIC2024";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDoctor, setIsDoctor] = useState(false);

  const handleDoctorToggle = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setIsDoctor(e.target.checked);
  }, []);

  const handleSubmit = useCallback(
    async (e: SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);

      const formData = new FormData(e.currentTarget);
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const inviteCode = formData.get("inviteCode") as string;

      if (isDoctor && inviteCode !== DOCTOR_INVITE_CODE) {
        toast.add({
          description: "Invalid invite code",
          priority: "high",
          type: "error",
        });
        setIsLoading(false);
        return;
      }

      await signUp.email(
        {
          callbackURL: "/",
          email,
          name,
          password,
          role: isDoctor ? "doctor" : "patient",
        },
        {
          onError: (ctx) => {
            toast.add({
              description: ctx.error.message ?? "Registration failed",
              priority: "high",
              type: "error",
            });
            setIsLoading(false);
          },
          onSuccess: () => {
            toast.add({
              description: "Account created — signing you in…",
              type: "success",
            });
            router.push("/");
            router.refresh();
          },
        }
      );
    },
    [isDoctor, router]
  );

  const handleGoogleSignUp = useCallback(() => {
    setIsGoogleLoading(true);
    signIn.social({
      callbackURL: "/",
      provider: "google",
    });
  }, []);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              className="flex flex-col items-center gap-2 font-medium"
              href="/"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <IconStethoscope className="size-5" />
              </div>
              <span className="sr-only">Clinic OS</span>
            </Link>
            <h1 className="font-bold font-heading text-xl">
              Create your account
            </h1>
            <FieldDescription>
              Already have an account? <Link href="/login">Sign in</Link>
            </FieldDescription>
          </div>

          <Field>
            <FieldLabel htmlFor="name">Full name</FieldLabel>
            <Input
              autoComplete="name"
              id="name"
              name="name"
              placeholder="Jane Doe"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              autoComplete="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              autoComplete="new-password"
              id="password"
              minLength={8}
              name="password"
              placeholder="••••••••"
              required
              type="password"
            />
          </Field>

          {/* ── Role Selection ──────────────────────────────────── */}
          <Field>
            <div className="flex items-center gap-2">
              <input
                checked={isDoctor}
                className="size-4 rounded border-input accent-primary"
                id="role-doctor"
                onChange={handleDoctorToggle}
                type="checkbox"
              />
              <FieldLabel className="cursor-pointer" htmlFor="role-doctor">
                I&apos;m a doctor
              </FieldLabel>
            </div>
          </Field>

          {isDoctor ? (
            <Field>
              <FieldLabel htmlFor="inviteCode">Doctor invite code</FieldLabel>
              <Input
                id="inviteCode"
                name="inviteCode"
                placeholder="Enter invite code"
                required
              />
            </Field>
          ) : null}

          <Field>
            <Button disabled={isLoading} type="submit">
              {isLoading ? <Spinner /> : null}
              Create account
            </Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field>
            <Button
              disabled={isGoogleLoading}
              onClick={handleGoogleSignUp}
              type="button"
              variant="outline"
            >
              {isGoogleLoading ? (
                <Spinner />
              ) : (
                <svg
                  aria-label="Google"
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                </svg>
              )}
              Sign up with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
