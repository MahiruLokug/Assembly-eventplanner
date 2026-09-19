import { database, body, fail, sameOrigin, unavailable } from "@/lib/server";
async function ticket(req: Request, cancel = false) {
  if (!sameOrigin(req)) return fail("Request not allowed", 403);
  let d;
  try {
    d = await body(req);
  } catch {
    return fail("Invalid request");
  }
  if (typeof d.id !== "string" || typeof d.email !== "string")
    return fail("Enter your ticket reference and email.");
  try {
    const db = database();
    const row = await db
      .prepare(
        "SELECT id,event_id,name,status FROM registrations WHERE id=? AND email=?",
      )
      .bind(d.id.trim(), d.email.trim().toLowerCase())
      .first();
    if (!row)
      return fail(
        "No ticket matches those details. Check your reference and email.",
        404,
      );
    if (cancel) {
      if (row.status === "checked-in")
        return fail("A checked-in ticket cannot be cancelled.");
      const updated = await db
        .prepare(
          "UPDATE registrations SET status='cancelled' WHERE id=? AND email=? AND status='confirmed'",
        )
        .bind(d.id.trim(), d.email.trim().toLowerCase())
        .run();
      if (!updated.meta.changes && row.status !== "cancelled")
        return fail("Ticket status changed. Please retrieve it again.", 409);
      return Response.json({ status: "cancelled" });
    }
    const event = await db
      .prepare("SELECT * FROM events WHERE id=?")
      .bind(row.event_id)
      .first();
    return Response.json(
      { ...row, event },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return unavailable(e);
  }
}
export const POST = (req: Request) => ticket(req);
export const DELETE = (req: Request) => ticket(req, true);
