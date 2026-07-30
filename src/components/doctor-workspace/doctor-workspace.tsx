"use client";

import {
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
  IconUserScan,
} from "@tabler/icons-react";
import { useCallback, useState, useTransition } from "react";
import {
  type AppointmentWithPatient,
  getPatientHistory,
  getTodayAppointments,
  type MedicalRecord,
} from "@/app/actions/doctor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { formatOrdinalDate, getLocalDateString } from "@/lib/format";
import { ConsultationForm } from "./consultation-form";
import { MedicalHistory } from "./medical-history";
import { PatientOverview } from "./patient-overview";
import { PatientQueueItem } from "./patient-queue-item";

export function DoctorWorkspace({
  initialAppointments,
}: {
  initialAppointments: AppointmentWithPatient[];
}) {
  const todayStr = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [appointments, setAppointments] =
    useState<AppointmentWithPatient[]>(initialAppointments);
  const [activeAppointment, setActiveAppointment] =
    useState<AppointmentWithPatient | null>(null);
  const [history, setHistory] = useState<MedicalRecord[]>([]);
  const [isLoadingHistory, startHistoryTransition] = useTransition();
  const [isFetchingAppointments, startAppointmentsTransition] = useTransition();

  const fetchAppointmentsForDate = useCallback((dateStr: string) => {
    setSelectedDate(dateStr);
    setActiveAppointment(null);
    setHistory([]);

    startAppointmentsTransition(async () => {
      const result = await getTodayAppointments(dateStr);
      setAppointments(result);
    });
  }, []);

  const handleStepDay = useCallback(
    (days: number) => {
      const [year, month, day] = selectedDate.split("-").map(Number);
      const current = new Date(year, month - 1, day);
      current.setDate(current.getDate() + days);
      const nextDateStr = getLocalDateString(current);
      fetchAppointmentsForDate(nextDateStr);
    },
    [selectedDate, fetchAppointmentsForDate]
  );

  const handlePrevDay = useCallback(() => {
    handleStepDay(-1);
  }, [handleStepDay]);

  const handleNextDay = useCallback(() => {
    handleStepDay(1);
  }, [handleStepDay]);

  const handleGoToToday = useCallback(() => {
    fetchAppointmentsForDate(todayStr);
  }, [fetchAppointmentsForDate, todayStr]);

  const selectPatient = useCallback((appointment: AppointmentWithPatient) => {
    setActiveAppointment(appointment);

    startHistoryTransition(async () => {
      const records = await getPatientHistory(appointment.patient.id);
      setHistory(records);
    });
  }, []);

  const isToday = selectedDate === todayStr;

  let queueContent: React.ReactNode;
  if (isFetchingAppointments) {
    queueContent = (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-6 text-primary" />
      </div>
    );
  } else if (appointments.length === 0) {
    queueContent = (
      <Empty className="mt-8">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconCalendarEvent />
          </EmptyMedia>
          <EmptyTitle>No appointments</EmptyTitle>
          <EmptyDescription>
            There are no patients scheduled for{" "}
            {formatOrdinalDate(selectedDate)}.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  } else {
    queueContent = (
      <div className="flex flex-col gap-2">
        {appointments.map((appointment) => (
          <PatientQueueItem
            appointment={appointment}
            isActive={activeAppointment?.id === appointment.id}
            key={appointment.id}
            onSelect={selectPatient}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid h-auto grid-cols-1 gap-6 lg:h-[calc(100dvh-6.5rem)] lg:grid-cols-[380px_1fr]">
      {/* ── Left Column: Queue ────────────────────────────── */}
      <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b p-4 pb-3">
          <div className="flex items-center justify-between">
            <h1 className="font-heading font-semibold text-lg tracking-tight">
              {isToday ? "Today's Queue" : "Patient Queue"}
            </h1>
            <Badge
              className="ml-auto font-medium tabular-nums"
              variant="secondary"
            >
              {appointments.length}{" "}
              {appointments.length === 1 ? "patient" : "patients"}
            </Badge>
          </div>

          {/* Date controls */}
          <div className="flex items-center gap-1.5">
            <Button
              aria-label="Previous day"
              className="size-8 shrink-0"
              onClick={handlePrevDay}
              size="icon"
              variant="outline"
            >
              <IconChevronLeft className="size-4" />
            </Button>

            <DatePicker
              className="flex-1"
              date={selectedDate}
              onDateChange={fetchAppointmentsForDate}
            />

            <Button
              aria-label="Next day"
              className="size-8 shrink-0"
              onClick={handleNextDay}
              size="icon"
              variant="outline"
            >
              <IconChevronRight className="size-4" />
            </Button>

            {!isToday && (
              <Button
                className="h-8 shrink-0 font-medium text-xs"
                onClick={handleGoToToday}
                size="sm"
                variant="ghost"
              >
                Today
              </Button>
            )}
          </div>
        </div>

        {/* Scrollable queue list */}
        <ScrollArea className="min-h-0 flex-1">
          <div className="p-3">{queueContent}</div>
        </ScrollArea>
      </div>

      {/* ── Right Column: Active Patient Workspace ──────── */}
      {activeAppointment ? (
        <ScrollArea className="min-h-0 lg:pr-1 lg:pb-1">
          <div className="flex flex-col gap-5">
            <PatientOverview appointment={activeAppointment} />

            <MedicalHistory history={history} isLoading={isLoadingHistory} />

            {activeAppointment.status !== "completed" &&
              activeAppointment.status !== "cancelled" && (
                <ConsultationForm appointment={activeAppointment} />
              )}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex min-h-[400px] flex-1 items-center justify-center rounded-xl border bg-card shadow-sm">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconUserScan />
              </EmptyMedia>
              <EmptyTitle>Select a patient</EmptyTitle>
              <EmptyDescription>
                Click on a patient from the queue to view their details and
                begin a consultation.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      )}
    </div>
  );
}
