import { IconClock, IconNotes } from "@tabler/icons-react";
import type { AppointmentWithPatient } from "@/app/actions/doctor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatTime12h } from "@/lib/format";
import { getInitials, statusConfig } from "./utils";

export function PatientOverview({
  appointment,
}: {
  appointment: AppointmentWithPatient;
}) {
  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3.5">
            <Avatar className="size-12 shrink-0 shadow-sm ring-2 ring-primary/10">
              <AvatarImage
                alt={appointment.patient.name}
                src={appointment.patient.image ?? undefined}
              />
              <AvatarFallback className="font-semibold text-sm">
                {getInitials(appointment.patient.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <CardTitle className="truncate font-semibold text-lg tracking-tight">
                {appointment.patient.name}
              </CardTitle>
              <CardDescription className="truncate text-xs sm:text-sm">
                {appointment.patient.email}
              </CardDescription>
            </div>
          </div>
          <Badge
            className="w-fit shrink-0 self-start sm:self-center"
            variant={statusConfig(appointment.status).variant}
          >
            {statusConfig(appointment.status).label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-3.5 border-border/60 border-t pt-3 text-muted-foreground text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <IconClock className="size-4 shrink-0 text-muted-foreground" />
            <span>
              {formatTime12h(appointment.startTime)} –{" "}
              {formatTime12h(appointment.endTime)}
            </span>
          </div>
          <Separator className="h-3.5" orientation="vertical" />
          <div className="flex items-center gap-1.5">
            <IconNotes className="size-4 shrink-0 text-muted-foreground" />
            <span>
              Reason:{" "}
              <strong className="font-medium text-foreground">
                {appointment.reasonForVisit ?? "General visit"}
              </strong>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
