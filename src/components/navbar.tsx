"use client";

import {
  IconCalendarPlus,
  IconChevronDown,
  IconClipboardList,
  IconLayoutDashboard,
  IconLogout,
  IconStethoscope,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface NavbarUser {
  email: string;
  image: string | null | undefined;
  name: string;
  role: string;
}

const doctorNav = [
  { href: "/dashboard", icon: IconLayoutDashboard, label: "Queue / Workspace" },
];

const patientNav = [
  {
    href: "/my-appointments",
    icon: IconClipboardList,
    label: "My Appointments",
  },
  { href: "/book", icon: IconCalendarPlus, label: "Book New" },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Navbar({ user }: { user: NavbarUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const isDoctor = user.role === "doctor";
  const navItems = isDoctor ? doctorNav : patientNav;

  const handleSignOut = useCallback(() => {
    signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          router.refresh();
        },
      },
    });
  }, [router]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
      {/* ── Logo ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <IconStethoscope className="size-4" />
        </div>
        <span className="font-heading font-semibold text-base tracking-tight">
          Clinic OS
        </span>
        <Badge className="ml-1" variant="secondary">
          {isDoctor ? "Doctor" : "Patient"}
        </Badge>
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              className={cn(isActive && "bg-muted text-foreground")}
              key={item.href}
              nativeButton={false}
              render={<Link href={item.href} />}
              size="sm"
              variant="ghost"
            >
              <item.icon data-icon="inline-start" />
              <span className="hidden sm:inline">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* ── User Dropdown ─────────────────────────────────── */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
          render={<button type="button" />}
        >
          <Avatar className="size-7">
            <AvatarImage alt={user.name} src={user.image ?? undefined} />
            <AvatarFallback className="text-xs">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-muted-foreground sm:inline">
            {isDoctor ? `Dr. ${user.name}` : user.name}
          </span>
          <IconChevronDown className="size-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" sideOffset={8}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{user.name}</span>
                <span className="font-normal text-muted-foreground text-xs">
                  {user.email}
                </span>
              </div>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleSignOut}>
              <IconLogout />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
