"use client";

import { IconCalendarEvent, IconCheck, IconClock } from "@tabler/icons-react";
import { useCallback, useState, useTransition } from "react";
import {
  bookAppointment,
  getAvailableSlots,
  type TimeSlot,
} from "@/app/actions/patient";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { formatTime12h, getLocalDateString } from "@/lib/format";
import { cn } from "@/lib/utils";

const MAX_REASON_LENGTH = 500;

function SlotButton({
  slot,
  isSelected,
  onSelect,
}: {
  slot: TimeSlot;
  isSelected: boolean;
  onSelect: (slot: TimeSlot) => void;
}) {
  const handleClick = useCallback(() => {
    onSelect(slot);
  }, [slot, onSelect]);

  let variant: "default" | "outline" | "ghost";
  if (isSelected) {
    variant = "default";
  } else if (slot.available) {
    variant = "outline";
  } else {
    variant = "ghost";
  }

  return (
    <Button
      className={cn(
        "h-9 font-medium text-xs transition-all",
        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      disabled={!slot.available}
      onClick={handleClick}
      size="sm"
      variant={variant}
    >
      {formatTime12h(slot.startTime)}
    </Button>
  );
}

export default function BookAppointmentPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState("");
  const [isSlotsLoading, startSlotsTransition] = useTransition();
  const [isBooking, startBookingTransition] = useTransition();
  const [isBooked, setIsBooked] = useState(false);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setIsBooked(false);

    if (!date) {
      setSlots([]);
      return;
    }

    const dateString = getLocalDateString(date);

    startSlotsTransition(async () => {
      const result = await getAvailableSlots(dateString);
      setSlots(result);
    });
  }, []);

  const handleSlotSelect = useCallback((slot: TimeSlot) => {
    setSelectedSlot(slot);
  }, []);

  const handleReasonChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setReason(e.target.value);
    },
    []
  );

  const handleBook = useCallback(() => {
    if (!(selectedDate && selectedSlot)) {
      return;
    }

    startBookingTransition(async () => {
      const result = await bookAppointment({
        date: getLocalDateString(selectedDate),
        endTime: selectedSlot.endTime,
        reasonForVisit: reason,
        startTime: selectedSlot.startTime,
      });

      if (result.success) {
        toast.add({
          description: `${formatTime12h(selectedSlot.startTime)} on ${selectedDate.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}`,
          title: "Appointment booked!",
          type: "success",
        });
        setIsBooked(true);
        setSelectedSlot(null);
        setReason("");

        // Refresh slots to reflect new booking
        const dateString = getLocalDateString(selectedDate);
        const refreshed = await getAvailableSlots(dateString);
        setSlots(refreshed);
      } else {
        toast.add({
          description: result.error ?? "Something went wrong.",
          priority: "high",
          type: "error",
        });
      }
    });
  }, [selectedDate, selectedSlot, reason]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const availableCount = slots.filter((s) => s.available).length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="font-heading font-semibold text-2xl tracking-tight">
          Book an Appointment
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Choose a date and time that works for you.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* ── Step 1: Calendar ──────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCalendarEvent className="size-4 text-primary" />
              Select a Date
            </CardTitle>
            <CardDescription>
              Pick a day for your visit. Past dates are disabled.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              disabled={{ before: today }}
              mode="single"
              onSelect={handleDateSelect}
              selected={selectedDate}
            />
          </CardContent>
        </Card>

        {/* ── Step 2: Time Slots ────────────────────────────── */}
        {selectedDate ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconClock className="size-4 text-primary" />
                Choose a Time
              </CardTitle>
              <CardDescription>
                {isSlotsLoading
                  ? "Loading available slots…"
                  : `${availableCount} slot${availableCount === 1 ? "" : "s"} available on ${selectedDate.toLocaleDateString("en-US", { day: "numeric", month: "long" })}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSlotsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="size-5" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {slots.map((slot) => (
                    <SlotButton
                      isSelected={selectedSlot?.startTime === slot.startTime}
                      key={slot.startTime}
                      onSelect={handleSlotSelect}
                      slot={slot}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* ── Step 3: Reason for Visit ─────────────────────── */}
        {selectedSlot ? (
          <Card>
            <CardHeader>
              <CardTitle>Reason for Visit</CardTitle>
              <CardDescription>
                Briefly describe your symptoms or reason.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Textarea
                maxLength={MAX_REASON_LENGTH}
                onChange={handleReasonChange}
                placeholder="e.g., Fever and cough for 2 days"
                rows={3}
                value={reason}
              />
              <p className="text-right text-muted-foreground text-xs">
                {reason.length}/{MAX_REASON_LENGTH}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* ── Step 4: Confirm ──────────────────────────────── */}
        {selectedSlot ? (
          <div className="flex items-center justify-between rounded-xl border bg-card p-4">
            <div className="flex flex-col gap-0.5">
              <p className="font-medium text-sm">
                {selectedDate?.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-muted-foreground text-sm">
                {formatTime12h(selectedSlot.startTime)} –{" "}
                {formatTime12h(selectedSlot.endTime)}
              </p>
            </div>

            <Button
              disabled={isBooking || !reason.trim()}
              onClick={handleBook}
              size="lg"
            >
              {isBooking ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Booking…
                </>
              ) : (
                <>
                  <IconCheck data-icon="inline-start" />
                  Confirm Booking
                </>
              )}
            </Button>
          </div>
        ) : null}

        {/* ── Success Message ──────────────────────────────── */}
        {isBooked ? (
          <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <IconCheck className="size-4" />
            </div>
            <div>
              <p className="font-medium text-sm">
                Appointment booked successfully!
              </p>
              <p className="text-muted-foreground text-sm">
                View it on your{" "}
                <a
                  className="text-primary underline underline-offset-4"
                  href="/my-appointments"
                >
                  appointments page
                </a>
                .
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
