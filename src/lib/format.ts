/**
 * Helper to get ordinal suffix for day of month (e.g. 1st, 2nd, 3rd, 26th).
 */
function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return `${day}th`;
  }
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

/**
 * Format a Date object or string into "July 26th, 2026".
 */
export function formatOrdinalDate(date: Date | string): string {
  let d: Date;
  if (typeof date === "string") {
    if (date.includes("T")) {
      d = new Date(date);
    } else if (date.includes("-")) {
      const [year, month, day] = date.split("-").map(Number);
      d = new Date(year, month - 1, day);
    } else {
      d = new Date(date);
    }
  } else {
    d = new Date(date);
  }

  if (Number.isNaN(d.getTime())) {
    return String(date);
  }

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();

  return `${monthName} ${getOrdinalSuffix(day)}, ${year}`;
}

/**
 * Convert a 24-hour time string (e.g., "09:00") to 12-hour format (e.g., "9:00 AM").
 */
export function formatTime12h(time24: string): string {
  if (!time24) {
    return "";
  }
  if (time24.includes("AM") || time24.includes("PM")) {
    return time24;
  }

  const [hourStr, minuteStr] = time24.split(":");
  const hour = Number.parseInt(hourStr, 10);
  if (Number.isNaN(hour)) {
    return time24;
  }

  const period = hour >= 12 ? "PM" : "AM";
  let hour12: number;
  if (hour === 0) {
    hour12 = 12;
  } else if (hour > 12) {
    hour12 = hour - 12;
  } else {
    hour12 = hour;
  }

  return `${hour12}:${minuteStr} ${period}`;
}

/**
 * Format a Date object or current time to YYYY-MM-DD string in local time.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
