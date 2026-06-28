import { format, parseISO, differenceInCalendarDays } from 'date-fns';

/**
 * Format an ISO date string for display (e.g. "Jun 25, 2026")
 */
export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

/**
 * Format an ISO datetime string (e.g. "Jun 25, 2026 at 10:30 AM")
 */
export function formatDateTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return dateStr;
  }
}

/**
 * Convert a JS Date object to an ISO date-only string ("yyyy-MM-dd")
 * This is the format expected by the Spring Boot LocalDate fields.
 */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get today's date as ISO string
 */
export function todayISO(): string {
  return toISODate(new Date());
}

/**
 * Get a date N days from today as ISO string
 */
export function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/**
 * Number of nights between two ISO date strings
 */
export function nightsBetween(checkIn: string, checkOut: string): number {
  try {
    return Math.max(0, differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn)));
  } catch {
    return 0;
  }
}
