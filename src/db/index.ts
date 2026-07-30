import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  accounts,
  accountsRelations,
  appointmentStatusEnum,
  appointments,
  appointmentsRelations,
  medicalRecords,
  medicalRecordsRelations,
  sessions,
  sessionsRelations,
  users,
  usersRelations,
  verifications,
} from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const client = postgres(connectionString);

export const db = drizzle(client, {
  schema: {
    accounts,
    accountsRelations,
    appointmentStatusEnum,
    appointments,
    appointmentsRelations,
    medicalRecords,
    medicalRecordsRelations,
    sessions,
    sessionsRelations,
    users,
    usersRelations,
    verifications,
  },
});
