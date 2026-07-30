import { getTodayAppointments } from "@/app/actions/doctor";
import { DoctorWorkspace } from "@/components/doctor-workspace/doctor-workspace";

export default async function DashboardPage() {
  const appointments = await getTodayAppointments();

  return <DoctorWorkspace initialAppointments={appointments} />;
}
