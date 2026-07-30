import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "checked_in",
  "in_consultation",
  "completed",
  "cancelled",
]);

// ─── Better Auth Core Tables (generated via @better-auth/cli) ────────────────

export const users = pgTable("users", {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  id: text("id").primaryKey(),
  image: text("image"),
  name: text("name").notNull(),
  role: text("role").default("patient"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const sessions = pgTable(
  "sessions",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    id: text("id").primaryKey(),
    ipAddress: text("ip_address"),
    token: text("token").notNull().unique(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("sessions_userId_idx").on(table.userId)]
);

export const accounts = pgTable(
  "accounts",
  {
    accessToken: text("access_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    accountId: text("account_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    id: text("id").primaryKey(),
    idToken: text("id_token"),
    password: text("password"),
    providerId: text("provider_id").notNull(),
    refreshToken: text("refresh_token"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("accounts_userId_idx").on(table.userId)]
);

export const verifications = pgTable(
  "verifications",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    value: text("value").notNull(),
  },
  (table) => [index("verifications_identifier_idx").on(table.identifier)]
);

// ─── Better Auth Relations ───────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  appointments: many(appointments),
  medicalRecords: many(medicalRecords),
  sessions: many(sessions),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

// ─── Application Tables ──────────────────────────────────────────────────────

export const appointments = pgTable(
  "appointments",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    date: text("date").notNull(),
    endTime: text("end_time").notNull(),
    id: text("id").primaryKey(),
    patientId: text("patient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reasonForVisit: text("reason_for_visit"),
    startTime: text("start_time").notNull(),
    status: appointmentStatusEnum("status").notNull().default("scheduled"),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("appointments_patientId_idx").on(table.patientId)]
);

export const medicalRecords = pgTable(
  "medical_records",
  {
    appointmentId: text("appointment_id")
      .notNull()
      .references(() => appointments.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    diagnosis: text("diagnosis"),
    doctorNotes: text("doctor_notes"),
    id: text("id").primaryKey(),
    patientId: text("patient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    prescription: text("prescription"),
    symptoms: text("symptoms"),
  },
  (table) => [
    index("medicalRecords_patientId_idx").on(table.patientId),
    index("medicalRecords_appointmentId_idx").on(table.appointmentId),
  ]
);

// ─── Application Relations ───────────────────────────────────────────────────

export const appointmentsRelations = relations(
  appointments,
  ({ one, many }) => ({
    medicalRecords: many(medicalRecords),
    patient: one(users, {
      fields: [appointments.patientId],
      references: [users.id],
    }),
  })
);

export const medicalRecordsRelations = relations(medicalRecords, ({ one }) => ({
  appointment: one(appointments, {
    fields: [medicalRecords.appointmentId],
    references: [appointments.id],
  }),
  patient: one(users, {
    fields: [medicalRecords.patientId],
    references: [users.id],
  }),
}));
