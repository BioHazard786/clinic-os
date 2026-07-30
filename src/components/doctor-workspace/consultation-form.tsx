"use client";

import { IconClipboardCheck, IconStethoscope } from "@tabler/icons-react";
import { useCallback, useState, useTransition } from "react";
import {
  type AppointmentWithPatient,
  completeConsultation,
} from "@/app/actions/doctor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

export function ConsultationForm({
  appointment,
}: {
  appointment: AppointmentWithPatient;
}) {
  const [isSubmitting, startSubmitTransition] = useTransition();

  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [prescription, setPrescription] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleDiagnosisChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setDiagnosis(e.target.value),
    []
  );
  const handleSymptomsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSymptoms(e.target.value),
    []
  );
  const handlePrescriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setPrescription(e.target.value),
    []
  );
  const handleDoctorNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setDoctorNotes(e.target.value),
    []
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setFormError(null);
      setFormSuccess(false);

      startSubmitTransition(async () => {
        const result = await completeConsultation({
          appointmentId: appointment.id,
          diagnosis,
          doctorNotes,
          patientId: appointment.patient.id,
          prescription,
          symptoms,
        });

        if (result.success) {
          setFormSuccess(true);
          setDiagnosis("");
          setSymptoms("");
          setPrescription("");
          setDoctorNotes("");
        } else {
          setFormError(result.error ?? "Something went wrong.");
        }
      });
    },
    [appointment, diagnosis, symptoms, prescription, doctorNotes]
  );

  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconStethoscope className="size-5 text-primary" />
          Consultation
        </CardTitle>
        <CardDescription>
          Record findings and complete the visit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="diagnosis">Diagnosis</FieldLabel>
                <Input
                  disabled={isSubmitting}
                  id="diagnosis"
                  onChange={handleDiagnosisChange}
                  placeholder="e.g. Upper respiratory infection"
                  value={diagnosis}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="symptoms">Symptoms</FieldLabel>
                <Input
                  disabled={isSubmitting}
                  id="symptoms"
                  onChange={handleSymptomsChange}
                  placeholder="e.g. Fever, cough, sore throat"
                  value={symptoms}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="prescription">Prescription</FieldLabel>
              <Textarea
                disabled={isSubmitting}
                id="prescription"
                onChange={handlePrescriptionChange}
                placeholder="Medications, dosage, and instructions..."
                rows={3}
                value={prescription}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="doctorNotes">Doctor Notes</FieldLabel>
              <Textarea
                disabled={isSubmitting}
                id="doctorNotes"
                onChange={handleDoctorNotesChange}
                placeholder="Additional observations, follow-up recommendations..."
                rows={3}
                value={doctorNotes}
              />
            </Field>
          </FieldGroup>

          {Boolean(formError) && (
            <div
              className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-destructive text-sm"
              role="alert"
            >
              {formError}
            </div>
          )}

          {Boolean(formSuccess) && (
            <div
              className="mt-4 rounded-md bg-primary/10 px-3 py-2 text-primary text-sm"
              role="status"
            >
              Consultation completed successfully.
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <Button disabled={isSubmitting} size="lg" type="submit">
              {isSubmitting ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Completing…
                </>
              ) : (
                <>
                  <IconClipboardCheck data-icon="inline-start" />
                  Complete Consultation
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
