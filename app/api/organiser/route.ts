import {
  database,
  body,
  fail,
  sameOrigin,
  unavailable,
  isAdmin,
} from "@/lib/server";
import { categories } from "@/lib/events";
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Request not allowed", 403);
  if (!(await isAdmin())) return fail("Organiser access required", 403);
  let d;
  try {
    d = await body(req);
  } catch {
    return fail("Invalid request");
  }
  try {
    const db = database();
    if (d.action === "event") {
      for (const k of [
        "title",
        "venue",
        "organizer",
        "audience",
        "description",
      ])
        if (
          typeof d[k] !== "string" ||
          !d[k].trim() ||
          d[k].length > (k === "description" ? 4000 : 150)
        )
          return fail("Please complete every event field.");
      if (!categories.slice(1).includes(d.category))
        return fail("Invalid category.");
      const capacity = Number(d.capacity);
      if (!Number.isInteger(capacity) || capacity < 1 || capacity > 10000)
        return fail("Capacity must be between 1 and 10,000.");
      const starts = d.starts + "+05:30",
        ends = d.ends + "+05:30";
      if (
        !Number.isFinite(Date.parse(starts)) ||
        !Number.isFinite(Date.parse(ends)) ||
        new Date(ends) <= new Date(starts)
      )
        return fail("Choose valid dates, with the end after the start.");
      if (d.id) {
        const updated = await db
          .prepare(
            "UPDATE events SET title=?,category=?,starts=?,ends=?,venue=?,organizer=?,description=?,capacity=?,audience=? WHERE id=? AND ? >= (SELECT COUNT(*) FROM registrations WHERE event_id=? AND status IN ('confirmed','checked-in'))",
          )
          .bind(
            d.title.trim(),
            d.category,
            starts,
            ends,
            d.venue.trim(),
            d.organizer.trim(),
            d.description.trim(),
            capacity,
            d.audience.trim(),
            d.id,
            capacity,
            d.id,
          )
          .run();
        if (!updated.meta.changes)
          return fail(
            "The event was not found, or capacity is below the number of booked places.",
          );
      } else
        await db
          .prepare(
            "INSERT INTO events(id,title,category,starts,ends,venue,organizer,description,capacity,status,audience) VALUES(?,?,?,?,?,?,?,?,?,'published',?)",
          )
          .bind(
            crypto.randomUUID(),
            d.title.trim(),
            d.category,
            starts,
            ends,
            d.venue.trim(),
            d.organizer.trim(),
            d.description.trim(),
            capacity,
            d.audience.trim(),
          )
          .run();
      return Response.json({ message: "Event saved." });
    }
    if (d.action === "notice") {
      if (
        typeof d.title !== "string" ||
        !d.title.trim() ||
        d.title.length > 120 ||
        typeof d.body !== "string" ||
        !d.body.trim() ||
        d.body.length > 3000
      )
        return fail("Enter a title and message within the length limits.");
      if (
        d.eventId &&
        !(await db
          .prepare("SELECT id FROM events WHERE id=?")
          .bind(d.eventId)
          .first())
      )
        return fail("Related event not found.");
      await db
        .prepare(
          "INSERT INTO notices(id,title,body,created,event_id) VALUES(?,?,?,?,?)",
        )
        .bind(
          crypto.randomUUID(),
          d.title.trim(),
          d.body.trim(),
          new Date().toISOString(),
          d.eventId || null,
        )
        .run();
      return Response.json({ message: "Announcement published." });
    }
    if (d.action === "cancel") {
      if (typeof d.id !== "string") return fail("Invalid event.");
      const r = await db
        .prepare("UPDATE events SET status='cancelled' WHERE id=?")
        .bind(d.id)
        .run();
      return r.meta.changes
        ? Response.json({
            message:
              "Event cancelled. Ticket holders will see its updated status.",
          })
        : fail("Event not found.", 404);
    }
    if (d.action === "checkin") {
      if (typeof d.id !== "string" || typeof d.eventId !== "string")
        return fail("Enter a ticket reference and event.");
      const ticket = await db
        .prepare(
          "SELECT r.name,r.status,e.status AS event_status FROM registrations r JOIN events e ON e.id=r.event_id WHERE r.id=? AND r.event_id=?",
        )
        .bind(d.id.trim(), d.eventId)
        .first();
      if (!ticket) return fail("Ticket not found for this event.", 404);
      if (ticket.event_status !== "published")
        return fail("This event is cancelled.");
      if (ticket.status !== "confirmed")
        return fail(
          ticket.status === "checked-in"
            ? "This ticket has already been checked in."
            : "This ticket is cancelled.",
        );
      const result = await db
        .prepare(
          "UPDATE registrations SET status='checked-in' WHERE id=? AND event_id=? AND status='confirmed' AND EXISTS (SELECT 1 FROM events WHERE id=? AND status='published')",
        )
        .bind(d.id.trim(), d.eventId, d.eventId)
        .run();
      if (!result.meta.changes)
        return fail(
          "The ticket or event status changed. Please check again.",
          409,
        );
      return Response.json({
        message: `Welcome, ${ticket.name}. Check-in recorded.`,
      });
    }
    return fail("Unknown action.");
  } catch (e) {
    return unavailable(e);
  }
}
