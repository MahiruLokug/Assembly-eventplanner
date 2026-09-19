import type { SchoolEvent } from "./events";

/** Next published start, excluding cancelled, ongoing and past events. */
export function nextUpcomingEvent(events: SchoolEvent[], now: number): SchoolEvent | null {
  let next: SchoolEvent | null = null;
  for (const event of events) {
    const start = Date.parse(event.starts);
    if (event.status !== "published" || !Number.isFinite(start) || start <= now) continue;
    if (!next || start < Date.parse(next.starts) ||
        (start === Date.parse(next.starts) && event.id < next.id)) next = event;
  }
  return next;
}
