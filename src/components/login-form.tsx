"use client";

import { IconStethoscope } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type SubmitEvent, useCallback, useState } from "react";

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
import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);

      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      await signIn.email(
        {
          callbackURL: "/",
          email,
          password,
        },
        {
          onError: (ctx) => {
            toast.add({
              description: ctx.error.message ?? "Invalid email or password",
              priority: "high",
              type: "error",
            });
            setIsLoading(false);
          },
          onSuccess: () => {
            toast.add({
              description: "Signed in successfully",
              type: "success",
            });
            router.push("/");
            router.refresh();
          },
        }
      );
    },
    [router]
  );

  const handleGoogleSignIn = useCallback(() => {
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
              Welcome to Clinic OS
            </h1>
            <FieldDescription>
              Don&apos;t have an account? <Link href="/register">Sign up</Link>
            </FieldDescription>
          </div>
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
              autoComplete="current-password"
              id="password"
              name="password"
              placeholder="••••••••"
              required
              type="password"
            />
          </Field>
          <Field>
            <Button disabled={isLoading} type="submit">
              {isLoading ? <Spinner /> : null}
              Sign in
            </Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field>
            <Button
              disabled={isGoogleLoading}
              onClick={handleGoogleSignIn}
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
              Sign in with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
