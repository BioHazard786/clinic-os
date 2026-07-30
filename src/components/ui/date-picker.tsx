"use client";

import { IconCalendar } from "@tabler/icons-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatOrdinalDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  date?: string | Date;
  onDateChange?: (dateStr: string) => void;
  className?: string;
  placeholder?: string;
}

export function DatePicker({
  date: value,
  onDateChange,
  className,
  placeholder = "Pick a date",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  });

  React.useEffect(() => {
    if (value === undefined) return;
    if (value instanceof Date) {
      setInternalDate(value);
    } else {
      const [year, month, day] = value.split("-").map(Number);
      setInternalDate(new Date(year, month - 1, day));
    }
  }, [value]);

  const handleSelect = React.useCallback(
    (selected: Date | undefined) => {
      setInternalDate(selected);
      if (selected && onDateChange) {
        const year = selected.getFullYear();
        const month = String(selected.getMonth() + 1).padStart(2, "0");
        const day = String(selected.getDate()).padStart(2, "0");
        onDateChange(`${year}-${month}-${day}`);
      }
      setOpen(false);
    },
    [onDateChange]
  );

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            className={cn(
              "h-8 justify-start gap-2 font-medium text-xs shadow-xs",
              !internalDate && "text-muted-foreground",
              className
            )}
            variant="outline"
          >
            <IconCalendar className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {internalDate ? formatOrdinalDate(internalDate) : placeholder}
            </span>
          </Button>
        }
      />
      <PopoverContent align="center" className="w-auto p-0">
        <Calendar
          defaultMonth={internalDate}
          mode="single"
          onSelect={handleSelect}
          selected={internalDate}
        />
      </PopoverContent>
    </Popover>
  );
}
