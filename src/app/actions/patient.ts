"use server";

import { and, desc, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { getLocalDateString } from "@/lib/format";
import { requireRole } from "@/lib/get-session";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TimeSlot {
  available: boolean;
  endTime: string;
  startTime: string;
}

export interface PatientAppointment {
  date: string;
  endTime: string;
  id: string;
  reasonForVisit: string | null;
  startTime: string;
  status:
    | "scheduled"
    | "checked_in"
    | "in_consultation"
    | "completed"
    | "cancelled";
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CLINIC_START_HOUR = 9;
const CLINIC_END_HOUR = 17;
const SLOT_DURATION_MINUTES = 20;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateAllSlots(): { startTime: string; endTime: string }[] {
  const slots: { startTime: string; endTime: string }[] = [];

  for (
    let minutes = CLINIC_START_HOUR * 60;
    minutes < CLINIC_END_HOUR * 60;
    minutes += SLOT_DURATION_MINUTES
  ) {
    const startHour = Math.floor(minutes / 60);
    const startMin = minutes % 60;
    const endMinutes = minutes + SLOT_DURATION_MINUTES;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;

    const pad = (n: number): string => n.toString().padStart(2, "0");

    slots.push({
      endTime: `${pad(endHour)}:${pad(endMin)}`,
      startTime: `${pad(startHour)}:${pad(startMin)}`,
    });
  }

  return slots;
}

// ─── Server Actions ──────────────────────────────────────────────────────────

/**
 * Get available time slots for a specific date.
 * Returns all clinic slots with availability status.
 */
export async function getAvailableSlots(
  dateString: string
): Promise<TimeSlot[]> {
  await requireRole("patient");

  // Fetch all non-cancelled appointments for the date
  const bookedAppointments = await db
    .select({
      endTime: appointments.endTime,
      startTime: appointments.startTime,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.date, dateString),
        ne(appointments.status, "cancelled")
      )
    );

  const bookedStartTimes = new Set(bookedAppointments.map((a) => a.startTime));

  const allSlots = generateAllSlots();

  return allSlots.map((slot) => ({
    available: !bookedStartTimes.has(slot.startTime),
    endTime: slot.endTime,
    startTime: slot.startTime,
  }));
}

/**
 * Book a new appointment for the authenticated patient.
 * Prevents double-booking by checking for conflicts before inserting.
 */
export async function bookAppointment(data: {
  date: string;
  endTime: string;
  reasonForVisit: string;
  startTime: string;
}): Promise<{ error?: string; success: boolean }> {
  const session = await requireRole("patient");

  const { date, endTime, reasonForVisit, startTime } = data;

  if (!(date && startTime && endTime)) {
    return { error: "Please select a date and time slot.", success: false };
  }

  if (!reasonForVisit.trim()) {
    return {
      error: "Please provide a reason for your visit.",
      success: false,
    };
  }

  try {
    // Re-check for conflicts (race condition guard)
    const [conflict] = await db
      .select({ id: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.date, date),
          eq(appointments.startTime, startTime),
          ne(appointments.status, "cancelled")
        )
      )
      .limit(1);

    if (conflict) {
      return {
        error: "This time slot was just booked. Please choose another.",
        success: false,
      };
    }

    await db.insert(appointments).values({
      date,
      endTime,
      id: crypto.randomUUID(),
      patientId: session.user.id,
      reasonForVisit: reasonForVisit.trim(),
      startTime,
      status: "scheduled",
    });

    revalidatePath("/book");
    revalidatePath("/my-appointments");

    return { success: true };
  } catch {
    return { error: "Failed to book appointment.", success: false };
  }
}

/**
 * Self check-in for an appointment.
 * Validates ownership, date (must be today), and current status.
 */
export async function selfCheckIn(
  appointmentId: string
): Promise<{ error?: string; success: boolean }> {
  const session = await requireRole("patient");

  try {
    const [appointment] = await db
      .select({
        date: appointments.date,
        id: appointments.id,
        patientId: appointments.patientId,
        status: appointments.status,
      })
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment) {
      return { error: "Appointment not found.", success: false };
    }

    if (appointment.patientId !== session.user.id) {
      return { error: "Unauthorized.", success: false };
    }

    const today = getLocalDateString();

    if (appointment.date !== today) {
      return {
        error: "You can only check in on the day of your appointment.",
        success: false,
      };
    }

    if (appointment.status !== "scheduled") {
      return {
        error: "This appointment cannot be checked into.",
        success: false,
      };
    }

    await db
      .update(appointments)
      .set({ status: "checked_in" })
      .where(eq(appointments.id, appointmentId));

    revalidatePath("/dashboard");
    revalidatePath("/my-appointments");

    return { success: true };
  } catch {
    return { error: "Failed to check in.", success: false };
  }
}

/**
 * Fetch all appointments for the authenticated patient,
 * ordered by date descending, then start time ascending.
 */
export async function getMyAppointments(): Promise<PatientAppointment[]> {
  const session = await requireRole("patient");

  const rows = await db
    .select({
      date: appointments.date,
      endTime: appointments.endTime,
      id: appointments.id,
      reasonForVisit: appointments.reasonForVisit,
      startTime: appointments.startTime,
      status: appointments.status,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.patientId, session.user.id),
        ne(appointments.status, "cancelled")
      )
    )
    .orderBy(desc(appointments.date), appointments.startTime);

  return rows;
}
