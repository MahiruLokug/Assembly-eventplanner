import { database, body, fail, sameOrigin, unavailable } from "@/lib/server";
export async function POST(req: Request) {
  if (!sameOrigin(req)) return fail("Request not allowed", 403);
  let data;
  try {
    data = await body(req);
  } catch {
    return fail("Invalid request");
  }
  const { eventId, role } = data;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email =
    typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  if (
    !name ||
    name.length > 100 ||
    email.length > 200 ||
    !/^\S+@\S+\.\S+$/.test(email) ||
    !["Student", "Teacher", "Parent", "Guest"].includes(role) ||
    typeof eventId !== "string"
  )
    return fail("Please provide a name, valid email and attendee type.");
  try {
    const db = database();
    const event = await db
      .prepare("SELECT * FROM events WHERE id=?")
      .bind(eventId)
      .first();
    if (!event) return fail("Event not found", 404);
    if (
      event.status !== "published" ||
      new Date(String(event.ends)) <= new Date()
    )
      return fail("Registration is closed for this event.");
    const existing = await db
      .prepare("SELECT status FROM registrations WHERE event_id=? AND email=?")
      .bind(eventId, email)
      .first();
    if (existing && existing.status !== "cancelled")
      return fail(
        "This email is already registered. Use My tickets with your saved reference.",
        409,
      );
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const result = await db
      .prepare(
        "INSERT INTO registrations (id,event_id,name,email,role,status,created) SELECT ?,?,?,?,?, 'confirmed',? WHERE (SELECT COUNT(*) FROM registrations WHERE event_id=? AND status IN ('confirmed','checked-in')) < (SELECT capacity FROM events WHERE id=? AND status='published' AND julianday(ends)>julianday('now')) ON CONFLICT(event_id,email) DO UPDATE SET id=excluded.id,name=excluded.name,role=excluded.role,status='confirmed',created=excluded.created WHERE registrations.status='cancelled'",
      )
      .bind(id, eventId, name, email, role, now, eventId, eventId)
      .run();
    if (!result.meta.changes)
      return fail(
        "No places remain, or this email is already registered.",
        409,
      );
    return Response.json(
      { id, name, status: "confirmed" },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return unavailable(e);
  }
}
