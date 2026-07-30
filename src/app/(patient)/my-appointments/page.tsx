import { IconCalendarEvent } from "@tabler/icons-react";
import { getMyAppointments } from "@/app/actions/patient";
import { AppointmentCard } from "@/components/patient/appointment-card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default async function MyAppointmentsPage() {
  const appointments = await getMyAppointments();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-heading font-semibold text-2xl tracking-tight">
          My Appointments
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          View your upcoming and past appointments. Check in when it&apos;s time
          for your visit.
        </p>
      </div>

      {appointments.length === 0 ? (
        <Empty className="mt-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconCalendarEvent />
            </EmptyMedia>
            <EmptyTitle>No appointments yet</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t booked any appointments.{" "}
              <a href="/book">Book your first visit</a> to get started.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          {appointments.map((appointment) => (
            <AppointmentCard appointment={appointment} key={appointment.id} />
          ))}
        </div>
      )}
    </div>
  );
}
