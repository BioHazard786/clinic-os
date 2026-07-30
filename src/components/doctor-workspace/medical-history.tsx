import { IconClipboardCheck, IconPill } from "@tabler/icons-react";
import type { MedicalRecord } from "@/app/actions/doctor";
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/reui/timeline";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "./utils";

// ─── Internal Sub-Components ─────────────────────────────────────────────────

function HistoryLoading() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-3/4" />
    </div>
  );
}

function HistoryEmpty() {
  return (
    <Empty className="py-8">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconClipboardCheck />
        </EmptyMedia>
        <EmptyTitle>No prior medical history</EmptyTitle>
        <EmptyDescription>
          This is the first visit for this patient.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function RecordCard({ record }: { record: MedicalRecord }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-3.5 shadow-xs transition-colors hover:border-border">
      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <span className="font-semibold text-sm">
          {record.diagnosis ?? "No diagnosis recorded"}
        </span>
      </div>
      <p className="mt-0.5 text-muted-foreground text-xs">
        Visit reason: {record.appointment.reasonForVisit ?? "General visit"}
      </p>

      <div className="mt-3 flex flex-col gap-2.5 text-xs sm:text-sm">
        {Boolean(record.symptoms) && (
          <div className="text-foreground/90">
            <span className="font-medium text-muted-foreground">Symptoms:</span>{" "}
            {record.symptoms}
          </div>
        )}
        {Boolean(record.prescription) && (
          <div className="flex items-start gap-2 rounded-md border border-border/40 bg-accent/40 p-2.5 text-foreground">
            <IconPill className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="flex flex-col gap-0.5">
              <span className="block font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
                Prescription
              </span>
              <span className="text-xs sm:text-sm">{record.prescription}</span>
            </div>
          </div>
        )}
        {Boolean(record.doctorNotes) && (
          <div className="rounded-md bg-muted/60 p-2.5 text-muted-foreground text-xs italic">
            &ldquo;{record.doctorNotes}&rdquo;
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineView({ records }: { records: MedicalRecord[] }) {
  return (
    <Timeline defaultValue={1}>
      {records.map((record, index) => (
        <TimelineItem key={record.id} step={index + 1}>
          <TimelineSeparator />
          <TimelineIndicator
            className={
              index === 0
                ? "border-primary bg-primary/20"
                : "border-border bg-muted"
            }
          />
          <TimelineDate>{formatDate(record.createdAt)}</TimelineDate>
          <TimelineTitle>
            {record.diagnosis ?? "No diagnosis recorded"}
          </TimelineTitle>
          <TimelineContent>
            <RecordCard record={record} />
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

function DiagnosesView({ records }: { records: MedicalRecord[] }) {
  const withDiagnosis = records.filter((r) => r.diagnosis);

  return (
    <div className="flex flex-col gap-3">
      {withDiagnosis.map((record) => (
        <div
          className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-xs"
          key={record.id}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="font-semibold text-sm">{record.diagnosis}</span>
            {Boolean(record.symptoms) && (
              <span className="text-muted-foreground text-xs">
                Symptoms: {record.symptoms}
              </span>
            )}
          </div>
          <Badge className="shrink-0 font-normal text-xs" variant="outline">
            {formatDate(record.createdAt)}
          </Badge>
        </div>
      ))}
      {withDiagnosis.length === 0 && (
        <p className="py-4 text-center text-muted-foreground text-sm">
          No diagnoses recorded yet.
        </p>
      )}
    </div>
  );
}

function PrescriptionsView({ records }: { records: MedicalRecord[] }) {
  const withPrescription = records.filter((r) => r.prescription);

  return (
    <div className="flex flex-col gap-3">
      {withPrescription.map((record) => (
        <div
          className="flex items-start gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-xs"
          key={record.id}
        >
          <IconPill className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="font-semibold text-sm">{record.prescription}</span>
            <span className="text-muted-foreground text-xs">
              {formatDate(record.createdAt)}
              {Boolean(record.diagnosis) && ` — ${record.diagnosis}`}
            </span>
          </div>
        </div>
      ))}
      {withPrescription.length === 0 && (
        <p className="py-4 text-center text-muted-foreground text-sm">
          No prescriptions recorded yet.
        </p>
      )}
    </div>
  );
}

// ─── Exported Component ──────────────────────────────────────────────────────

export function MedicalHistory({
  history,
  isLoading,
}: {
  history: MedicalRecord[];
  isLoading: boolean;
}) {
  let content: React.ReactNode;
  if (isLoading) {
    content = <HistoryLoading />;
  } else if (history.length === 0) {
    content = <HistoryEmpty />;
  } else {
    content = (
      <Tabs defaultValue="timeline">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="diagnoses">Diagnoses</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-4" value="timeline">
          <TimelineView records={history} />
        </TabsContent>

        <TabsContent className="mt-4" value="diagnoses">
          <DiagnosesView records={history} />
        </TabsContent>

        <TabsContent className="mt-4" value="prescriptions">
          <PrescriptionsView records={history} />
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-semibold text-base">
          <IconClipboardCheck className="size-5 text-primary" />
          Medical History
        </CardTitle>
        <CardDescription>
          Past diagnoses, prescriptions, and notes
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
