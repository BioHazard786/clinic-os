"use client";

import { IconCircleCheck, IconLogin } from "@tabler/icons-react";
import { useCallback, useTransition } from "react";
import { type PatientAppointment, selfCheckIn } from "@/app/actions/patient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { formatTime12h, getLocalDateString } from "@/lib/format";

function statusConfig(status: PatientAppointment["status"]): {
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

function isToday(dateString: string): boolean {
  return dateString === getLocalDateString();
}

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    weekday: "short",
    year: "numeric",
  });
}

export function AppointmentCard({
  appointment,
}: {
  appointment: PatientAppointment;
}) {
  const [isCheckingIn, startTransition] = useTransition();

  const handleCheckIn = useCallback(() => {
    startTransition(async () => {
      const result = await selfCheckIn(appointment.id);

      if (result.success) {
        toast.add({
          description:
            "You've been added to the doctor's queue. Please wait to be called.",
          title: "You're checked in!",
          type: "success",
        });
      } else {
        toast.add({
          description: result.error ?? "Failed to check in.",
          priority: "high",
          type: "error",
        });
      }
    });
  }, [appointment.id]);

  const config = statusConfig(appointment.status);
  const canCheckIn =
    isToday(appointment.date) && appointment.status === "scheduled";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {formatDate(appointment.date)}
          <Badge variant={config.variant}>{config.label}</Badge>
        </CardTitle>
        <CardDescription>
          {formatTime12h(appointment.startTime)} –{" "}
          {formatTime12h(appointment.endTime)}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {appointment.reasonForVisit ? (
          <div className="flex flex-col gap-1">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Reason for Visit
            </p>
            <p className="text-sm">{appointment.reasonForVisit}</p>
          </div>
        ) : null}

        {canCheckIn ? (
          <Button
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={isCheckingIn}
            onClick={handleCheckIn}
            size="lg"
          >
            {isCheckingIn ? (
              <>
                <Spinner data-icon="inline-start" />
                Checking in…
              </>
            ) : (
              <>
                <IconLogin data-icon="inline-start" />
                Check In Now
              </>
            )}
          </Button>
        ) : null}

        {appointment.status === "checked_in" ? (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
            <IconCircleCheck className="size-4" />
            <p className="font-medium text-sm">
              Checked in — waiting to be called
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
