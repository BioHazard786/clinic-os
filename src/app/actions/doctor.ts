"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { appointments, medicalRecords, users } from "@/db/schema";
import { getLocalDateString } from "@/lib/format";
import { requireRole } from "@/lib/get-session";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AppointmentWithPatient {
  date: string;
  endTime: string;
  id: string;
  patient: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  reasonForVisit: string | null;
  startTime: string;
  status:
    | "scheduled"
    | "checked_in"
    | "in_consultation"
    | "completed"
    | "cancelled";
}

export interface MedicalRecord {
  appointment: {
    date: string;
    reasonForVisit: string | null;
  };
  createdAt: Date;
  diagnosis: string | null;
  doctorNotes: string | null;
  id: string;
  prescription: string | null;
  symptoms: string | null;
}

// ─── Server Actions ──────────────────────────────────────────────────────────

/**
 * Fetch all appointments for a specific date (defaults to today), sorted so
 * checked_in patients appear first, followed by scheduled, completed, etc.
 */
export async function getTodayAppointments(
  dateString?: string
): Promise<AppointmentWithPatient[]> {
  await requireRole("doctor");

  const queryDate = dateString || getLocalDateString();

  const rows = await db
    .select({
      date: appointments.date,
      endTime: appointments.endTime,
      id: appointments.id,
      patientEmail: users.email,
      patientId: users.id,
      patientImage: users.image,
      patientName: users.name,
      reasonForVisit: appointments.reasonForVisit,
      startTime: appointments.startTime,
      status: appointments.status,
    })
    .from(appointments)
    .innerJoin(users, eq(appointments.patientId, users.id))
    .where(eq(appointments.date, queryDate))
    .orderBy(
      sql`CASE ${appointments.status}
        WHEN 'checked_in' THEN 0
        WHEN 'in_consultation' THEN 1
        WHEN 'scheduled' THEN 2
        WHEN 'completed' THEN 3
        WHEN 'cancelled' THEN 4
        ELSE 5
      END`,
      appointments.startTime
    );

  return rows.map((row) => ({
    date: row.date,
    endTime: row.endTime,
    id: row.id,
    patient: {
      email: row.patientEmail,
      id: row.patientId,
      image: row.patientImage,
      name: row.patientName,
    },
    reasonForVisit: row.reasonForVisit,
    startTime: row.startTime,
    status: row.status,
  }));
}

/**
 * Fetch all past medical records for a given patient,
 * ordered by creation date descending.
 */
export async function getPatientHistory(
  patientId: string
): Promise<MedicalRecord[]> {
  await requireRole("doctor");

  const rows = await db
    .select({
      appointmentDate: appointments.date,
      appointmentReason: appointments.reasonForVisit,
      createdAt: medicalRecords.createdAt,
      diagnosis: medicalRecords.diagnosis,
      doctorNotes: medicalRecords.doctorNotes,
      id: medicalRecords.id,
      prescription: medicalRecords.prescription,
      symptoms: medicalRecords.symptoms,
    })
    .from(medicalRecords)
    .innerJoin(appointments, eq(medicalRecords.appointmentId, appointments.id))
    .where(eq(medicalRecords.patientId, patientId))
    .orderBy(desc(medicalRecords.createdAt));

  return rows.map((row) => ({
    appointment: {
      date: row.appointmentDate,
      reasonForVisit: row.appointmentReason,
    },
    createdAt: row.createdAt,
    diagnosis: row.diagnosis,
    doctorNotes: row.doctorNotes,
    id: row.id,
    prescription: row.prescription,
    symptoms: row.symptoms,
  }));
}

/**
 * Complete a consultation: insert a medical record and mark the appointment
 * as completed.
 */
export async function completeConsultation(data: {
  appointmentId: string;
  patientId: string;
  diagnosis: string;
  symptoms: string;
  prescription: string;
  doctorNotes: string;
}): Promise<{ success: boolean; error?: string }> {
  await requireRole("doctor");

  const {
    appointmentId,
    patientId,
    diagnosis,
    symptoms,
    prescription,
    doctorNotes,
  } = data;

  if (!(appointmentId && patientId)) {
    return { error: "Missing appointment or patient ID.", success: false };
  }

  if (!(diagnosis.trim() || symptoms.trim())) {
    return {
      error: "Please provide at least a diagnosis or symptoms.",
      success: false,
    };
  }

  try {
    // Verify the appointment exists and belongs to this patient
    const [appointment] = await db
      .select({ id: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.id, appointmentId),
          eq(appointments.patientId, patientId)
        )
      )
      .limit(1);

    if (!appointment) {
      return { error: "Appointment not found.", success: false };
    }

    // Insert medical record
    await db.insert(medicalRecords).values({
      appointmentId,
      diagnosis: diagnosis.trim() || null,
      doctorNotes: doctorNotes.trim() || null,
      id: crypto.randomUUID(),
      patientId,
      prescription: prescription.trim() || null,
      symptoms: symptoms.trim() || null,
    });

    // Mark appointment as completed
    await db
      .update(appointments)
      .set({ status: "completed" })
      .where(eq(appointments.id, appointmentId));

    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to complete consultation.", success: false };
  }
}
