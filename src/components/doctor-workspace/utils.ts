import type { AppointmentWithPatient } from "@/app/actions/doctor";
import { formatOrdinalDate } from "@/lib/format";

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function statusConfig(status: AppointmentWithPatient["status"]): {
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive";
} {
  switch (status) {
    case "checked_in":
      return { label: "Checked In", variant: "default" };
    case "in_consultation":
      return { label: "In Consultation", variant: "default" };
    case "scheduled":
      return { label: "Scheduled", variant: "secondary" };
    case "completed":
      return { label: "Completed", variant: "outline" };
    case "cancelled":
      return { label: "Cancelled", variant: "destructive" };
    default:
      return { label: status, variant: "outline" };
  }
}

export function formatDate(date: Date | string): string {
  return formatOrdinalDate(date);
}
