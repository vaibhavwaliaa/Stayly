"use client";

import { Calendar } from "@/components/ui/calendar";
import type { DateRange, Matcher } from "react-day-picker";
import type { AvailabilityRange } from "@/lib/types";
import { parseISO, isBefore, startOfDay } from "date-fns";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  availability: AvailabilityRange[] | undefined;
}

export default function DateRangePicker({
  dateRange,
  onSelect,
  availability,
}: DateRangePickerProps) {
  const today = startOfDay(new Date());

  // Map booked ranges from backend to react-day-picker disabled matchers
  const disabledMatchers: Matcher[] = [
    { before: today }, // Disable past dates
  ];

  if (availability && availability.length > 0) {
    availability.forEach((item) => {
      try {
        const from = parseISO(item.check_in);
        const to = parseISO(item.check_out);
        disabledMatchers.push({ from, to });
      } catch {
        // Skip invalid date format
      }
    });
  }

  return (
    <div className="p-2 border rounded-2xl bg-card">
      <Calendar
        mode="range"
        selected={dateRange}
        onSelect={onSelect}
        numberOfMonths={1}
        disabled={disabledMatchers}
        className="mx-auto"
      />
    </div>
  );
}
