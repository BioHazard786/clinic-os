"use client";

import { IconClock } from "@tabler/icons-react";
import { useCallback } from "react";
import type { AppointmentWithPatient } from "@/app/actions/doctor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatTime12h } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getInitials, statusConfig } from "./utils";

export function PatientQueueItem({
  appointment,
  isActive,
  onSelect,
}: {
  appointment: AppointmentWithPatient;
  isActive: boolean;
  onSelect: (appointment: AppointmentWithPatient) => void;
}) {
  const handleClick = useCallback(() => {
    onSelect(appointment);
  }, [appointment, onSelect]);

  const { label, variant } = statusConfig(appointment.status);

  return (
    <button
      className="w-full text-left outline-none"
      onClick={handleClick}
      type="button"
    >
      <div
        className={cn(
          "relative rounded-lg border p-3 transition-all duration-200",
          isActive
            ? "border-primary/40 bg-primary/[0.04] shadow-sm ring-1 ring-primary/30"
            : "border-border/50 bg-card shadow-xs hover:border-border hover:bg-accent/30 hover:shadow-sm"
        )}
      >
        {/* Left accent strip */}
        {isActive ? (
          <div className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-primary" />
        ) : null}

        <div className={cn("flex items-center gap-3", isActive && "pl-1.5")}>
          <Avatar
            className={cn(
              "size-9 shrink-0 transition-shadow duration-200",
              isActive && "ring-2 ring-primary/20"
            )}
          >
            <AvatarImage
              alt={appointment.patient.name}
              src={appointment.patient.image ?? undefined}
            />
            <AvatarFallback className="font-medium text-xs">
              {getInitials(appointment.patient.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <div className="flex items-center justify-between gap-1.5">
              <span className="truncate font-semibold text-foreground text-sm">
                {appointment.patient.name}
              </span>
              <Badge
                className="shrink-0 px-1.5 py-0.5 text-[10px]"
                variant={variant}
              >
                {label}
              </Badge>
            </div>
            <span className="truncate text-muted-foreground text-xs">
              {appointment.reasonForVisit ?? "General visit"}
            </span>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 border-border/40 border-t pt-2 font-medium text-muted-foreground text-xs">
          <IconClock className="size-3.5 shrink-0 text-muted-foreground/80" />
          <span>
            {formatTime12h(appointment.startTime)} –{" "}
            {formatTime12h(appointment.endTime)}
          </span>
        </div>
      </div>
    </button>
  );
}
